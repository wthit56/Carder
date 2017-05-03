var generate_tts = (function() {
	function generate_tts(decks) {
		var TTSgen = document.body.appendChild(document.createElement("FIELDSET"));
		TTSgen.id = "generate";
		TTSgen.innerHTML = "<legend>Tabletop Simulator Object JSON</legend><p>Save each image locally, or upload to a server. Paste the generated code into a Saved Object json file, and save it. Now add it to your game in TTS.</p>";
		
		var cards = [], backs = 0;
		decks.forEach(function(d) { // get all unique cards from decks
			d.cards.forEach(function(c) {
				if (!c.added_to_cardsheets) {
					cards.push(c);
					c.added_to_cardsheets = true;
				}
				if (c.back && !c.back.added_to_save) {
					backs++;
					add_to_save("_" + decks.name + "_back_" + backs + ".png", c.back, c.back);
					c.back.added_to_save = true;
				}
			});
		});

		var rendered = cs_from_cards(null, cards);
		var sheet_index = 0;
		rendered.forEach(function(r) { // render cardsheets, link cards
			r.cardsheets.forEach(function(cs) {
				sheet_index++;
				cs.index = sheet_index;
				add_to_save("_" + decks.name + "_faces_" + sheet_index + ".png", cs, cs.cardsheet);
			});
		});
		
		function add_to_save(init_filename, data, render) {
			if (render.parentNode && render.tagName === "CANVAS") {
				var clone = document.createElement("CANVAS");
				clone.width = render.width; clone.height = render.height;
				clone.getContext("2d").drawImage(render, 0, 0);
				embiggenner(clone, render.preview_size);
				render = clone;
			}
			else if (data.cardsheet) {
				embiggenner(render, { width: Math.max(data.cards[0].size.width, data.cards[0].size.height) });
			}
			else {
				embiggenner(render, { width: data.preview_width });
			}
			
			data.filename = init_filename;
			
			render.data = data;
			
			var part = document.createElement("SPAN");
			part.className = "cardsheet";
			
			part.appendChild(render);
			
			part.appendChild(document.createElement("BR"));
			
			var filename = document.createElement("INPUT");
			filename.value = init_filename;
			filename.onchange = function() { data.filename = this.value; };
			filename.onclick = function() { this.select(); };
			part.appendChild(filename);
			
			TTSgen.appendChild(part);
		}
		
		{ // json generator
			var TTSjson = TTSgen.appendChild(document.createElement("DIV"));
			TTSjson.className = "json";
			
			var folder_field = TTSjson.appendChild(document.createElement("DIV"));
			folder_field.className = "field folder";
			var folder_label = folder_field.appendChild(document.createElement("LABEL"));
			folder_label.innerText = "Folder: ";
			var folder = folder_field.appendChild(document.createElement("INPUT"));
			folder_label.for = folder.id = "folder";
			
			var output = TTSjson.appendChild(document.createElement("TEXTAREA"));
			output.onclick = function() { this.select(); };
			var regen = TTSjson.appendChild(document.createElement("INPUT"));
			regen.type = "button";
			regen.value = "Regenerate";
			regen.onclick = function(e) {
				e.preventDefault();
				generate();
			};
			
			function generate() {
				var json = { ObjectStates: [] };
				
				var f = folder.value;
				if (f && /[^\\/]$/.test(folder.value)) { f += "/"; }
				
				var step = 3.5;
				var x = Math.floor(decks.length / 2) * -step;
				decks.forEach(function(deck) {
					var transform = {
						posX: x, posY: 0, posZ: 0,
						rotX: 0, rotY: 180, rotZ: deck.config.facedown ? 180 : 0,
						scaleX: 1, scaleY: 1, scaleZ: 1
					};
					
					var new_obj;
					if (deck.cards.length > 1) {
						var d = new_obj = {
							Name: "DeckCustom",
							Nickname: deck.name,
							Description: deck.description || "",
							
							Transform: transform,
							
							Grid: false,
							Locked: false,
							SidewaysCard: false,
							DeckIDs: [], ContainedObjects: [],
							CustomDeck: {}
						};
						
						deck.cards.forEach(function(c) {
							var TTScard = card_to_TTS(c);
							
							custom_deck(d.CustomDeck, f, c);

							var stack_index = (deck.config.shuffled
								? (Math.random() * d.DeckIDs.length | 0)
								: d.DeckIDs.length
							);
							
							d.DeckIDs.splice(stack_index, 0, TTScard.CardID);
							d.ContainedObjects.splice(stack_index, 0, TTScard);
						});
					}
					else {
						var TTScard = new_obj = card_to_TTS(deck.cards[0]);
						TTScard.Transform = transform;
						TTScard.CustomDeck = {};
						custom_deck(TTScard.CustomDeck, f, deck.cards[0]);
						
					}
					
					if (x === 0) { json.ObjectStates.unshift(new_obj); }
					else { json.ObjectStates.push(new_obj); }

					x += step;
				});
				
				
				output.value = JSON.stringify(json, null, 4);
			}	
			generate();
			
		}
	}

	function card_to_TTS(c) {
		return {
			Name: "Card", CardID: (c.cardsheet.index * 100) + c.cardsheet_index,
			Nickname: c.name, Description: c.description,
			Grid: false, Locked: false, Sticky: false,
			Transform: { scaleX: 1, scaleY: 1, scaleZ: 1 }
		};
	}

	function custom_deck(cd, f, c) {
		if (!(c.cardsheet.index in cd)) {
			cd[c.cardsheet.index] = {
				FaceURL: f + c.cardsheet.filename,
				BackURL: c.back ? f + c.back.filename : "http://www.imagemagick.org/Usage/fourier/generated_phase.png", // todo
				NumWidth: c.cardsheet.cols,
				NumHeight: c.cardsheet.rows,
				BackIsHidden: !c.hidden,
				UniqueBack: false
			};
		}
	}
	
	return generate_tts;
})();