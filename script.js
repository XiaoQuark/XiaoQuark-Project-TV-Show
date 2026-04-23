//You can edit ALL of the code here
// On load function. Retrieves episodes, access search bar and dropdown and launches render
function setup() {
	elements.episodeControls = document.getElementById("episode-controls");
	elements.showSelect = document.getElementById("show-select");
	elements.episodeSelect = document.getElementById("episode-select");
	elements.showSearchInput = document.getElementById("show-search-input");
	elements.episodeSearchInput = document.getElementById(
		"episode-search-input",
	);
	elements.clearEpisodeSearchButton = document.getElementById(
		"clear-episode-search",
	);
	elements.episodeCount = document.getElementById("episode-count");
	elements.grid = document.getElementById("episodes-grid");
	elements.backToShowsButton = document.getElementById("back-to-shows");

	elements.showSearchInput.value = "";
	elements.episodeSearchInput.value = "";

	elements.showSelect.addEventListener("change", handleShowSelectChange);
	elements.episodeSelect.addEventListener("change", handleSelectChange);
	elements.showSearchInput.addEventListener("input", handleShowSearchInput);
	elements.episodeSearchInput.addEventListener(
		"input",
		handleEpisodeSearchInput,
	);
	elements.clearEpisodeSearchButton.addEventListener(
		"click",
		handleClearEpisodeSearch,
	);
	elements.episodeControls.addEventListener("submit", handleFormSubmit);

	elements.episodeTemplate = document.getElementById("episode-template");
	elements.showTemplate = document.getElementById("show-template");
	elements.backToShowsButton.addEventListener("click", handleBackToShows);

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
				"There was an error in retrieving the shows. Please try again";
			render();
		});
}

// state
const state = {
	// showsCache?
	allShows: [],
	// episodesCache?
	allEpisodes: [],
	showSearchTerm: "",
	episodeSearchTerm: "",
	// keeping this state for now because I might decide to change the dropdown behaviour back to filtering, not scrolling
	selectedEpisodeId: "all",
	selectedShowId: "",
	isLoading: true,
	errorMessage: "",
	episodesCache: {},
	currentView: "shows",
};

// global DOM elements
const elements = {
	episodeControls: null,
	showSelect: null,
	episodeSelect: null,

	showSearchInput: null,
	episodeSearchInput: null,
	clearEpisodeSearchButton: null,

	episodeCount: null,
	grid: null,
	episodeTemplate: null,
	showTemplate: null,
	backToShowsButton: null,
};

const BASE_URL = "https://api.tvmaze.com";
const SHOWS_URL = `${BASE_URL}/shows`;

// fetching
// fetch shows
function fetchShows() {
	return fetch(SHOWS_URL).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch shows");
		}
		return response.json();
	});
}
// fetch episodes
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
// Show search
function handleShowSearchInput(event) {
	state.showSearchTerm = event.target.value.toLowerCase();
	render();
}
// episode search
function handleEpisodeSearchInput(event) {
	state.episodeSearchTerm = event.target.value.toLowerCase();
	render();
}
// clear search
function handleClearEpisodeSearch() {
	state.episodeSearchTerm = "";
	elements.episodeSearchInput.value = "";
	render();
}

function handleFormSubmit(event) {
	event.preventDefault();
}

function handleShowSelectChange(event) {
	const showId = event.target.value;
	const episodeSelect = elements.episodeSelect;

	state.selectedShowId = showId;
	state.currentView = "episodes";
	state.selectedEpisodeId = "all";
	state.episodeSearchTerm = "";
	elements.episodeSearchInput.value = "";

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

function handleBackToShows() {
	state.currentView = "shows";
	state.selectedShowId = "";
	state.selectedEpisodeId = "all";
	state.episodeSearchTerm = "";
	elements.episodeSearchInput.value = "";
	state.allEpisodes = [];

	elements.showSelect.value = "";
	elements.episodeSelect.innerHTML =
		'<option value="all">Select Episode</option>';

	render();
}

function handleSelectChange(event) {
	const selectedEpisodeId = event.target.value;
	state.selectedEpisodeId = selectedEpisodeId;

	if (selectedEpisodeId === "all") return;

	state.episodeSearchTerm = "";
	elements.episodeSearchInput.value = "";

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

	elements.episodeControls.hidden = state.currentView !== "episodes";
	elements.episodeCount.hidden = state.currentView !== "episodes";
	elements.backToShowsButton.hidden = state.currentView !== "episodes";

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
				episode.name.toLowerCase().includes(state.episodeSearchTerm) ||
				(episode.summary &&
					episode.summary
						.toLowerCase()
						.includes(state.episodeSearchTerm)),
		);

		episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.allEpisodes.length} episodes`;
		makePageForEpisodes(filteredEpisodes);
		return;
	}
}

// draw show section
function makePageForShows(showList) {
	const grid = elements.grid;

	const filteredShows = showList.filter((show) => {
		const search = state.showSearchTerm;
		const genresText = show.genres.join(" ").toLowerCase();
		const summaryText = (show.summary || "").toLowerCase();

		return (
			show.name.toLowerCase().includes(search) ||
			genresText.includes(search) ||
			summaryText.includes(search)
		);
	});

	for (const show of filteredShows) {
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

	const title = template.querySelector("h2");
	title.textContent = show.name;
	title.style.cursor = "pointer";
	title.addEventListener("click", () => {
		handleShowCardClick(show.id);
	});

	return template;
}

function handleShowCardClick(showId) {
	state.selectedShowId = showId;
	elements.showSelect.value = String(showId);
	state.selectedEpisodeId = "all";
	state.episodeSearchTerm = "";
	elements.episodeSearchInput.value = "";

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
