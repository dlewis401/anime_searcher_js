import {fetched_anime} from './model.js';
import {pagination} from './model.js';
import {gather_anime_data_for_display} from './model.js';

const card = document.querySelector('#card-anime-collection');
export const page_numbers_container = document.querySelector('#page-numbers');
const anime_info_container = document.querySelector('#content');


async function render_pagination(anime_list, page_num) {
	card.innerHTML = ""
	const itemsPerPage = 5;
	const currentPage = page_num;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	const currentSlice = anime_list.slice(startIndex, endIndex);

	currentSlice.forEach(element => {
		const html = `
		<div class="card">
			<p class="name"><strong>${element.title}</strong><p>
			<p class="year"><strong>${element.year || ""}</strong><p>
		</div>`
		card.insertAdjacentHTML('beforeend', html)
	});
	

}

function render_anime_hash(data) {
	card.addEventListener('click', function(e) {
		const cardElement = e.target.closest('.card');
		if (!cardElement) return; 
		const nameElement = cardElement.querySelector('.name');
		if (nameElement) {
			const id = data.findIndex((el) => {
				if (el.title === nameElement.textContent.trim()) {
					let anime_id = el.mal_id;
					window.location.hash = anime_id;
				}
			});
		}
	});
}

function render_anime_list(data) {
	if (!window.location.hash) {
		anime_info_container.insertAdjacentHTML('beforeend', "<p>There is no anime right now</p>")
		return null;
	};
	
	// Removes # from window URL to get the anime ID
	let hash = Number(window.location.hash.trim().split('#')[1]);
	let matched = data.find((individual_anime) => hash === individual_anime.mal_id);

	window.addEventListener("hashchange", (event) => {
		anime_info_container.innerHTML = "";
		// Removes # from window URL to get the anime ID
		let hash = Number(window.location.hash.trim().split('#')[1]);
		let matched = data.find((individual_anime) => hash === individual_anime.mal_id);
		render_anime(matched);
	});
	
	return matched;
};

function if_hash_exists_on_page() {
	window.addEventListener('DOMContentLoaded', () => {
		if (window.location.hash) {
			let data = fetched_anime("japan");
			data.then((anime_result) => {
				let hash = Number(window.location.hash.trim().split('#')[1]);
				let matched = anime_result.find((individual_anime) => hash === individual_anime.mal_id);
				render_anime(matched);
			});
		}
	})
}

function render_anime(anime){
	let html = gather_anime_data_for_display(anime);
	html.then((html_data) => {
		html = html_data.html.trim();
		anime_info_container.insertAdjacentHTML('beforeend', html);
	})
}

// Fetches anime list and then if promise is resolved, generate pagination
if_hash_exists_on_page();

const result = fetched_anime("japan").then((result) => {
	pagination(result);
	render_pagination(result, 1);

	// Event Propagation -> switches page numbers
	document.getElementById('page-numbers').addEventListener('click', function (e) {
	if (e.target.classList.contains('p-num')) {
		const value = e.target.textContent;
		render_pagination(result, value);
	}});

	render_anime_hash(result);
	render_anime_list(result);
});
