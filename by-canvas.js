//*




function render(glyphs, template, cards, size) {
	if (!size) {
		size = (function() {
			var temp = document.body.appendChild(document.createElement("DIV"));
			temp.className = "card";
			var x = temp.offsetWidth, y = temp.offsetHeight;
			document.body.removeChild(temp);
			return { x: x, y: y, scale: 1 };
		})();
	}
	
	{ // TTS
		var TTS = document.createElement("CANVAS");
		TTS.ctx = TTS.getContext("2d");
		var TTSx = 0, TTSy = 0;
		
		var TTSw = 10, TTSh = 7;
		var sq = Math.sqrt(cards.length + 1);
		if (sq % 1) {
			TTSw = Math.ceil(sq);
			TTSh = Math.ceil((cards.length + 1) / TTSw);
		}
		else {
			TTSw = sq; TTSh = sq;
		}
		console.log("[" + TTSw + "x" + TTSh + "," + cards.length + "]");
		
		TTS.width = size.x * size.scale * TTSw; TTS.height = size.y * size.scale * TTSh;
		TTS.style.cssText = "width:100px; background:#efcccc";
		document.body.appendChild(TTS);
	}
	
	var formatting = { strings: [], stats: [], icons: [] };
	
	if (!template) {
		var template = { title: "", text: "" };
		cards.forEach(function(card) {
			Object.keys(card).forEach(function(key) {
				if (!(key in template)) { template[key] = card[key]; }
			});
		});
		
		// console.log(template);
	}
	
	Object.keys(template).forEach(function(key) {
		// console.log(key);
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

	// console.log(formatting);

	// console.log("to render", cards.length);
	var rendered = 0;
	cards.forEach(function(src) {
		var card = document.createElement("CANVAS");
		document.body.appendChild(card);
		card.style.cssText = "border:2px solid #aaa; width:" + size.x + "px;";
		card.width = size.x * size.scale; card.height = size.y * size.scale;

		var ctx = card.getContext("2d");
		ctx.scale(size.scale, size.scale);
		ctx.font = "1em Arial";

		ctx.fillStyle = "white"; ctx.fillRect(0, 0, size.x, size.y); ctx.fillStyle = "black";
		
		var new_line;

		var line_height = 20, margin = 0, text_margin = 15, stats_margin = 10,
			to = { x: size.x + (formatting.stats.length > 0 ? -render_stat.size.x - stats_margin : 0) - text_margin, y: size.y - text_margin };
		var r = {};
		
		
		
		ctx.font = "bold 2em Times New Roman"; line_height = 35;
		ww_render(ctx, { from: { x: text_margin, y: line_height }, to: to, line_height: line_height }, src.title, r);
		
		margin = 10;
		ctx.font = "1em Arial"; line_height = 20;
		if (typeof src.text === "string") {
			ww_render(ctx, { from: { x: text_margin, y: r.bottom + line_height + margin }, to: to, line_height: line_height, break_margin: 10 }, src.text);
		}
		else {
			ww_rich(ctx, { from: { x: text_margin, y: r.bottom + line_height + margin }, to: to, line_height: line_height, break_margin: 10 }, src.text);
		}

		margin = 10;
		var line_height = render_stat.size.y + render_stat.size.margin, y = margin;
		formatting.stats.forEach(function(stat, i) {
			if (src[stat] != null) {
				render_stat(ctx, size.x - render_stat.size.x - stats_margin, y, src[stat], glyphs[stat]);
				y += line_height;
			}
			// console.log(margin + (line_height * i));
		});

		/*
		var i = render_stat.size.y + render_stat.size.margin;
		render_stat(ctx, size.x - render_stat.size.x - stats_margin, 10 + i * 0, 9, "cost");
		render_stat(ctx, size.x - render_stat.size.x - stats_margin, 10 + i * 1, 99, "attack");
		render_stat(ctx, size.x - render_stat.size.x - stats_margin, 10 + i * 2, 999, "defense");
		render_stat(ctx, size.x - render_stat.size.x - stats_margin, 10 + i * 3, 9999, "truce");
		render_stat(ctx, size.x - render_stat.size.x - stats_margin, 10 + i * 4, 99999, "yes");
		*/
		
		margin = 10;
		var x = 0, y = size.y - render_stat.size.y - margin;
		formatting.icons.forEach(function(icon) {
			if (src[icon]) {
				// console.log(icon);
				render_stat(ctx, x, y, null, glyphs[icon]);
				x += render_stat.size.x;
			}
		});
		
		/*
		var image = new Image();
		image.src = card.toDataURL();
		document.body.appendChild(image);
		*/
		
		rendered++;
		TTS.ctx.drawImage(card, TTSx * size.x * size.scale, TTSy * size.y * size.scale);
		// console.log(card, TTSx * size.x, TTSy * size.y);
		if (++TTSx > TTSw - 1) { TTSx = 0; TTSy++; }
		// console.log(TTSx, TTSy);
	});
	
	// console.log("rendered", rendered);
	
	var image = new Image(); image.src = TTS.toDataURL(); document.body.appendChild(image);
	image.width = 100;
//*/
}







function render_stat(ctx, x, y, value, icon) {
	var midX = render_stat.size.x / 2, midY = render_stat.size.y / 2;
	ctx.save(); {
		ctx.translate(x, y);
		
		ctx.font = "3em Arial bold";
		ctx.fillStyle = "black";
		ctx.fillText(icon, midX + (-ctx.measureText(icon).width / 2), render_stat.size.y);
		
		if (value != null) {
			ctx.font = "2em Arial";
			ctx.translate(midX, render_stat.size.y / 2);
			
			var target_width = render_stat.size.x - 15;
			var text_width = ctx.measureText(value).width, text_height = 30;
			if (text_width > target_width) {
				var s = target_width / text_width;
				ctx.font = (2 * s) + "em Arial";
				text_width *= s; text_height *= s;
			}
			
			ctx.strokeStyle = "white"; ctx.lineWidth = 2.5;
			ctx.strokeText(value, -text_width / 2, text_height / 2);
			ctx.fillText(value, -text_width / 2, text_height / 2);
		}
	} ctx.restore();
}
render_stat.size = { x: 50, y: 40, margin: 5 };