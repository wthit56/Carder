var og = carder;


carder = (function() {


var card_size;
function carder(cards, styling, back, full) {
	if (cards.length > 69) { alert("Too many cards; each deck can only have 69 cards + 1 back."); return; }
	
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
	
	card_size = { x: styling.size.x * scale, y: styling.size.y * scale };
	
	var loader = imageLoader(TTS);
	
	if (back) {
		back.rendered = loader.load(back.url);
		back.rendered.style.width = styling.size.x + "px";
		back.rendered.className = "card";
		document.body.appendChild(back.rendered);
	}
	
	cards.forEach(function(src) {
		if (src.url) {
			src.rendered = loader.load(src.url);
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
			
			canvas.parentNode.removeChild(canvas);
			src.rendered = loader.load(canvas.toDataURL());
		}
		
		src.rendered.style.width = styling.size.x + "px";
		src.rendered.className = "card";
		document.body.appendChild(src.rendered);
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
		
		var img = new Image();
		img.src = final.toDataURL();
		img.className = "deck"; img.style.width = final.style.width; img.style.height = final.style.height;
		final.parentNode.insertBefore(img, final);
		final.parentNode.removeChild(final);
		
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
	ctx.textBaseline = "top";
	
	var stat_count = 0, icon_count = 0;
	for (var prop in src) {
		if (prop === "debug" || prop === "title" || prop === "text") { continue; }
		
		switch(typeof src[prop]) {
			case "boolean": {
				ctx.save();
				ctx.translate(styling.gutter + (icon_count * (styling.icons.width + styling.gutter)), styling.size.y - styling.icons.height - styling.gutter);
				render_icon(ctx, "", get_icon(styling.icons, prop, src), styling.icons, src.debug);
				ctx.restore();
				icon_count++;
			} break;
			case "string": case "number": {
				ctx.save();
				ctx.translate(styling.gutter, styling.gutter + (stat_count * (styling.stats.height + styling.gutter)));
				render_icon(ctx, src[prop], get_icon(styling.stats, prop, src), styling.stats, src.debug);
				ctx.restore();
				stat_count++;
			} break;
		}
	}
	
	function get_icon(styling, name, src) {
		var icon = styling.pre ? styling.pre(prop, src) : prop;
		if (!icon) { alert("Could not find icon '" + prop + "'."); throw new Error(); }
		return icon;
	}
	
	var t = {
		from: { x: (stat_count > 0 ? styling.gutter + styling.stats.width : 0) + styling.gutter, y: styling.gutter },
		to: { x: styling.size.x - styling.gutter, y: styling.size.y - (icon_count > 0 ? styling.gutter + styling.icons.height : 0) - styling.gutter },
		line_height: 0, indent: 0, break_margin: 0
	};
	
	var text;
	if (src.title) {
		ctx.font = styling.title.style;
		t.line_height = styling.title.line_height; t.break_margin = styling.title.break_margin || 0;
		text = styling.title.pre ? styling.title.pre(src.title, src) : src.title;
		ww_render(ctx,  t, text, r);
		// styling.title.line_height
		t.from.y = r.bottom + styling.title.line_height + styling.gutter;
	}

	if (src.text) {
		ctx.font = styling.text.style;
		t.line_height = styling.text.line_height; t.break_margin = styling.text.break_margin || 0;
		text = styling.text.pre ? styling.text.pre(src.text, src) : src.text;
		(typeof text === "string" ? ww_render : ww_rich)(ctx, t, text, r);
	}
}

function render_icon(ctx, value, icon, styling, debug) {
	if (debug) {
		ctx.save();
		ctx.fillStyle = "rgba(255,0,0,0.2)";
		ctx.fillRect(0, 0,
			styling.width, styling.height);
		ctx.restore();
	}

	ctx.save();
	ctx.translate(styling.width / 2, 0);
	ctx.scale(styling.scale, styling.scale);
	
	ctx.font = icon.style.font;
	ctx.fillText(icon.text,
		-(ctx.measureText(icon.text).width / 2), 
		(styling.height / styling.scale / 2) - (icon.style.line_height / 2)
	);
	
	if (value !== "") {
		ctx.font = styling.text_style;
		ctx.textBaseline = "middle";
		
		var value_width = ctx.measureText(value).width, value_scale = 1;
		value_scale = Math.min(((styling.width / styling.scale) - (styling.gutter / styling.scale)) / value_width, 1);
		
		ctx.translate(0, styling.height / 2 / styling.scale);
		ctx.scale(value_scale, value_scale);
		ctx.translate(-value_width / 2, 0);
		
		ctx.save();
		ctx.strokeStyle = "white"; ctx.lineWidth = 1.5 / value_scale;
		ctx.shadowColor = "white"; ctx.shadowBlur = 10;
		ctx.strokeText(value, 0,0);
		ctx.restore();
		
		ctx.fillText(value, 0,0);
	}
	ctx.restore();
}

og.queue.forEach(function(args) { carder.apply(null, args); });
og = null;

return carder;

})();