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
	function draw() { return ((config.pixel && canvas.context.drawImage.pixel) || canvas.context.drawImage).apply(canvas.context, arguments); }

	var none = {};
	var x = 0, y = 0;
	
	var s = (config.pixel ? canvas.scale : 1);
	
	var t = simple_transform.normalize({ translate: config.centre || config.position, rotate: config.rotate, scale: config.scale });
	
	var mx = ((image.width / 2) / s),
		my = ((image.height / 2) / s);
	
	
	if (!config.centre) {
		t.translate.x += mx * t.scale.x; t.translate.y += my * t.scale.y;
	}

	if (config.darken) {
		image = overlay(image, "darken", 1, config.darken);
	}

	canvas.context.save(); {
		simple_transform(canvas.context, t);
		draw(image, -mx, -my);
	} canvas.context.restore();

};
images.render.on_image = function(ctx, config) { images.render(ctx, this, config); };

function overlay(a, operation, alpha, b, debug) {
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

overlay.darken_on_image = ooi("darken");
overlay.lighten_on_image = ooi("darken");
function ooi(gco) {
	return function(config) {
		return overlay.overlay_on_image.call(this, gco, config);
	};
}

function setup(image) {
	image.render = images.render.on_image;
	image.darken = image.tint = overlay.darken_on_image;
	image.lighten = overlay.lighten_on_image;
	image.overlay = overlay.overlay_on_image;
	image.overlay_debug = overlay.overlay_on_image_debug;
}
