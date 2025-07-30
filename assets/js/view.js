// View: only touches the DOM — rendering and listening.

import {pagination} from './model.js';
import {gather_anime_data_for_display} from './model.js';
import {gather_bookmark_data} from './model.js';
import {search} from './model.js';
import {fetch_anime_from_id} from './model.js';

const card = document.querySelector('#card-anime-collection');
export const page_numbers_container = document.querySelector('#page-numbers');
const anime_info_container = document.querySelector('#content');
export const search_bar = document.querySelector('#searchBar');
const search_bar_button = document.querySelector('#search-button');
const card_container = document.querySelector('#card-anime-collection');
const anime_bookmark_container = document.querySelector('#anime-bookmark-container')

let bookmarked_anime = JSON.parse(localStorage.getItem('bookmarked_anime')) || [];


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
	window.location.hash = data.mal_id;
};


function render_anime(anime){
	anime_info_container.innerHTML = "";
	let html = gather_anime_data_for_display(anime);
	html.then((html_data) => {
		html = html_data.html.trim();
		anime_info_container.insertAdjacentHTML('beforeend', html);
		check_bookmark();
		bookmark_manager(check_bookmark());
	});
};


function render_anime_list(data) {
	if (!window.location.hash) {
		anime_info_container.insertAdjacentHTML('beforeend', "<p>There is no anime right now</p>");
		return null;
	} else {
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
	}
	
};

function render_last_viewed_anime() {
	if (localStorage.getItem("last_anime") !== "undefined") {
		let last_anime = JSON.parse(localStorage.getItem("last_anime"));
		window.location.hash = last_anime.mal_id;
		render_anime(last_anime);
	} else {
		localStorage.clear();
		window.location.reload();
	}
}

async function fetch_anime_with_id(hash) {
	const anime_from_hash = await fetch(`https://api.jikan.moe/v4/anime/${hash}/full`);
	const anime_result = await anime_from_hash.json();
	const anime_result_data = anime_result.data;
	return anime_result_data
}

function add_bookmark_anime(hash, bookmark_icon) {
	if (bookmarked_anime.length > 0) {
		if (localStorage.getItem('bookmarked_anime')) {
			if (bookmarked_anime.includes(hash)) {
				return true;
			} else {
				bookmarked_anime.push(hash);
				bookmark_icon.classList.toggle('bookmarked') || "";
				localStorage.setItem('bookmarked_anime', JSON.stringify(bookmarked_anime));
			}
	}
		} else {
		bookmarked_anime.push(hash);
		bookmark_icon.classList.toggle('bookmarked') || "";
		localStorage.setItem('bookmarked_anime', JSON.stringify(bookmarked_anime));
	}
}

function remove_bookmark_anime(hash, bookmark_icon) {
	for (let i = bookmarked_anime.length - 1; i >= 0; i--) {
		if (bookmarked_anime[i] === hash) {
			bookmarked_anime.splice(i, 1);
		}
	}

	localStorage.setItem('bookmarked_anime', JSON.stringify(bookmarked_anime));

	bookmark_icon.classList.toggle('bookmarked') || "";

	return bookmarked_anime;
}

function check_bookmark() {
	let hash = Number(window.location.hash.trim().split('#')[1]);
	let bookmarked_anime = JSON.parse(localStorage.getItem('bookmarked_anime')) || [];

	if (bookmarked_anime) {
		if (bookmarked_anime.includes(hash)) {
			const bookmark_icon = anime_info_container.querySelector('.bookmark-icon');
			if (bookmark_icon) {
				bookmark_icon.classList.add('bookmarked');
				return true;
			}
		}
	} else {
	}
	return false;
}

function bookmark_manager(is_it_bookmarked) {
	const bookmark_icon = document.querySelector('.bookmark-icon');
	let hash = Number(window.location.hash.trim().split('#')[1]);
	bookmark_icon.addEventListener('click', (e) => {
		if (!is_it_bookmarked) {
			add_bookmark_anime(hash, bookmark_icon);
			is_it_bookmarked = true;
		} else {
			remove_bookmark_anime(hash, bookmark_icon);
			is_it_bookmarked = false;
		}
		render_bookmark_manager();
	});
}

async function gather_anime_from_bookmark_manager() {
	anime_bookmark_container.addEventListener('click', async (event) => {
		// Gets anime MAL ID from bookmark string
		const anime_hash = Number(event.target.closest('.anime-card').textContent.trim().split('(')[1].split(")")[0].trim());
		const anime_data = await fetch_anime_from_id(anime_hash);
		render_anime_hash(anime_data);
		render_anime(anime_data);
		localStorage.setItem('last_anime', JSON.stringify(anime_data));
	});
}

async function render_bookmark_manager() {
	if (!(bookmarked_anime.length === 0)) {
		anime_bookmark_container.innerHTML = "";
		for (const anime_hash of bookmarked_anime) {
		const html = await gather_bookmark_data(anime_hash);
		anime_bookmark_container.insertAdjacentHTML('beforeend', html);
	};
	} else {
		anime_bookmark_container.innerHTML = "<br><p><strong>There is no anime right now!</strong> Please try and bookmark some and there will appear here!!</p>";
	}
};


if (localStorage.getItem('last_anime')) {
	render_last_viewed_anime();
	render_bookmark_manager();
} else {
	render_bookmark_manager();
};


search_bar_button.addEventListener('click', (e) => {
	let query = search_bar.value;
	const search_result = search(query).then((search_data) => {
		let search_result_data = search_data.result.fetch_anime_data.data;
		pagination(search_result_data);
		render_pagination(search_result_data, 1);

		// Event Propagation -> switches page numbers
		document.getElementById('page-numbers').addEventListener('click', function (e) {
		if (e.target.classList.contains('p-num')) {
			const value = e.target.textContent;
			render_pagination(search_result_data, value);
		}});

		// render_anime_hash(search_result_data);
		render_anime_list(search_result_data);
		
		card_container.addEventListener('click', (e) => {
			anime_info_container.innerHTML = "";
			let text = e.target.closest('.card').textContent.trim();
			text = text.replace(/\s*\b\d{4}\b\s*$/, '').trim();
			
			search_result_data.forEach((anime) => {
				if (anime.title === text) {
					render_anime_hash(anime);
					render_anime(anime);
				}
			})
			gather_anime_from_bookmark_manager();
		})
	});
});

gather_anime_from_bookmark_manager();