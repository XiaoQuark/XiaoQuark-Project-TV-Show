//You can edit ALL of the code here
// On load function. Retrieves episodes, access search bar and dropdown and launches render
function setup() {
	elements.controlsForm = document.getElementById("controls");
	elements.showSelect = document.getElementById("show-select");
	elements.episodeSelect = document.getElementById("episode-select");
	elements.searchInput = document.getElementById("search-input");
	elements.clearButton = document.getElementById("clear-search");
	elements.episodeCount = document.getElementById("episode-count");
	elements.grid = document.getElementById("episodes-grid");

	elements.searchInput.value = "";

	elements.showSelect.addEventListener("change", handleShowSelectChange);
	elements.episodeSelect.addEventListener("change", handleSelectChange);
	elements.searchInput.addEventListener("input", handleSearchInput);
	elements.controlsForm.addEventListener("submit", handleFormSubmit);
	elements.clearButton.addEventListener("click", handleClearSearch);
	elements.episodeTemplate = document.getElementById("episode-template");
	elements.showTemplate = document.getElementById("show-template");

	render();

	fetchShows()
		.then((shows) => {
			state.allShows = shows;
			state.isLoading = false;
			populateShowDropdown(elements.showSelect);
			render();
		})
		.catch(() => {
			state.isLoading = false;
			state.errorMessage =
				"There was an error in retrieving the episodes. Please try again";
			render();
		});
}

// state
const state = {
	// showsCache?
	allShows: [],
	// episodesCache?
	allEpisodes: [],
	searchTerm: "",
	// keeping this state for now because I might decide to change the dropdown behaviour back to filtering, not scrolling
	selectedEpisodeId: "all",
	selectedShowId: "",
	isLoading: true,
	errorMessage: "",
	episodesCache: {},
	currentView: "shows",
};

// DOM elements
const elements = {
	controlsForm: null,
	showSelect: null,
	episodeSelect: null,
	searchInput: null,
	clearButton: null,
	episodeCount: null,
	grid: null,
	episodeTemplate: null,
	showTemplate: null,
};

const BASE_URL = "https://api.tvmaze.com";
const SHOWS_URL = `${BASE_URL}/shows`;

function fetchShows() {
	return fetch(SHOWS_URL).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch shows");
		}
		return response.json();
	});
}

function fetchEpisodes(showId) {
	if (state.episodesCache[showId]) {
		return Promise.resolve(state.episodesCache[showId]);
	}
	return fetch(`${SHOWS_URL}/${showId}/episodes`).then((response) => {
		if (!response.ok) throw new Error("Failed to fetch episodes");
		return response.json().then((data) => {
			state.episodesCache[showId] = data;
			return data;
		});
	});
}
// event handlers
function handleFormSubmit(event) {
	event.preventDefault();
}

function handleClearSearch() {
	state.searchTerm = "";
	elements.searchInput.value = "";
	render();
}

function handleSearchInput(event) {
	state.searchTerm = event.target.value.toLowerCase();
	render();
}

function handleShowSelectChange(event) {
	const showId = event.target.value;
	const episodeSelect = elements.episodeSelect;

	state.selectedShowId = showId;
	state.currentView = "episodes";
	state.selectedEpisodeId = "all";
	state.searchTerm = "";
	elements.searchInput.value = "";

	episodeSelect.innerHTML = '<option value="all">Select Episode</option>';

	if (!showId) {
		state.allEpisodes = [];
		state.currentView = "shows";
		render();
		return;
	}

	state.isLoading = true;
	state.errorMessage = "";
	render();

	fetchEpisodes(showId)
		.then((episodes) => {
			state.allEpisodes = episodes;
			state.isLoading = false;
			populateEpisodesDropdown(episodeSelect);
			render();
		})
		.catch(() => {
			state.isLoading = false;
			state.errorMessage =
				"There was an error in retrieving the episodes. Please try again";
			render();
		});
}

