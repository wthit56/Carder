function fonts() {
	return {
		add: function(config) {
			// starts loading from google fonts...
			return font(config);
		},
		then: function(next) {
			// when all fonts have loaded
			next();
		}
	}
}
fonts.font = function(config) {
	config.face == string; // name of the font
	config.size == number; // font size in pixels
	config.bold == boolean;
	config.italic == boolean;
	
	// based on the given font face, size, bold,
	// and italic settings
	config.top == number || null;
	config.hanging == number || null;
	config.middle == number || null;
	config.alphabetic == number || null;
	config.ideographic == number || null;
	config.bottom == number || null;
	// use carder/v4/font-config.html
	//   for help with alignment
	
	config.measure = function(context, text, scale) {
		scale |= 1;
		return {
			width: number, // width of text at scale 
			height: number // height of text at scale
		};
	}
	config.render = function(context, text, x, y, max_width, align, scale, renderers) {
		align |= "left top"; // alignment of text relative to (x, y)
		scale |= 1;
		
			max_width == number || null; // when max_width is defined
			// and the text is wider than the value,
			// the text will be squeezed width-wise
			
			align == (
				(left | middle | right) + " " + ("mid-cap" | text baseline)
				|| null
			);
			renderers == (
				[
					function renderer(context, text, x, y, max_width) {
						this == config; // the font object that called it
					},
					// ...
				]
				|| null
			);
		}
	};
	
	return config;
}

function images() {
	{ // tint value type
		(
			tint == "css colour"
		|| (
			tint.alpha == number; // 0 - 1, how intense the tint is
			tint.overlay == "css colour";
		)
	}
	
	{ // xy value type
		xy == (
			n // number converted to { x: n, y: n }
			|| { x: number, y: number }
		);
	}
	
	return {
		add: function(src) {
			src == string; // source filepath or url
			var img = Image();
			
			{ // shortcuts to use images methods
				img.render = function(canvas, config) { };
				img.overlay = function(operation, tint) { };
				img.darken = function(tint) { };
				img.lighten = function(tint) { };
			}
			
			// image starts loading...
			return img;
		},
		
		then: function(next) {
			// when all images are loaded
			next();
		}
	}
}
images.render = function(canvas, image, config) {
	// tints are applied in this order:
	config.darken == tint || null;
	config.lighten == tint || null;
	
	config.position |= { x: 0, y: 0 };
	config.position == xy;
	
	// from on the centre of the image
	config.scale |= { x: 1, y: 1 };
	config.scale == xy;
	
	// from the centre of the image
	config.rotate == (
		number // in degrees
		|| config.rotate == "Ndeg" // number N in degrees
		|| config.rotate == "Nrad" // number N in radians
	);
	
	config.align == { // relative to position, ignoring rotation
		x: (left | middle | right),
		y: (top | middle | bottom)
	}
	
	canvas.drawImage(image);
};
images.overlay = function(source, operation, initial alpha, overlay, debug) {
	source == Image;
	operation == string; // globalCompositeOperation
	overlay == tint;
	
	// if debug is on, adds intermediate canvas views to the document
	debug == boolean; // defaults to false
}

function glyphs() {
	return {
		add: function(char, as_text, font, centre, radius, colour, rotation, scale_x, scale_y) {
			// before font is loaded
			return glyph; // using same arguments
		},
		then: function(next) {
			// when all fonts are loaded and glyphs are ready to use
			next();
		}
	}
}
glyphs.glyph = function(char, as_text, font, centre, radius, colour, rotation, scale_x, scale_y) {
	{ // arguments
		char == string; // preferably a single character so that as_text works
		font == string; // full font css string (eg. "40px Arial")
		colour == string; // css colour; glyph will use this colour as the fill
		
		radius == number; // pixels from the centre to the edge of the glyph
		// used for automatic scaling
		
		as_text |= false;
		as_text == boolean; // if true, special character will be added
		// that turns most unicode characters into black and white mode
		
		{ // transformation applied in the following order:
			rotation == number; // degrees to rotate around centre
			
			scale_x == number; scale_y == number;
			
			centre |= { x: 0, y: 0 }; // pixel position of "centre" of the character
			centre.x == number; centre.y == number;
		}
	}

	return {
		char, as_text, font, centre, radius, colour, rotation, scale_x, scale_y,
		
		render: function(ctx, x, y, radius, fill_override, rotate) {
			x == number; y == number; // centre to render the glyph from
			radius == number; // the maximum radius the glyph can be
			// rendered glyph will be scaled to match
			
			{ // optional
				fill_override == string; // css colour;
				// glyph will be filled with colour instead of the configured setting
				rotate == number; // will be added to configured rotation
			}
		},
		measure: function(ctx, scale) { // scrap?
			scale |= 1;
			return {
				width: number, height: number
				// size of glyph to scale
			}
		}
	};
}


cardsheet = function(config, cards) {
	config == {
		card_size: { width: number, height: number },
		hidden: canvas_render || image,
		
		// optional
		max_size: number // max square size in pixels
		grid: { cols: number, rows: number }, // set how many cards wide and high
	};
	
	cards == [canvas_render || image ...];
	
	return {
		cards: [{ cardsheet: canvas_render, index: card_number_in_cardsheet }, ...],
		cardsheets: [{
			cardsheet: canvas_render, cols: number, rows: number
		}, ...]
	};
};
