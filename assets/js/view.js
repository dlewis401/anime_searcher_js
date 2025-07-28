import {fetched_anime} from './model.js';
import {pagination} from './model.js';
import {gather_anime_data_for_display} from './model.js';
import {search} from './model.js';

const card = document.querySelector('#card-anime-collection');
export const page_numbers_container = document.querySelector('#page-numbers');
const anime_info_container = document.querySelector('#content');
export const search_bar = document.querySelector('#searchBar');
const search_bar_button = document.querySelector('#search-button');

let bookmarked = [];

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
		localStorage.setItem('last_anime', JSON.stringify(matched));
	});
	
	return matched;
};

function render_anime(anime){
	let html = gather_anime_data_for_display(anime);
	html.then((html_data) => {
		html = html_data.html.trim();
		anime_info_container.insertAdjacentHTML('beforeend', html);
		bookmark_element();
	})
};

function render_last_viewed_anime() {
	let hash = Number(window.location.hash.trim().split('#')[1]);
	if (localStorage.getItem("last_anime")) {
		let last_anime = JSON.parse(localStorage.getItem("last_anime"));
		window.location.hash = last_anime.mal_id;
		render_anime(last_anime);
	} else {
		localStorage.clear();
		return "";
	}
}

function bookmark_element() {
	const bookmark_button = document.querySelectorAll('.bookmark-icon');
	bookmark_button[0].addEventListener('click', (event) => {
		if (bookmark_button[0].classList.toggle('bookmarked')) {
			let last_anime = JSON.parse(localStorage.getItem("last_anime"));
			bookmarked.push(JSON.stringify(last_anime));
			localStorage.setItem('bookmark', bookmarked);
		} else {
			let last_anime = JSON.parse(localStorage.getItem("last_anime"));
			bookmarked.pop(last_anime);
			localStorage.setItem('bookmark', bookmarked);
		}
	})
}

if (localStorage.getItem('last_anime')) {
	render_last_viewed_anime();
}



search_bar_button.addEventListener('click', (e) => {
	let query = search_bar.value;
	const search_result = search(query).then((search_data) => {
		let search_result_data = search_data.result.fetch_anime_data.data;
		pagination(search_result_data);
		render_pagination(search_result_data, 1);

		// Event Propagation -> switches page numbers
		document.getElementById('page-numbers').addEventListener('click', function (e) {
		page-numbers.innerHTML == "";
		if (e.target.classList.contains('p-num')) {
			const value = e.target.textContent;
			render_pagination(search_result_data, value);
		}});

		render_anime_hash(search_result_data);
		render_anime_list(search_result_data);
		bookmark_element();
	});
});


