var make_canvas = function(config) {
	var canvas = document.createElement("CANVAS");
	
	var scale = config.scale == null ? 1 : config.scale;
	canvas.width = config.width * scale;
	canvas.height = config.height * scale;
	
	canvas.scale = scale;
	canvas.centre = { x: config.width / 2, y: config.height / 2 };
	canvas.centre.pixel = { x: canvas.width / 2, y: canvas.height / 2 };
	
	var ctx = canvas.context = canvas.getContext("2d");
	
	var _drawImage = ctx.drawImage;
	ctx.drawImage.pixel = function(image, a0, a1, a2, a3, a4, a5, a6, a7) {
		ctx.save(); {
			var x = 0, y = 0;
			
			if (arguments.length === 9) {
				x = a4; y = a5;
				a4 = a5 = 0;
			}
			else {
				x = a0; y = a1;
				a0 = a1 = 0;
			}
			
			ctx.translate(x, y);
			ctx.scale(1 / scale, 1 / scale);
			_drawImage.apply(ctx, arguments);
		} ctx.restore();
	};
	
	ctx.scale(scale, scale);
	
	ctx.simple_transform = function(config) {
		if (config.scale) {
			if (typeof config.scale === "number") {
				ctx.scale(config.scale, config.scale);
			}
			else {
				ctx.scale(config.scale.x, config.scale.y);
			}
		}
	};
	
	return canvas;
};