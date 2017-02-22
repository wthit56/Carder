var images = (function() {
	var images = function() {
		var next = then();
		
		return {
			add: function(src) {
				var image = new Image();
				image.onload = next.add();
				image.src = src;
				setup(image);
				return image;
			},
			then: next.then
		};
	};

	images.render = function(canvas, image, config) {
		// built-in tints
		if (config.darken) {
			image = overlay(image, "darken", 1, config.darken);
		}
		if (config.lighten) {
			image = overlay(image, "lighten", 1, config.lighten);
		}
		
		// normalize early to adjust later
		var t = simple_transform.normalize({
			translate: config.position,
			rotate: config.rotate,
			scale: (config.scale === "no stretch" ? 1 / canvas.scale : config.scale)
		});
		
		// centre of image
		var mx = (image.width / 2),
			my = (image.height / 2);

		// alignment offset factor
		var ax = 1, ay = 1;
		if (config.align) {
			switch (config.align.x || "left") {
				case "left": { ax = 1; } break;
				case "middle": { ax = 0; } break;
				case "right": { ax = -1; } break;
			}
			switch (config.align.x || "top") {
				case "top": { ay = 1; } break;
				case "middle": { ay = 0; } break;
				case "bottom": { ay = -1; } break;
			}
		}
		
		// adjust centre for alignment
		t.translate.x += mx * ax * t.scale.x;
		t.translate.y += my * ay * t.scale.y;

		// render
		canvas.context.save(); {
			simple_transform(canvas.context, t);
			if (config.alpha != null && config.alpha != 1) {
				canvas.context.globalAlpha = config.alpha;
			}
			
			// mx and my makes the rotation and scale pivot about (0, 0)
			canvas.context.drawImage(image, -mx, -my);
		} canvas.context.restore();

	};
	images.render.on_image = function(ctx, config) { images.render(ctx, this, config); };

	var overlay = images.overlay = function overlay(a, operation, alpha, b, debug) {
		if (alpha === 0) { return a; }
		
		var canvas = document.createElement("CANVAS"), ctx = canvas.getContext("2d");
		canvas.width = a.width; canvas.height = a.height;
		if (debug) { document.body.appendChild(canvas); }
		
		ctx.drawImage(a, 0, 0);
		ctx.globalCompositeOperation = "source-in";
		if (b.alpha != null) {
			return overlay(a, operation, alpha * b.alpha, b.overlay, debug);
		}
		else {
			ctx.fillStyle = b;
			ctx.fillRect(0, 0, a.width, a.height);
		}
		b = canvas;
		
		var canvas = document.createElement("CANVAS"), ctx = canvas.getContext("2d");
		canvas.width = a.width; canvas.height = a.height;
		if (debug) { document.body.appendChild(canvas); }
		
		ctx.drawImage(a, 0, 0);
		ctx.globalAlpha = alpha;
		ctx.globalCompositeOperation = operation;
		ctx.drawImage(b, 0, 0);
		return canvas;
	}
	overlay.overlay_on_image = function(operation, config, debug) {
		var overlayed = overlay(this, operation, 1, config, debug);
		setup(overlayed);
		return overlayed;
	};
	overlay.overlay_on_image_debug = function(operation, config) {
		return overlay.overlay_on_image.call(this, operation, config, true);
	};

	function ooi(gco) {
		return function(config) {
			return overlay.overlay_on_image.call(this, gco, config);
		};
	}
	overlay.darken_on_image = ooi("darken");
	overlay.lighten_on_image = ooi("darken");

	function setup(image) {
		image.render = images.render.on_image;
		image.darken = image.tint = overlay.darken_on_image;
		image.lighten = overlay.lighten_on_image;
		image.overlay = overlay.overlay_on_image;
		image.overlay_debug = overlay.overlay_on_image_debug;
	}
	
	return images;
})();