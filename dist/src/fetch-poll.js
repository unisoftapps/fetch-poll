'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _fetch = require('node-fetch');

var defaultFetchOptions = {
	retry: 5,
	delay: [1000, 2000, 5000, 10000, 20000]
};

var FetchPoll = exports.FetchPoll = function () {
	function FetchPoll() {
		_classCallCheck(this, FetchPoll);
	}

	_createClass(FetchPoll, [{
		key: '_mergeOptions',
		value: function _mergeOptions(opts) {
			var options = Object.assign({}, defaultFetchOptions, opts);
			if (typeof options.delay === 'number') {
				var _delayInterval = options.delay;
				var delayArray = [];
				for (var i = 0; i < options.retry; i++) {
					delayArray.push(_delayInterval);
				}
				options.delay = delayArray;
			}

			console.log(_typeof(options.delay));
			return options;
		}
	}, {
		key: 'fetch',
		value: function fetch(url, options, validate, onComplete, onCanceled, onFailed) {
			var opts = this._mergeOptions(options);
			//console.log(url, opts);
			var request = new FetchPollRequest(url, opts.retry, opts.delay, validate, onComplete, onCanceled, onFailed);
			request.start(request);
			return request;
		}
	}]);

	return FetchPoll;
}();

var doFetch = function doFetch(request) {
	_fetch(request.url).then(function (response) {
		var isValid = request.validate(response, new FetchPollState(request));
		console.log('isvalid', isValid);
		if (!isValid) {
			request.attempt++;
			request.start(request);
		} else {
			request.onComplete(response);
		}
	}, function (error) {
		console.error('error fetching url', error);
		request.attempt++;
		request.start(request);
	});
};

var FetchPollState = exports.FetchPollState = function FetchPollState(request) {
	_classCallCheck(this, FetchPollState);

	this.attempt = request.attempt;
	this.cancel = function () {
		request._cancelRequest = true;
	};
};

var FetchPollRequest = exports.FetchPollRequest = function () {
	function FetchPollRequest(url, retry, delay, validate, complete, oncancel, failed) {
		_classCallCheck(this, FetchPollRequest);

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

	_createClass(FetchPollRequest, [{
		key: 'cancel',
		value: function cancel() {
			this._cancelRequest = true;
		}
	}, {
		key: 'start',
		value: function start(request) {

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
				var wait = request.delay[request.attempt];
				console.log('waiting ' + wait);
				setTimeout(function () {
					doFetch(request);
				}, wait);
			}

			//console.log(request);
		}
	}]);

	return FetchPollRequest;
}();