//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  for (const episode of episodeList) {
    const card = createEpisodeCard(episode);
    console.log(card);
    rootElem.appendChild(card);
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
