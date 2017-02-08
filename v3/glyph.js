function glyph(char, as_text, font, centre, radius) {
	return {
		char: char + (as_text ? "\uFE0E" : ""), font: font,
		centre: centre, radius: radius,
		
		render: function(ctx, x, y, radius) {
			ctx.save(); {
				ctx.textBaseline = "top";
				ctx.font = this.font;
				
				var scale = radius / this.radius;
				ctx.translate(x, y);
				ctx.scale(scale, scale);
				
				ctx.fillText(this.char, -this.centre.x, -this.centre.y);
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