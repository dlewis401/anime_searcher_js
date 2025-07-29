// Controller: the boss — reacts to events, updates the model, tells the view what to do.

import * as config from './config.js';
const bookmark_container = document.querySelector('#bookmark_container')

export async function fetchAnime(search_term) {
	try {
	const url = config.url;
	const search = url.concat(`?q=${search_term}`);

	const fetched_anime = await fetch(search);
	if (!fetched_anime.ok) throw new Error;
	const fetch_anime_data = await fetched_anime.json();
	return {fetch_anime_data};

	} catch(fetch_error) {
		console.error(fetch_error);
		throw new Error(`Error: ${fetch_error}`);
	}
};

