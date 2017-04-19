function cs_from_cards(config, cards) {
	var sheets = [];
	config = config || {};
	cards.forEach(function(c) { // sort cards into cardsheets
		var sid = "" + (
			c.hidden
				? (c.hidden.id || c.hidden)
				: c.size.width + "-" + c.size.height
		);
		
		var deck = sheets[sid];
		if (!deck) {
			deck = sheets[sid] = [];
			deck.hidden = c.hidden;
			deck.card_size = { width: c.render.width, height: c.render.height };
			deck.max_size = config.max_size;
			deck.grid = config.grid;
		}
		deck.push(c);
	});
	
	var cardsheets = [];
	for (var sid in sheets) { // render cardsheets and display
		var d = sheets[sid];
		var rendered = cardsheet(d, d.map(function(c) {
			return c.render;
		}));
		
		rendered.cards.forEach(function(v, i) {
			cards[i].cardsheet = v.cardsheet;
			cards[i].cardsheet_index = v.index;
		});
		
		rendered.cardsheets.forEach(function(cs) {
			cs.cards = d;
			cs.cardsheet.data = cs;
		});
		
		cardsheets.push(rendered);
	}
	
	return cardsheets;
}