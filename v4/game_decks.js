function game_decks(name) {
	var decks = [];
	decks.name = name;
	decks.add = function(name, description, config) {
		var cards = [];
		
		var d = {
			name: name, description: description,
			cards: cards, config: config || {},
			add: function(count, card) {
				for (var i = 0; i < count; i++) {
					cards.push(card);
				}
			},
			shuffle: function() {
				var i = 0, l = this.cards.length;
				while (i < l) {
					this.cards.unshift(this.cards.splice(i + (Math.random() * (l - i)), 1)[0]);
					i++;
				}
			}
		};
		decks.push(d);
		return d;
	};
	
	return decks;
}