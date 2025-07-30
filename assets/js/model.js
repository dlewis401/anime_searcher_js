// Model: handles data — fetching, storing, transforming.

import {fetchAnime} from './controller.js';
import {page_numbers_container} from './view.js';
import {search_bar} from './view.js';

const state = {
	"anime":{},
};

export async function fetched_anime(search_term) {
	try {
		const response = await fetchAnime(search_term);
		state.anime = response.fetch_anime_data.data;
		return state.anime;
	} catch (err) {
		console.error("Failed to fetch anime:", err);
	}
}

// Calculates number of pages
export async function pagination(anime_list) {
	const length = anime_list.length;
	page_numbers_container.innerHTML = ""
	
	if (length > 5) {
		const page_numbers = Math.ceil(length / 5);
		for (let i = 0; i !== page_numbers; i++) {
			page_numbers_container.insertAdjacentHTML('beforeend', `<p class="p-num">${i+1}</p>`)
		}
	} else {
		const page_numbers = 1;
	}
}

// Manipulates Data to display
export async function gather_anime_data_for_display(anime) {
	const html = `
	<div class="anime-box">
				<picture>
					<source srcset=${anime.images.jpg.image_url} type="image/jpeg">
					<source srcset=${anime.images.webp.image_url} type="image/webp">
					<img src=${anime.images.jpg.image_url}>
				</picture>
				<h2>${anime.year ? `${anime.title} (${anime.year})` : anime.title}</h2>
				<p>${anime.title_japanese}</p>
				<p><strong>Rating: </strong>${anime.rating}</p>
				<p><strong>Description: </strong>${anime.synopsis}</p>
				<div id="bookmark">
					<svg class="svg-icon bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M168,224l-56-40L56,224V72a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M88,64V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8V192l-32-22.85" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
				</div>
			</div>`

	return {html}
}

export async function fetch_anime_from_id(anime_hash) {
	const fetch_anime = await fetch(`https://api.jikan.moe/v4/anime/${anime_hash}/full`);
	const anime_json = await fetch_anime.json();
	const anime = anime_json.data;
	return anime
}

export async function gather_bookmark_data(anime_hash) {
	const anime = await fetch_anime_from_id(anime_hash);
	// Strips the synopsis to first sentence only
	let regex_description = anime.synopsis || "No description available.";

	if (anime.synopsis) {
		// Try to match the first sentence (ends in '.', '!' or '?') optionally followed by space or newline
		const match = anime.synopsis.match(/.*?[.!?](\s|$)/);
		if (match && match[0].length > 10) {
			regex_description = match[0];
		}
	}

	const html = `
	<br>
	<div class="anime-card">
		<p class="anime_name"><strong>${`${anime.title} (${anime.mal_id})`}</strong></p>
		<p class="anime-description">${regex_description}</p>
	</div>`

	return html.trim();
}

export async function search(query) {
	if (query !== "") {
		const result = await fetchAnime(query);
		return {result}
	} else {
		return "";
	}
}

