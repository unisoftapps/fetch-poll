const _fetch = require('node-fetch');

const defaultFetchOptions = {
	retry: 5,
	delay: [1000, 2000, 5000, 10000, 20000]
};

export class FetchPoll {

	_mergeOptions(opts) {
		let options = Object.assign({}, defaultFetchOptions, opts);
		if (typeof (options.delay) === 'number') {
			const _delayInterval = options.delay;
			let delayArray = [];
			for (let i = 0; i < options.retry; i++) {
				delayArray.push(_delayInterval);
			}
			options.delay = delayArray;
		}

		console.log(typeof (options.delay));
		return options;
	}

	fetch(url, options, validate, onComplete, onCanceled, onFailed) {
		const opts = this._mergeOptions(options);
		//console.log(url, opts);
		const request = new FetchPollRequest(url, opts.retry, opts.delay, validate, onComplete, onCanceled, onFailed);
		request.start(request);
		return request;
	}

}

const doFetch = (request) => {
	_fetch(request.url).then(response => {
		const isValid = request.validate(response, new FetchPollState(request));
		console.log('isvalid', isValid);
		if (!isValid) {
			request.attempt++;
			request.start(request);
		}
		else {
			request.onComplete(response);
		}
		

	}, error => {
		console.error('error fetching url', error);
		request.attempt++;
		request.start(request);
	});
}

export class FetchPollState {
	constructor(request) {
		this.attempt = request.attempt;
		this.cancel = () => {
			request._cancelRequest = true;
		};
	}
}

export class FetchPollRequest {

	constructor(url, retry, delay, validate, complete, oncancel, failed) {

		this.attempt = 0;
		this._cancelRequest = false;

		this.url = url;
		this.retry = retry;
		this.delay = delay;
		this.validate = validate;
		this.onComplete = complete;
		this.onCanceled = oncancel;
		this.onFailed = failed;

	}

	cancel() {
		this._cancelRequest = true;
	}

	start(request) {

		if (request._cancelRequest) {
			request.onCanceled();
			return;
		}

		if (request.attempt > request.retry) {
			console.log("STOP!");
			request.onFailed();
			return;
		}

		// Start immediately if is first attempt!
		if (request.attempt === 0) {
			doFetch(request);
		}

		if (request.attempt !== 0) {
			const wait = request.delay[request.attempt];
			console.log('waiting ' + wait);
			setTimeout(() => {
				doFetch(request);
			}, wait);

		}

		//console.log(request);
		
	}

}
