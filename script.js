//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  const searchInput = document.getElementById("search-input");
  const searchCount = document.getElementById("search-count");

  searchCount.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);
    searchCount.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;
  });
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
