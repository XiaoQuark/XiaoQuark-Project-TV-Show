//You can edit ALL of the code here
const state = {
  allEpisodes: [],
  searchTerm: "",
  selectedEpisodeId: "all",
};

function setup() {
  state.allEpisodes = getAllEpisodes();

  const searchInput = document.getElementById("search-input");
  const selector = document.getElementById("episode-selector");
  for (const episode of state.allEpisodes) {
    const option = document.createElement("option");
    option.value = episode.id;
    const episodeCode = createEpisodeCode(episode.season, episode.number);
    option.textContent = `${episodeCode} - ${episode.name}`;
    selector.appendChild(option);
  }
  selector.addEventListener("change", handleSelectChange);
  searchInput.addEventListener("input", handleSearchInput);

  render();
}

function handleSearchInput(event) {
  state.searchTerm = event.target.value.toLowerCase();
  render();
}

function handleSelectChange(event) {
  state.selectedEpisodeId = event.target.value;
  render();
}

function render() {
  const filteredEpisodes = state.allEpisodes.filter((episode) => {
    const matchesSelector =
      state.selectedEpisodeId === "all" ||
      String(episode.id) === state.selectedEpisodeId;
    const matchesSearch =
      episode.name.toLowerCase().includes(state.searchTerm) ||
      episode.summary.toLowerCase().includes(state.searchTerm);
    return matchesSelector && matchesSearch;
  });

  document.getElementById("search-count").textContent =
    `Displaying ${filteredEpisodes.length}/${state.allEpisodes.length} episodes`;

  makePageForEpisodes(filteredEpisodes);
}

function makePageForEpisodes(episodeList) {
  const grid = document.getElementById("episodes-grid");
  grid.innerHTML = "";

  for (const episode of episodeList) {
    const card = createEpisodeCard(episode);
    grid.appendChild(card);
  }
}

function makePageForEpisodes(episodeList) {
  const grid = document.getElementById("episodes-grid");
  grid.innerHTML = "";
  for (const episode of episodeList) {
    const card = createEpisodeCard(episode);
    grid.appendChild(card);
  }
}

function createEpisodeCard(episode) {
  const card = document.getElementById("template").content.cloneNode(true);

  const image = card.querySelector("img");
  image.src = episode.image.medium;
  image.alt = `Screenshot from episode ${episode.name}`;
  card.querySelector("h2").textContent = episode.name;
  card.querySelector("[episode-code]").textContent = createEpisodeCode(
    episode.season,
    episode.number,
  );
  card.querySelector("[season-number]").textContent =
    `Season number: ${episode.season}`;
  card.querySelector("[episode-number]").textContent =
    `Episode number: ${episode.number}`;
  card.querySelector("[summary]").innerHTML = episode.summary;

  return card;
}

function createEpisodeCode(season, number) {
  console.log(season, number);
  return `S${season.toString().padStart(2, "0")}E${number.toString().padStart(2, "0")}`;
}

window.onload = setup;
