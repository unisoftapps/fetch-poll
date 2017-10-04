const fetch = require('node-fetch');

import { FetchPoll } from './src/fetch-poll';

const url = 'https://feedsunisoftapps.blob.core.windows.net/conservative-news/wnd.json';

let fetchPoll = new FetchPoll();

const ref = fetchPoll.fetch(url, {retry: 5}, (res, state) => {
	console.log('cb run validation', state);

	if (state.attempt === 2) {
		state.cancel();
		//return true;
	}

	return false;
}, (complete) => {
	console.log('cb COMPLETED');
}, () => {
	console.log('cb CANCELED')
}, (error) => {
	console.log('cb ERROR');
});
// fetch(url).then(response => {
// 	return response.json();
// }).then(json => {
// 	console.log(json);
// });


