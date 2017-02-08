// v 0.3
var carder = (function() {

function carder(name, decks, mode) {
	document.body.appendChild(document.createElement("H1")).innerText = "Carder : " + name;
	
	var by_back = {};
	mode = mode || "expandability-first";
	
	var loading = 0, loaded = 0;
	function onload() {
		if (++loaded >= loading) {
			all_cards_ready();
		}
	}
	
	var max_width = 250;
	
	decks.forEach(function(deck) {
		var cards = deck.cards, styling = deck.styling, back = deck.back;
		
		styling.__proto__ = default_styling;
		if (styling.hasOwnProperty("title")) { styling.title.__proto__ = default_styling.title; }
		if (styling.hasOwnProperty("text")) { styling.text.__proto__ = default_styling.text; }
		if (styling.hasOwnProperty("icons")) { styling.icons.__proto__ = default_styling.icons; }
		if (styling.hasOwnProperty("stats")) { styling.stats.__proto__ = default_styling.stats; }
		
		var card_size = {
			x: styling.card_size.x, y: styling.card_size.y
		};
		
		var preview_size = {
			x: card_size.x, y: card_size.y
		};
		if (preview_size.x > max_width) {
			var s = max_width / preview_size.x;
			preview_size.x = max_width; preview_size.y *= s;
		}
		
		document.body.appendChild(document.createElement("H2")).innerText = deck.name;
		
		if (back) {
			var img = back.loaded = document.body.appendChild(new Image());
			img.onload = onload;
			img.src = back.url || back.path;
			img.style.width = preview_size.x + "px"; img.style.height = preview_size.y + "px";
			loading++;
		}
		
		var rendered = [];
		cards.forEach(function(card) {
			if (card.url || card.path) {
				var img = card.loaded = document.body.appendChild(new Image());
				loading++;
				img.onload = onload;
				img.src = card.url || card.path;
				img.style.width = preview_size.x + "px"; img.style.height = preview_size.y + "px";
			}
			else { // card
				var canvas = card.rendered = document.body.appendChild(document.createElement("CANVAS"));
				canvas.width = card_size.x * styling.scale; canvas.height = card_size.y * styling.scale;
				canvas.style.width = preview_size.x + "px"; canvas.style.height = preview_size.y + "px";
				rendered.push(canvas);
				var ctx = canvas.getContext("2d");
				ctx.textBaseline = "middle";
				ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "black";
				ctx.scale(styling.scale, styling.scale);
				
				var meta = [];
				
				var stats_count = 0, icons_count = 0;
				for (var prop in card) {
					switch (prop) {
						case "title": case "text": case "back": case "debug": case "path": case "url": case "quantity": continue;
					}
					
					switch (typeof card[prop]) {
						case "string": case "number": { // stat
							meta.push(prop + " = " + card[prop]);
							
							if ((prop in styling.glyphs) || card[prop].toString().length > 0) {
								var top = styling.gutter + (stats_count * (styling.stats.height + styling.gutter));
								
								if (card.debug) {
									ctx.save(); {
										ctx.fillStyle = "rgba(255,0,0,0.5)";
										ctx.fillRect(styling.gutter, top, styling.stats.width, styling.stats.height);
									} ctx.restore();
								}
								
								var glyph = styling.glyphs[prop];
								if (glyph) {
									ctx.save(); {
										var t = (glyph.text || glyph);
										var f = glyph.font || styling.stats.font || styling.font;
										var s = styling.stats.glyph_size || f.size;
										var sc = (s / f.px);
										ww_set_font(ctx, s, f);
										
										var glyph_width = ctx.measureText(t).width;
										var left = styling.gutter + ((styling.stats.width - glyph_width) / 2);
										
										if (card.debug) {
											ctx.save(); {
												ctx.fillStyle = "rgba(0,255,0,0.5)";
												ctx.fillRect(left, top + (styling.stats.height / 2) - ((f.x_height) * sc / 2), 
													glyph_width, f.x_height * sc);
											} ctx.restore();
										}

										ctx.fillText(t,
											left, top + (styling.stats.height / 2) + ((-f.baseline + (f.x_height / 2)) * sc));
									} ctx.restore();
								}
								
								var value = card[prop].toString();
								if (value !== "") {
									ctx.save(); {
										var f = styling.stats.font || styling.font;
										var s = styling.stats.value_size || f.px;
										var sc = (s / f.px);
										ww_set_font(ctx, s, f);
										var v_width = ctx.measureText(value).width;
										var scale = 1;
										if (v_width > styling.stats.width - styling.gutter) {
											scale = (styling.stats.width - styling.gutter) / v_width;
										}
										var x = styling.gutter + ((styling.stats.width - (v_width * scale)) / 2),
											y = top + (styling.stats.height / 2);
										ctx.translate(x, y);
										ctx.scale(scale, scale);
										ctx.shadowBlur = 8; ctx.shadowColor = "white";
										ctx.lineWidth = 1.5; ctx.strokeStyle = "white";
										ctx.strokeText(value, 0, 0);
										ctx.fillText(value, 0, 0);
									} ctx.restore();
								}
								
								stats_count++;
							}
						} break;
						case "boolean": { // icon
							meta.push(prop);
							
							var glyph = styling.glyphs[prop];
							if (glyph) {
								var t = glyph, f = styling.icons.glyph_font || styling.font, s = styling.icons.glyph_size || f.size;
								if (typeof glyph === "object") {
									t = glyph.text; f = glyph.font || f; s = styling.icons.glyph_size || f.size; }
								var sc = s / f.px;
								ctx.save(); {
									ww_set_font(ctx, s, f);
									
									var left = styling.gutter + ((styling.icons.width + styling.gutter) * icons_count),
										top = card_size.y - styling.gutter - styling.icons.height;
										
									var gw = ctx.measureText(t).width;
									var x = left + (styling.icons.width - gw) / 2,
										y = top + (styling.icons.height / 2) + ((-f.baseline + (f.x_height / 2)) * sc);
									
									if (card.debug) {
										ctx.save(); {
											ctx.fillStyle = "rgba(255,0,0,0.5)";
											ctx.fillRect(left, top, styling.icons.width, styling.icons.height);
											ctx.fillStyle = "rgba(0,255,0,0.5)";
											ctx.fillRect(x, top + (styling.icons.height / 2) - (f.x_height / 2 * sc), gw, (f.x_height ) * sc);
										} ctx.restore();
									}
									
									ctx.fillText(t, x, y);
								} ctx.restore();
								icons_count++;
							}
						} break;
					}
				}

				card.name = card.title + (meta.length > 0 ? " - " + meta.join(", ") : "");
				
				// ww_render(ctx, text, size, font, leading, indent, bound, result, debug)
				var top = styling.gutter, left = styling.gutter + (stats_count !== 0 ? 50 + styling.gutter : 0),
					bottom_right = { x: card_size.x - styling.gutter, y: card_size.y - styling.gutter - (icons_count !== 0 ? styling.icons.height + styling.gutter : 0) };

				if (card.debug) {
					ctx.save(); {
						ctx.fillStyle = "rgba(255,0,0,0.5)";
						ctx.fillRect(left, top, bottom_right.x - left, bottom_right.y - top);
					} ctx.restore();
				}
				
				var r = {};
				if (card.title) {
					var t = card.title;
					if ((typeof t  === "string") && styling.title.pre) {
						t = styling.title.pre(t, card, styling);
					}
					ww_render(ctx, t, 30, carder.fonts["Times New Roman"].bold, 3, 0,
						{ from: { x: left, y: styling.gutter }, to: bottom_right }, r);
					top += r.bottom;
				}
				if (card.text) {
					// ww_render(ctx, text, size, font, leading, indent, bound, result, debug)
					var t = card.text;
					if ((typeof t  === "string") && styling.text.pre) {
						t = styling.text.pre(t, card, styling);
					}
					ww_render(ctx, t, styling.text.size || null, styling.text.font || styling.font, 5, 0,
						{ from: { x: left, y: top }, to: bottom_right }, r);
				}
				
				if (r.cutoff) { card.broken = true; }
				
				if (card.broken) { card.rendered.className = "broken"; }
			}
		});
	});
	
	var obj_decks = [], backs = [];
	function all_cards_ready() {
		var unq = {}, ren_decks = [];
		decks.forEach(function(deck) {
			var back_path = deck.back ? (deck.back.url || deck.back.path) : null;
			var u = deck.styling.card_size.x + "," + deck.styling.card_size.y + "," + (deck.back.url || deck.back.path);
			var obj = [], ren, index; obj_decks.push(obj);
			obj.deck = deck;
			
			if (!(u in unq)) {
				ren = [];
				ren.index = ren_decks.push(ren) - 1;
				ren.card_size = deck.styling.card_size;
				ren.back = deck.back.loaded;
				
				unq[u] = { ren: ren };
			}
			else {
				ren = unq[u].ren;
			}
			
			if (back_path && !(back_path in backs)) {
				backs.push(backs[back_path] = back = { loaded: deck.back.loaded, filename: back_path.match(/[^/]+$/)[0], path: back_path });
			}
			else {
				back = backs[back_path];
			}
			
			deck.cards.forEach(function(card) {
				var card_index = ren.push({ card: card.loaded || card.rendered }) - 1;
				obj.push({ card: card, card_index: card_index, ren: ren, deck: deck, back: back, name: deck.name, quantity: card.quantity });
			});
			
		});
		
		document.body.appendChild(document.createElement("H2")).innerHTML = "Files&hellip;";
		
		function select(e) {
			this.select();
		}
		
		backs.forEach(function(back, i) {
			var file = document.body.appendChild(document.createElement("DIV"));
			file.className = "file";
			file.appendChild(back.loaded.cloneNode());
			var url = back.url = file.appendChild(document.createElement("INPUT"));
			url.className = "url";
			
			var dl = file.appendChild(document.createElement("A"));
			dl.innerText = "DL"; dl.href = back.path;
			url.value = dl.download = "_" + name + "_" + back.filename;
			url.onclick = select;
		});
		
		ren_decks.forEach(function(ren) {
			var max_size = 4096;
			var w, h, card_size = Object.create(ren.card_size);
				
			var scale_down = false;
				
			if (mode === "expandability-first") {
				w = 10; h = 7;
				scale_down = true;
			}
			else if (mode === "image-count-first") {
				var sq = Math.sqrt(card_size.x * card_size.y * (ren.length + 1));
				if (card_size.x <= card_size.y) {
					w = Math.min(Math.ceil(sq / card_size.x), 10);
					h = Math.ceil((ren.length + 1) / w);
				}
				else {
					h = Math.min(Math.ceil(sq / card_size.y), 7);
					w = Math.ceil((ren.length + 1) / h);
				}
				scale_down = true;
			}
			
			var scale = 1;
			if (scale_down) {
				var d = card_size.x * styling.scale * scale * w;
				if (d > max_size) { scale = max_size / d; }
				d = card_size.x * styling.scale * scale * w;
				
				d = card_size.y * styling.scale * scale * h;
				if (d > max_size) { scale *= max_size / d; }
				d = card_size.y * styling.scale * scale * h;
			}
			card_size.x = Math.floor(card_size.x * styling.scale * scale);
			card_size.y = Math.floor(card_size.y * styling.scale * scale);
			
			ren.width = w; ren.height = h;
			
			var file = document.body.appendChild(document.createElement("DIV"));
			file.className = "file";
			var canvas = file.appendChild(document.createElement("CANVAS"));
			canvas.style.width = max_width + "px";
			canvas.width = card_size.x * w; canvas.height = card_size.y * h;
			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "rgb(127,127,127)";
			ctx.fillRect(0,0, canvas.width, canvas.height);

			ren.forEach(function(card, i) {
				var x = i % w, y = (i - x) / w;
				x *= card_size.x; y *= card_size.y;
				
				ctx.drawImage(card.card, x, y, card_size.x, card_size.y);
			});
			
			if (ren.back) {
				ctx.drawImage(ren.back, (w - 1) * card_size.x, (h - 1) * card_size.y, card_size.x, card_size.y);
			}
			
			var url = ren.url = file.appendChild(document.createElement("INPUT"));
			url.onclick = select;
			url.value = "_" + name + "_Faces_" + (ren.index + 1) + ".png";
			
			var dataURL;
			try { dataURL = canvas.toDataURL(); } catch (e) { }
			
			if (dataURL) {
				var dl = file.appendChild(document.createElement("A"));
				dl.innerText = "DL"; dl.href = canvas.toDataURL();
				dl.download = url.value;
			}
			
			console.groupEnd(ren.back.src);
		});
		
		
		gen = document.createElement("BUTTON");
		gen.innerText = "Generate TTS Object";
		gen.onclick = generate_obj;
		
		var fl = document.body.appendChild(document.createElement("LABEL"));
		fl.innerText = "Folder: "; fl.for = "folder";
		
		var folder = gen.folder = document.body.appendChild(document.createElement("INPUT"));
		folder.id = "folder";
		folder.value = "https://raw.githubusercontent.com/wthit56/TTS-Resources/gh-pages/Forager/Cards/";

		document.body.appendChild(gen);
		
		gen_output = document.body.appendChild(document.createElement("TEXTAREA"));
		gen_output.onclick = select;
		
		generate_obj();
	}
	
	var gen, gen_output;
	function generate_obj() {
		var f = gen.folder.value, f_is_web = /^https?:/.test(f);
		
		var o = { ObjectStates: [] };
		var spacing = 3.2, offset = -(Math.floor(obj_decks.length / 2) * spacing);
		
		obj_decks.forEach(function(d, i) {
			var deck = d.deck, od;
			od = {
				Name: "DeckCustom", Nickname: deck.name,
				Transform: {
					posX: offset + (i * spacing), posY: 0, posZ: 0,
					rotX: 0, rotY: 180, rotZ: 0,
					scaleX: 1, scaleY: 1, scaleZ: 1
				},
				Grid: false, Locked: false, SidewaysCard: false,
				DeckIDs: [], ContainedObjects: []
			};
			
			var cd = {};
			d.forEach(function(card) {
				if (!((card.ren.index + 1) in cd)) {
					var b = card.back;
					var deck = cd[card.ren.index + 1] = {
						FaceURL: f + card.ren.url.value,
						BackURL: f + (b ? b.url.value : ""),
						NumWidth: card.ren.width, NumHeight: card.ren.height,
						BackIsHidden: true, UniqueBack: false
					};
					if (f_is_web) {
						deck.FaceURL = encodeURI(deck.FaceURL);
						deck.BackURL = encodeURI(deck.BackURL);
					}
				}
				
				var cid = ((card.ren.index + 1) * 100) + card.card_index;
				var c = card.card;
				
				var desc;
				if (c.description) {
					desc = c.description;
					if (c.text) { desc += " - " + text; }
				}
				else if (c.text) { desc = c.text; }
				
				var card_obj = {
					Name: "Card", CardID: cid,
					Nickname: c.name || "", Description: desc,
					Grid: false, Locked: false, Sticky: false,
					Transform: { scaleX: 1, scaleY: 1, scaleZ: 1 },
				};
				
				var q = ("quantity" in c) ? c.quantity : 1;
				for (var i = 0; i < q; i++) {
					od.DeckIDs.push(cid);
					od.ContainedObjects.push(card_obj);
				}
				
			});
			od.CustomDeck = cd;
			
			if (od.ContainedObjects.length === 1) {
				var card = od.ContainedObjects[0];
				card.Transform = od.Transform;
				card.CustomDeck = cd;
				od = card;
			}
			
			if ((od.Transform.posX === 0) && (od.Transform.posY === 0)) {
				o.ObjectStates.splice(0,0, od);
			}
			else {
				o.ObjectStates.push(od);
			}
		});
		
		var output = JSON.stringify(o, null, "  ")
		gen_output.value = output;
	}
}

carder.fonts = {
	"Arial": {
		font: "Arial", px: 20,
		baseline: 7.0, x_height: 10.5, cap_height: 14.4, tail_height: 4.0,
		bold: {
			font: "Arial", style: "bold", px: 20,
			baseline: 7.0, x_height: 10.5, cap_height: 14.4, tail_height: 4.0,
		}
	},
	"Times New Roman": {
		font: "Times New Roman", px: 16,
		baseline: 5, x_height: 7.2, cap_height: 10.6, tail_height: 3.4,
		bold: {
			font: "Times New Roman", style: "bold", px: 16,
			baseline: 5, x_height: 7.2, cap_height: 10.7, tail_height: 3.4
		}
	}
};

carder.deck = function(name, cards, styling, back) {
	return { name: name, cards: Array.from(cards), styling: styling, back: back };
};

carder.as_text = function(glyph) {
	return glyph + "\uFE0E";
}

var default_styling = carder.default_styling = {
	font: carder.fonts["Arial"],
	gutter: 10, card_size: { x: 250, y: 350 }, scale: 3,
	title: {},
	text: { size: 20, pre: function(text, card, styling) {
		var result = [];
		text.replace(/([\W\w]*?)(?:\{([^}]+)}|\*([^*]*)\*|(\n)|$)/g, function(m, text, icon, bold, _break) {
			if (text) {
				result.push(text);
			}
			
			if (icon) {
				if (!(icon in styling.glyphs)) { card.broken = true; console.log("Could not find glyph '" + icon + "'"); }
				else { result.push(styling.glyphs[icon]); }
			}
			else if (bold) {
				result.push({ text: bold, font: styling.font.bold });
			}
			else if (_break) {
				result.push({ break: true });
			}
		});
		return result;
	} },
	stats: { value_size: 40, glyph_size: 52, width: 50, height: 50 },
	icons: { glyph_size: 20, width: 20, height: 20 }
};

return carder;

})();