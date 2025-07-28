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

	if (length > 5) {
		const page_numbers = Math.ceil(length / 5);
		for (let i = 0; i !== page_numbers; i++) {
			page_numbers_container.insertAdjacentHTML('beforeend', `<p class="p-num">${i+1}</p>`)
		}
	} else {
		const page_numbers = 1;
		console.log(page_numbers);
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
				<div id="bookmark">
					<svg class="svg-icon bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M168,224l-56-40L56,224V72a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M88,64V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8V192l-32-22.85" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
				</div>
			</div>`

	return {html}
}

export async function search(query) {
	if (query !== "") {
		const result = await fetchAnime(query);
		return {result}
	} else {
		return "";
	}
}