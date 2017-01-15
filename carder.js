//*
// https://unicode-table.com/
var glyphs = {
	cost: "⬤",
	attack: "⚔",
	defense: "🛡",
	truce: "⚐",
	yes: "✓"
};
var template, cards = [
	template = {
		title: "Card Title",
		text: "Card text tends to be much longer with multiple lines and icons {attack} and everything",
		cost: 5, attack: 3, defense: 5,
		truce: true, yes: false
	}
];


var keys = Object.keys(cards[0]),
	formatting = { strings: [], stats: [], icons: [] };



Object.keys(template).forEach(function(key) {
	switch (typeof template[key]) {
		case "boolean":
			if (key in glyphs) {
				formatting.icons.push(key);
			}
			break;
		case "number":
			formatting.stats.push(key); break;
	}
});

cards.forEach(function(src) {
	var html = document.createElement("DIV");
	html.className = "card";
	html.innerHTML = (
		(formatting.stats.length > 0 ?
			'<div class="stats">' + formatting.stats.map(function(stat) {
				return '<span class="stat">' +
					(stat in glyphs ? glyphs[stat] : "") +
					'<span class="stat-value s' + [1, 10, 100, 1000][(src[stat] - 1).toString().length] + '">' + src[stat] + '</span>' +
				'</span>';
			}).join("") + '</div>'
		: '') +
		(src.title || src.tags || src.text ?
			'<div class="text">' +
				(src.title ? '<h1>' + src.title + '</h1>' : '') +
				(src.tags ? '<h2>' + src.tags + '</h2>' : '') +
				(src.title ? '<p>' +
					src.text.replace(/\{([^}]*)}/g, function(m, icon) {
						return (icon in glyphs ?
							'<span class="icon">' + glyphs[icon] + '</span>'
						: "");
					}) +
				'</p>' : '') +
			'</div>'
		: '') +
		(formatting.icons.length > 0 ?
			'<div class="icons">' + formatting.icons.map(function(icon) {
				return '<span class="icon ' + (src[icon] ? 'on' : 'off') + '">' +
					glyphs[icon] +
				'</span>';
			}).join("") + '</div>'
		: '')
	);
	// html.innerText = JSON.stringify(obj, null, "\t");
	document.body.appendChild(html);
	
	if (html2canvas) {
		html2canvas(html.childNodes[1], { onrendered: function(canvas) {
			document.body.appendChild(canvas);
		} });
	}
});
//*/