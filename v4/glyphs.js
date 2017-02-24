var glyphs = function() {
	var load_fonts = fonts();
	return {
		add: function(char, as_text, font, centre, radius, colour, rotation, scale_x, scale_y) {
			var temp = document.body.appendChild(document.createElement("SPAN"));
			temp.style.font = font;
			var family = window.getComputedStyle(temp)["font-family"];
			temp.parentNode.removeChild(temp);
			load_fonts.add({ face: family.split(/,\s+/g)[0] });
			return glyphs.glyph.apply(null, arguments);
		},
		then: load_fonts.then
	};
}

glyphs.glyph = function glyph(char, as_text, font, centre, radius, colour, rotation, scale_x, scale_y) {
	if (!centre) { centre = { x: 0, y: 0 }; }
	
	return {
		char: char + (as_text ? "\uFE0E" : ""), font: font,
		centre: centre, radius: radius, colour: colour,
		
		render: function(ctx, x, y, radius, fill_override, rotate) {
			rotate = (rotation || 0) + (rotate || 0);
			var sx = scale_x == null ? 1 : scale_x,
				sy = scale_y == null ? 1 : scale_y;
				
			ctx.save(); {
				ctx.textBaseline = "middle";
				ctx.font = this.font;
				ctx.fillStyle = fill_override || this.colour;
				
				ctx.translate(x, y);
				
				var scale = radius / this.radius;
				if (rotate !== 0) {
					ctx.rotate(rotate * Math.PI / 180);
				}
				if (scale !== 1) {
					ctx.scale(scale * sx, scale * sy);
				}
				
				ctx.fillText(this.char, -this.centre.x, -this.centre.y);
			} ctx.restore();
		},
		measure: function(ctx, scale) {
			if (scale == null) { scale = 1; }
			
			var r = { width: 0, height: 0 };
			ctx.save(); {
				ctx.font = this.font;
				r.width = r.height = radius * 2 * scale;
			} ctx.restore();
			return r;
		}
	};
}