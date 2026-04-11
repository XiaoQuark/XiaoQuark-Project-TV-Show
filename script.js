//You can edit ALL of the code here
function setup() {
	const allEpisodes = getAllEpisodes();
	makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
	const rootElem = document.getElementById("root");
	rootElem.textContent = `Got ${episodeList.length} episode(s)`;
	for (const episode of episodeList) {
		const card = createEpisodeCard(episode);
		console.log(card);
		document.body.appendChild(card);
	}
}

function createEpisodeCard(episode) {
	const card = document
		.getElementById("episode-card")
		.content.cloneNode(true);

	card.querySelector("h2").textContent = episode.name;
	card.querySelector("[season-number]").textContent = episode.season;
	card.querySelector("[episode-number]").textContent = episode.number;
	card.querySelector("[summary]").innerHTML = episode.summary;

	return card;
}

window.onload = setup;
