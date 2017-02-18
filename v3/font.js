function font(config) {
	var font = "", font_key = "";
	
	function update_font(f) {
		var k = [f.face, f.bold, f.italic, f.size].join("|");
		if (k !== font_key) {
			font = (
				(f.italic ? "italic " : "") +
				(
					f.bold == null ? ""
					: typeof f.bold === "boolean" ?
						f.bold ? "bold " : ""
					: f.bold + " "
				) +
				(f.size != null
					? f.size +
						(typeof f.size === "number" ? "px" : "") +
						" "
					: ""
				) +
				quoted(f.face)
			);
			font_key = k;
		}
		// console.log(f.italic, font);
		return font;
	}
	
	config.set = function(ctx) {
		update_font(this);
		if (ctx.font !== font) { ctx.font = font; }
		return font;
	};
	config.render = function(ctx, text, x, y, max_width, scale, order, position) {
		if (scale == null) { scale = 1; }
		if (position == null) { position = "top left"; }

		position = position.split(" ");
		position = { x: position[1], y: position[0] };

		ctx.save(); {
			this.set(ctx);
			
			var y_offset = 0;
			if (position.y in this) { y_offset = -this[position.y] || 0; }
			else {
				switch(position.y) {
					case "bottom": {
						y_offset = -this.bottom || 0;
					} break;
					case "mid-cap": {
						var h = (this.hanging || 0), a = (this.alphabetic || 0);
						y_offset = -h - ((a - h) / 2);
					} break;
				}
			}
			y_offset = (y_offset * scale) + (this[ctx.textBaseline] || 0) * scale;
			
			
			var x_offset = 0;
			if (position.x !== "left") {
				var width = ctx.measureText(text).width * scale;
				
				switch(position.x) {
					case "right": {
						x_offset = -width;
					} break;
					case "middle": {
						x_offset = -width / 2;
					} break;
				}
			}
		
			ctx.translate(x + x_offset, y + y_offset);
			ctx.scale(scale, scale);
			
			if ((order === "stroke fill") || (order === "stroke")) {
				if (max_width != null) { ctx.strokeText(text, 0, 0, max_width); }
				else { ctx.strokeText(text, 0, 0); }
			}
			
			if (order === "stroke fill" || order === "fill stroke" || order === "fill" || order == null) {
				if (max_width != null) {
					ctx.fillText(text, 0, 0, max_width);
				}
				else {
					ctx.fillText(text, 0, 0);
				}
			}

			if (order === "fill stroke") {
				if (max_width != null) { ctx.strokeText(text, 0, 0, max_width); }
				else { ctx.strokeText(text, 0, 0); }
			}
		} ctx.restore();
	};
		
	config.measure = function(ctx, text, scale) {
		if (scale == null) { scale = 1; }
		
		var result;
		ctx.save(); {
			this.set(ctx);
			result = { width: ctx.measureText(text).width * scale, height: this.bottom };
		} ctx.restore();
		return result;
	};
	
	return config;
}

function quoted(f) {
	return (f.indexOf(" ") !== -1 ? "'" + f.replace(/'/g, "\\'") + "'" : f);
}