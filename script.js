//You can edit ALL of the code here
// On load function. Retrieves episodes, access search bar and dropdown and launches render
function setup() {
  const controlsForm = document.getElementById("controls");
  const episodeSelect = document.getElementById("episode-select");
  const showSelect = document.getElementById("show-select");
  const searchInput = document.getElementById("search-input");
  const clearButton = document.getElementById("clear-search");

  searchInput.value = "";

  showSelect.addEventListener("change", handleShowSelectChange);
  episodeSelect.addEventListener("change", handleSelectChange);
  searchInput.addEventListener("input", handleSearchInput);
  controlsForm.addEventListener("submit", handleFormSubmit);
  clearButton.addEventListener("click", handleClearSearch);

  render();

  fetchShows()
    .then((shows) => {
      state.allShows = shows;
      state.isLoading = false;
      populateShowDropdown(showSelect);
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
  allShows: [],
  allEpisodes: [],
  searchTerm: "",
  // keeping this state for now because I might decide to change the dropdown behaviour back to filtering, not scrolling
  selectedEpisodeId: "all",
  selectedShowId: "",
  isLoading: true,
  errorMessage: "",
  episodesCache: {},
};

function fetchShows() {
  return fetch("https://api.tvmaze.com/shows").then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch episodes");
    }
    return response.json();
  });
}

function fetchEpisodes(showId) {
  if (state.episodesCache[showId]) {
    return Promise.resolve(state.episodesCache[showId]);
  }
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`).then(
    (response) => {
      if (!response.ok) throw new Error("Failed to fetch episodes");
      return response.json().then((data) => {
        state.episodesCache[showId] = data;
        return data;
      });
    },
  );
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

function handleShowSelectChange(event) {
  const showId = event.target.value;
  state.selectedShowId = showId;
  state.selectedEpisodeId = "all";
  state.searchTerm = "";
  document.getElementById("search-input").value = "";

  if (!showId) {
    state.allEpisodes = [];
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
      const episodeSelect = document.getElementById("episode-select");
      populateDropdown(episodeSelect); // 更新右侧的“选集”菜单
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

function populateShowDropdown(showSelect) {
  const sortedShows = state.allShows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );
  for (const show of sortedShows) {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  }
}

function populateDropdown(dropdownSelect) {
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
  const episodeCount = document.getElementById("episode-count");
  const grid = document.getElementById("episodes-grid");
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

  if (state.allEpisodes.length === 0) return;

  const filteredEpisodes = state.allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(state.searchTerm) ||
      (episode.summary &&
        episode.summary.toLowerCase().includes(state.searchTerm)),
  );

  episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.allEpisodes.length} episodes`;
  makePageForEpisodes(filteredEpisodes);
}

// draws episodes section
function makePageForEpisodes(episodeList) {
  const grid = document.getElementById("episodes-grid");
  // must remove old cards before rendering new ones, or they will just keep getting added to the existing ones
  grid.textContent = "";
  for (const episode of episodeList) {
    const card = createEpisodeCard(episode);
    grid.appendChild(card);
  }
}

// draws episode cards
function createEpisodeCard(episode) {
  // get template
  const template = document.getElementById("template").content.cloneNode(true);
  const card = template.querySelector("article");
  card.id = episode.id;

  // image
  const image = template.querySelector("img");
  image.src = episode.image ? episode.image.medium : "";
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
  template.querySelector("[summary]").innerHTML = episode.summary || "";

  return template;
}

// creates episode code
function createEpisodeCode(season, number) {
  return `S${season.toString().padStart(2, "0")}E${number.toString().padStart(2, "0")}`;
}

window.onload = setup;
