var og = carder;


carder = (function() {

var default_styling = { // styling
	glyphs: {
		default_style: { font: "1.8em Arial", offset: -3 }
	},
	size: { x: 250, y: 350 }, scale: 3,
	stats: { width: 50, height: 50, offset: -1,
		value_style: { font: "1.4em Arial", scale: 2, offset: 2 },
		glyph_scale: 2,
		pre: function(name, card, styling) { return styling.glyphs[name]; } },
	icons: { scale: 1, width: 29, height: 28,
		glyph_style: { font: "1.8em Arial", offset: -3 },
		pre: function(name, card, styling) { return styling.glyphs[name]; } },
	title: { font: "bold 2.0em Times New Roman", line_height: 35 },
	text: { font: "1.4em Arial", line_height: 28, break_margin: 10, pre: function(src, card, styling) {
		var result = [];
		
		src.replace(/([\W\w]*?)(?:\*([^*]*)\*|_([^_]*)_|\{([^}]+)}|(\n)|$)/g, function(m, text, bold, italic, icon, newline) {
			var add;
			if (text) { result.push({ text: text }); }
			
			if (bold) { add = { text: bold, style: "bold " + styling.text.style }; }
			else if (italic) { add = { text: bold, style: "italic " + styling.text.style }; }
			else if (icon) {
				var icon = styling.glyphs[icon];
				// water: { text: "\uD83D\uDCA7", style: { font: "1.5em Arial", line_height: 26 } }, // 💧
				add = (typeof icon === "object") ? icon : {
					text: icon, style: styling.glyphs.default_style
				};
			}
			else if (newline) { add = { break: true }; }
			
			if (add) { result.push(add); }
		});
		
		
		return result;
	} },
	gutter: 10
}

function def(obj, _default) {
	for (var name in _default) {
		if (!(name in obj)) { obj[name] = _default[name]; }
		else if (typeof _default[name] === "object") { def(obj[name], _default[name]); }
	}
}

var card_size;
function carder(cards, styling, back, full) {
	if (cards.length > 69) { alert("Too many cards; each deck can only have 69 cards + 1 back."); return; }
	
	if (!styling) { styling = default_styling; }
	else { def(styling, default_styling); }
	
	console.log(styling);
	
	var width, height;
	if (!full) {
		var square = Math.sqrt((styling.size.x * styling.scale) * (styling.size.y * styling.scale) * (cards.length + 1));
		width = Math.min(Math.ceil(square / (styling.size.x * styling.scale)), 10);
		height = Math.ceil((cards.length - 1) / width);
	}
	else {
		width = 10; height = 7;
	}
	
	var scale = styling.scale, max_size = 4096;
	if (styling.size.y * scale * height > max_size) {
		scale = Math.floor(max_size / height / styling.size.y);
	}
	if (styling.size.x * scale * width > max_size) {
		scale = Math.floor(max_size / width / styling.size.x);
	}
	
	if (scale !== styling.scale) { console.log("scale: original " + styling.scale + ", changed to " + scale); }
	
	card_size = { x: styling.size.x * scale, y: styling.size.y * scale };
	
	var loader = imageLoader(TTS);
	
	if (back) {
		back.rendered = loader.load(back.url);
		back.rendered.style.width = styling.size.x + "px";
		back.rendered.style.height = styling.size.y + "px";
		back.rendered.className = "card";
		document.body.appendChild(back.rendered);
	}
	
	cards.forEach(function(src) {
		if (src.url) {
			src.rendered = loader.load(src.url);
			document.body.appendChild(src.rendered);
		}
		else if (src.path) {
			src.rendered = loader.load(src.path);
			document.body.appendChild(src.rendered);
		}
		else {
			var canvas = src.rendering = document.body.appendChild(document.createElement("CANVAS"));
			canvas.width = card_size.x; canvas.height = card_size.y; canvas.style.width = styling.size.x + "px";
			var ctx = canvas.getContext("2d");
			ctx.save(); {
				ctx.fillStyle = "white";
				ctx.fillRect(0,0, card_size.x,card_size.y);
			} ctx.restore();
			
			ctx.scale(scale, scale);
			
			render_card(ctx, src, styling);
			src.rendered = canvas;
		}
		
		src.rendered.style.width = styling.size.x + "px";
		src.rendered.style.height = styling.size.y + "px";
		src.rendered.className = "card";
	});
	
	loader.start();
	
	function TTS() {
		var final = document.body.appendChild(document.createElement("CANVAS"));
		final.className = "deck";
		final.width = width * card_size.x; final.height = height * card_size.y;
		
		var ctx = final.getContext("2d");
		ctx.fillRect(0,0, final.width, final.height);

		if (final.width > final.height) { final.style.width = Math.min(styling.size.x, 300) + "px"; }
		if (final.width <= final.height) { final.style.height = Math.min(styling.size.y, 300) + "px"; }
		
		var x = 0, y = 0;
		for (var i = 0, card, l = cards.length; i < l; i++) {
			card = cards[i];
			ctx.drawImage(card.rendered, x * card_size.x, y * card_size.y, card_size.x, card_size.y);
			if (++x >= width) { x = 0; y++; }
		}
		
		if (back) {
			ctx.drawImage(back.rendered, final.width - card_size.x, final.height - card_size.y, card_size.x, card_size.y);
		}
		
		document.body.appendChild(document.createElement("SPAN")).innerText = "[" + width + "x" + height + "," + cards.length + "] ("+card_size.x+", "+card_size.y+")";
	}
}

function imageLoader(oncomplete) {
	var total = 0, loaded = 0;
	function onload() {
		loaded++;
		if (loaded >= total) {
			oncomplete();
		}
	}
	
	var imgs = [], srcs = [];
	
	return {
		load: function(src) {
			total++;
			var img = new Image();
			img.onload = onload;
			// img.src = src;
			imgs.push(img); srcs.push(src);
			return img;
		},
		start: function() {
			imgs.forEach(function(img, i) {
				img.src = srcs[i];
			});
		}
	};
}

function render_card(ctx, src, styling) {
	// function ww_render(ctx, telem, text, result) {
	var r = { hanger: 0, bottom: 0 }, line_height;
	ctx.textBaseline = "middle";
	
	var stat_count = 0, icon_count = 0;
	for (var prop in src) {
		switch (prop) {
			case "debug": case "title": case "text": case "rendering": case "rendered":
				continue;
		}
		
		switch(typeof src[prop]) {
			case "boolean": {
				ctx.save();
				ctx.translate(styling.gutter + (icon_count * (styling.icons.width + styling.gutter)), styling.size.y - styling.icons.height - styling.gutter);
				if (render_icon(ctx, "", get_icon(styling.icons, prop, src, styling), styling.icons, styling, src.debug)) {
					icon_count++;
				}
				ctx.restore();
			} break;
			case "string": case "number": {
				ctx.save();
				ctx.translate(styling.gutter, styling.gutter + (stat_count * (styling.stats.height + styling.gutter)));
				if (render_icon(ctx, src[prop], get_icon(styling.stats, prop, src, styling), styling.stats, styling, src.debug)) {
					stat_count++;
				}
				ctx.restore();
			} break;
		}
	}
	
	function get_icon(style, name, src, styling) {
		var icon = style.pre ? style.pre(prop, src, styling) : null;
		if (icon === undefined) { console.log("Could not find icon '" + prop + "'."); }
		else if (icon === null) { icon = ""; }
		return icon;
	}
	
	var t = {
		from: { x: (stat_count > 0 ? styling.gutter + styling.stats.width : 0) + styling.gutter, y: styling.gutter },
		to: { x: styling.size.x - styling.gutter, y: styling.size.y - (icon_count > 0 ? styling.gutter + styling.icons.height : 0) - styling.gutter },
		line_height: 0, indent: 0, break_margin: 0
	};
	
	var text;
	if (src.title) {
		ctx.save();
		ctx.font = styling.title.font;
		t.line_height = styling.title.line_height; t.break_margin = styling.title.break_margin || 0;
		t.from.y += t.line_height / 2;
		ctx.translate(0, 0);
		text = styling.title.pre ? styling.title.pre(src.title, src, styling) : src.title;
		ww_render(ctx, t, text, r);
		// styling.title.line_height
		t.from.y = r.bottom + styling.title.line_height;
		ctx.restore();
	}

	if (src.text) {
		ctx.font = styling.text.font;
		t.line_height = styling.text.line_height; t.break_margin = styling.text.break_margin || 0;
		if (!r.bottom) {
			t.from.y += t.line_height / 2;
		}
		text = styling.text.pre ? styling.text.pre(src.text, src, styling) : src.text;
		(typeof text === "string" ? ww_render : ww_rich)(ctx, t, text, r);
	}
}

function render_icon(ctx, value, icon, style, styling, debug) {
	if (debug) {
		ctx.save();
		ctx.fillStyle = "rgba(255,0,0,0.2)";
		ctx.fillRect(0, 0,
			style.width, style.height);
		ctx.restore();
	}

	ctx.save();
	ctx.translate(style.width / 2, style.height / 2);

	var rendered = false;
	
	if (icon) {
		var icon_text = icon.text || icon;
		if (icon_text) {
			var icon_style = (icon.style || style.glyph_style);
			
			ctx.font = icon_style.font || styling.glyphs.default_style.font;
			
			var scale = style.glyph_scale;
			var x = ctx.measureText(icon_text).width;
			x = -(x / 2);
			
			var y = icon_style.offset || styling.glyphs.default_style.offset;
			ctx.save();
			ctx.scale(scale, scale);
			ctx.fillText(icon_text, x, y);
			ctx.restore();
			
			rendered = true;
		}
	}
	
	if (value !== "") {
		var value_style = style.value_style;
		ctx.translate(0, 0);
		ctx.font = value_style.font;
		
		var value_width = ctx.measureText(value).width, value_scale = 1;
		console.log(value, style.width);
		value_scale = Math.min(((style.width / styling.scale) - (styling.gutter / styling.scale)) / value_width, 1);
		
		ctx.translate(0, style.height / 2 / styling.scale);
		ctx.scale(value_scale, value_scale);
		ctx.translate(-value_width / 2, 0);
		
		ctx.save();
		ctx.strokeStyle = "white"; ctx.lineWidth = 1.5 / value_scale;
		ctx.shadowColor = "white"; ctx.shadowBlur = 10;
		ctx.strokeText(value, 0,0);
		ctx.restore();
		
		ctx.fillText(value, 0,0);
		
		rendered = true;
	}
	ctx.restore();
	
	return rendered;
}

og.queue.forEach(function(args) { carder.apply(null, args); });
og = null;

return carder;

})();