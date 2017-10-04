'use strict';

var _fetchPoll = require('./src/fetch-poll');

var fetch = require('node-fetch');

var url = 'https://feedsunisoftapps.blob.core.windows.net/conservative-news/wnd.json';

var fetchPoll = new _fetchPoll.FetchPoll();

var ref = fetchPoll.fetch(url, { retry: 5 }, function (res, state) {
	console.log('cb run validation', state);

	if (state.attempt === 2) {
		state.cancel();
		//return true;
	}

	return false;
}, function (complete) {
	console.log('cb COMPLETED');
}, function () {
	console.log('cb CANCELED');
}, function (error) {
	console.log('cb ERROR');
});
// fetch(url).then(response => {
// 	return response.json();
// }).then(json => {
// 	console.log(json);
// });