document.write("font.js, cardsheet.js, textbox.js, card.js, glyph.js".split(", ").map(function(file) {
	return "<script src='file:///F:/JavaScript/Carder/v3/" + file + "'></script>";
}).join(""));

function carder(config, cards) {
	cards.forEach(function(_card) {
		var render = card(config, _card);
		render.className = "card";
		document.body.appendChild(render);
	});
}