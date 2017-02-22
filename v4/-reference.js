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

function font(config) {
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

	
	
	