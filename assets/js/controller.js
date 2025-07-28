import * as config from './config.js';

export async function fetchAnime(search_term) {
	try {
	const url = config.url;
	const search = url.concat(`?q=${search_term}`);

	const fetched_anime = await fetch(search);
	const fetch_anime_data = await fetched_anime.json();
	return {fetch_anime_data};
	} catch(fetch_error) {
		console.error(fetch_error);
		throw new Error(`Error: ${fetch_error}`);
	}

};