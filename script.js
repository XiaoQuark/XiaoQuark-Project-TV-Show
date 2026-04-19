//You can edit ALL of the code here
// On load function. Retrieves episodes, access search bar and dropdown and launches render
function setup() {
	const controlsForm = document.getElementById("controls");
	const dropdownSelect = document.getElementById("episode-select");
	const searchInput = document.getElementById("search-input");
	const clearButton = document.getElementById("clear-search");

	searchInput.value = "";

	dropdownSelect.addEventListener("change", handleSelectChange);
	searchInput.addEventListener("input", handleSearchInput);
	controlsForm.addEventListener("submit", handleFormSubmit);
	clearButton.addEventListener("click", handleClearSearch);

	fetchEpisodes().then((episodes) => {
		state.allEpisodes = episodes;
		populateDropdown(dropdownSelect);
		render();
	});
}

// state
const state = {
	allEpisodes: [],
	searchTerm: "",
	// keeping this state for now because I might decide to change the dropdown behaviour back to filtering, not scrolling
	selectedEpisodeId: "all",
};

const endpoint = "https://api.tvmaze.com/shows/82/episodes";

function fetchEpisodes() {
	return fetch(endpoint).then((response) => response.json());
}

// event handlers
function handleFormSubmit(event) {
	event.preventDefault();
}

function handleClearSearch() {
	state.searchTerm = "";
	document.getElementById("search-input").value = "";
	render();
}

function handleSearchInput(event) {
	state.searchTerm = event.target.value.toLowerCase();
	render();
}

function handleSelectChange(event) {
	state.selectedEpisodeId = event.target.value;

	if (state.selectedEpisodeId === "all") return;

	state.searchTerm = "";
	document.getElementById("search-input").value = "";

	render();

	const selectedEpisode = document.getElementById(state.selectedEpisodeId);

	if (selectedEpisode) {
		selectedEpisode.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

function populateDropdown(dropdownSelect) {
	for (const episode of state.allEpisodes) {
		const option = document.createElement("option");
		option.value = episode.id;
		// const episodeCode = createEpisodeCode(episode.season, episode.number);
		option.textContent = `${createEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
		dropdownSelect.appendChild(option);
	}
}

// render: filters episodes based on search input and renders them as cards
function render() {
	const episodeCount = document.getElementById("episode-count");
	const filteredEpisodes = state.allEpisodes.filter(
		(episode) =>
			episode.name.toLowerCase().includes(state.searchTerm) ||
			episode.summary.toLowerCase().includes(state.searchTerm),
	);

	episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.allEpisodes.length} episodes`;

	makePageForEpisodes(filteredEpisodes);
}

// draws episodes section
function makePageForEpisodes(episodeList) {
	const grid = document.getElementById("episodes-grid");
	// must remove old cards before rendering new ones, or they will just keep getting added to the existing ones
	grid.textContent = "";

	// map list of episodes to create cards
	// const episodeCards = episodeList.map((episode) =>
	// 	createEpisodeCard(episode),
	// );

	// grid.append(...episodeCards);

	for (const episode of episodeList) {
		const card = createEpisodeCard(episode);
		grid.appendChild(card);
	}
}

// draws episode cards
function createEpisodeCard(episode) {
	// get template
	const template = document
		.getElementById("template")
		.content.cloneNode(true);
	const card = template.querySelector("article");
	card.id = episode.id;

	// image
	const image = template.querySelector("img");
	image.src = episode.image.medium;
	image.alt = `Screenshot from episode ${episode.name}`;

	// episode title
	template.querySelector("h2").textContent = episode.name;
	template.querySelector("[episode-code]").textContent = createEpisodeCode(
		episode.season,
		episode.number,
	);
	// other info
	template.querySelector("[season-number]").textContent =
		`Season number: ${episode.season}`;
	template.querySelector("[episode-number]").textContent =
		`Episode number: ${episode.number}`;
	template.querySelector("[summary]").innerHTML = episode.summary;

	return template;
}

// creates episode code
function createEpisodeCode(season, number) {
	return `S${season.toString().padStart(2, "0")}E${number.toString().padStart(2, "0")}`;
}

window.onload = setup;
