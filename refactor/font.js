function font(config) {
	var font = (
		(config.italic ? "italic " : "") +
		(
			config.bold == null ? ""
			: typeof config.bold === "boolean" ?
				config.bold ? "bold " : ""
			: config.bold + " "
		) +
		(config.size != null
			? config.size +
				(typeof config.size === "number" ? "px" : "") +
				" "
			: ""
		) +
		quoted(config.family)
	);
	
	config.set = function(ctx) {
		if (ctx.font !== font) { ctx.font = font; }
		return font;
	};
	config.render = function(ctx, text, x, y, max_width, scale) {
		if (scale == null) { scale = 1; }

		var y_offset = this[ctx.textBaseline] || 0;
		console.log(ctx.textBaseline, y_offset);
		ctx.save(); {
			ctx.translate(x, y + y_offset);
			ctx.scale(scale, scale);
			
			if (max_width != null) {
				ctx.fillText(text, 0, 0, max_width);
			}
			else {
				ctx.fillText(text, 0, 0);
			}
		} ctx.restore();
	};
	config.measureText = function(ctx, text, scale) {
		if (scale == null) { scale = 1; }
		
		var result;
		ctx.save(); {
			this.set(ctx);
			result = { width: ctx.measureText(text).width * scale };
		} ctx.restore();
		return result;
	};
	
	return config;
}

function quoted(f) {
	return (f.indexOf(" ") !== -1 ? "'" + f.replace(/'/g, "\\'") + "'" : f);
}