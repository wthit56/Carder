function glyph(char, as_text, font, centre, radius, colour, rotation, scale_x, scale_y) {
	return {
		char: char + (as_text ? "\uFE0E" : ""), font: font,
		centre: centre, radius: radius, colour: colour,
		
		render: function(ctx, x, y, radius, fill_override, rotate) {
			rotate = rotation || rotate || 0;
			var sx = scale_x == null ? 1 : scale_x,
				sy = scale_y == null ? 1 : scale_y;
				
			ctx.save(); {
				ctx.fillStyle = fill_override || this.colour;
				
				// if (this.char === "+") { debugger; }
				
				ctx.textBaseline = "top";
				ctx.font = this.font;
			
			/*
			ctx.translate(x - this.centre.x, y - this.centre.y);
			if (rotate) {
				ctx.rotate(rotate * Math.PI / 180);
			}
			ctx.scale(sx * scale, sy * scale);
			
			ctx.fillText(this.char, 0, 0);
			*/
				
				var scale = radius / this.radius;
				ctx.translate(x, y);
				// ctx.translate(x - this.centre.x * sx * scale, y - this.centre.y * sy * scale);
				if (rotate) {
					ctx.rotate(rotate * Math.PI / 180);
				}
				ctx.scale(sx * scale, sy * scale);
				
				ctx.fillText(this.char, -this.centre.x, -this.centre.y);
				// ctx.fillText(this.char, 0, 0);
			} ctx.restore();
		},
		measure: function(ctx, scale) {
			var r = { width: 0, height: 0 };
			ctx.save(); {
				ctx.font = this.font;
				r.width = r.height = radius * 2 * scale;
			} ctx.restore();
			return r;
		}
	};
}