function handleSelectChange(event) {
	const selectedEpisodeId = event.target.value;
	state.selectedEpisodeId = selectedEpisodeId;

	if (selectedEpisodeId === "all") return;

	state.searchTerm = "";
	elements.searchInput.value = "";

	render();

	const selectedEpisode = document.getElementById(selectedEpisodeId);

	if (selectedEpisode) {
		selectedEpisode.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

function populateShowDropdown(showSelect) {
	const sortedShows = state.allShows.toSorted((a, b) =>
		a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
	);
	for (const show of sortedShows) {
		const option = document.createElement("option");
		option.value = show.id;
		option.textContent = show.name;
		showSelect.appendChild(option);
	}
}

function populateEpisodesDropdown(dropdownSelect) {
	dropdownSelect.innerHTML = '<option value="all">Select Episode</option>';
	for (const episode of state.allEpisodes) {
		const option = document.createElement("option");
		option.value = episode.id;
		option.textContent = `${createEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
		dropdownSelect.appendChild(option);
	}
}

// render: filters episodes based on search input and renders them as cards
function render() {
	const episodeCount = elements.episodeCount;
	const grid = elements.grid;
	const statusMessage = document.createElement("p");
	statusMessage.id = "status-message";

	grid.textContent = "";
	episodeCount.textContent = "";

	if (state.isLoading) {
		statusMessage.textContent = "Loading...";
		grid.appendChild(statusMessage);
		return;
	}

	if (state.errorMessage) {
		statusMessage.textContent = state.errorMessage;
		grid.appendChild(statusMessage);
		return;
	}

	if (state.currentView === "shows") {
		makePageForShows(state.allShows);
		return;
	}

	if (state.currentView === "episodes") {
		const filteredEpisodes = state.allEpisodes.filter(
			(episode) =>
				episode.name.toLowerCase().includes(state.searchTerm) ||
				(episode.summary &&
					episode.summary.toLowerCase().includes(state.searchTerm)),
		);

		episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.allEpisodes.length} episodes`;
		makePageForEpisodes(filteredEpisodes);
	}

	const filteredEpisodes = state.allEpisodes.filter(
		(episode) =>
			episode.name.toLowerCase().includes(state.searchTerm) ||
			(episode.summary &&
				episode.summary.toLowerCase().includes(state.searchTerm)),
	);

	episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.allEpisodes.length} episodes`;
	makePageForEpisodes(filteredEpisodes);
}

// draw show section
function makePageForShows(showList) {
	const grid = elements.grid;
	for (const show of showList) {
		const card = createShowCard(show);
		grid.appendChild(card);
	}
}

// draws episodes section
function makePageForEpisodes(episodeList) {
	const grid = elements.grid;
	for (const episode of episodeList) {
		const card = createEpisodeCard(episode);
		grid.appendChild(card);
	}
}

// draws episode cards
function createEpisodeCard(episode) {
	const template = elements.episodeTemplate.content.cloneNode(true);
	const card = template.querySelector("article");
	card.id = episode.id;

	// image: only render it if a medium image exists
	if (episode.image?.medium) {
		const image = template.querySelector("img");
		image.src = episode.image.medium;
		image.alt = `Screenshot from episode ${episode.name}`;
	} else {
		template.querySelector("img").remove();
	}

	// title
	template.querySelector("h2").textContent = episode.name;

	// code
	template.querySelector("[episode-code]").textContent = createEpisodeCode(
		episode.season,
		episode.number,
	);

	template.querySelector("[season-number]").textContent =
		`Season number: ${episode.season}`;
	template.querySelector("[episode-number]").textContent =
		`Episode number: ${episode.number}`;

	// summary
	template.querySelector("[summary]").innerHTML =
		episode.summary || "<p>No summary available</p>";

	return template;
}

// draw show card
function createShowCard(show) {
	const template = elements.showTemplate.content.cloneNode(true);

	if (show.image?.medium) {
		const image = template.querySelector("img");
		image.src = show.image.medium;
		image.alt = `Poster for ${show.name}`;
	} else {
		template.querySelector("img").remove();
	}

	template.querySelector("h2").textContent = show.name;
	template.querySelector(".show-summary").innerHTML =
		show.summary || "<p>No summary available</p>";
	template.querySelector(".show-genres").textContent =
		`Genres: ${show.genres.join(", ") || "Unknown"}`;
	template.querySelector(".show-status").textContent =
		`Status: ${show.status || "Unknown"}`;
	template.querySelector(".show-rating").textContent =
		`Rating: ${show.rating?.average ?? "N/A"}`;
	template.querySelector(".show-runtime").textContent =
		`Runtime: ${show.runtime ?? "N/A"} minutes`;

	template.querySelector("article").addEventListener("click", () => {
		handleShowCardClick(show.id);
	});

	return template;
}

function handleShowCardClick(showId) {
	state.selectedShowId = showId;
	state.selectedEpisodeId = "all";
	state.searchTerm = "";
	elements.searchInput.value = "";

	elements.episodeSelect.innerHTML =
		'<option value="all">Select Episode</option>';

	state.isLoading = true;
	state.errorMessage = "";
	state.currentView = "episodes";
	render();

	fetchEpisodes(showId)
		.then((episodes) => {
			state.allEpisodes = episodes;
			state.isLoading = false;
			populateEpisodesDropdown(elements.episodeSelect);
			render();
		})
		.catch(() => {
			state.isLoading = false;
			state.errorMessage =
				"There was an error in retrieving the episodes. Please try again";
			render();
		});
}

// creates episode code
function createEpisodeCode(season, number) {
	return `S${season.toString().padStart(2, "0")}E${number.toString().padStart(2, "0")}`;
}

window.onload = setup;
