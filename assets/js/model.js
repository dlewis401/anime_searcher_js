import {fetchAnime} from './controller.js';
import {page_numbers_container} from './view.js';

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
				<h2>${anime.year ? `${anime.title} (${anime.year})` : anime.title}}</h2>
				<p>${anime.title_japanese}</p>
				<p><strong>Rating: </strong>${anime.rating}</p>
			</div>`

	return {html}
}