document.write("font.js, cardsheet.js, textbox.js, card.js, glyph.js, loader.js".split(", ").map(function(file) {
	return "<script src='file:///F:/JavaScript/Carder/v3/" + file + "'></script>";
}).join(""));

var carder = (function() {
	function carder(name) {
		return {
			name: name,
			
			deck: function(name, config, cards) {
				var html = document.body.appendChild(document.createElement("DIV"));
				
				var act, result = {
					name: name, config: config, cards: cards,
					renders: [], rendered: false,
					then: function(_act) {
						if (this.rendered > 0) {
							_act();
						}
						else {
							act = _act;
						}
					}
				};
				
				if (!Array.isArray(config)) {
					config = [config];
				}
				
				var fonts = [];
				
				var images = new loader();
				config.forEach(function(c) {
					c.layout.forEach(function(area) {
						if (area.type === "textbox") {
							area.includes.forEach(function(t) {
								fonts.push(t.font.face);
							});
						}
						else if (area.type === "image") {
							if (area.from) {
								cards.forEach(function(data) {
									images.add(area.src.replace(/%s/g, data[area.from]));
								});
							}
							else {
								images.add(area.src);
							}
						}
					});
				});
				images.then(function() {
					function render_stuff() {
						result.renders = result.renders.concat(render(config, cards, html));
						result.rendered = true;
						if (act) { act(); }
					}

					if (fonts.length > 0) {
						var url = "https://fonts.googleapis.com/css?family=" + fonts.map(encodeURIComponent).join("|");
						
						var link = document.createElement('link');
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = url;
						document.getElementsByTagName('head')[0].appendChild(link);

						var image = new Image();
						image.src = url;
						image.onerror = render_stuff;
						// window.addEventListener("load", render_stuff);
					}
					else {
						render_stuff();
					}
				});
				
				return result;
			}
		};
	}

	function render(config, cards, container) {
		var renders = [];
		config.forEach(function(config) {
			cards.forEach(function(_card) {
				var render = card(config, _card);
				render.className = "card " + (config.card_size.width > config.card_size.height ? "wide" : "tall");
				renders.push(render);
				container.appendChild(render);
			});
		});
		return renders;
	}
	
	return carder;
})();