var make_canvas = function(config, bg) {
	var canvas = document.createElement("CANVAS");
	var ctx = canvas.context = canvas.getContext("2d");
	
	var scale = config.scale == null ? 1 : config.scale;
	canvas.width = config.width * scale;
	canvas.height = config.height * scale;
	
	canvas.scale = scale;
	canvas.centre = { x: config.width / 2, y: config.height / 2 };
	canvas.centre.pixel = { x: canvas.width / 2, y: canvas.height / 2 };
	
	if (bg) {
		ctx.save();
		ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.restore();
	}
	
	var _drawImage = ctx.drawImage;
	
	ctx.shadow = function(colour, blur) {
		if (!colour || !blur) {
			ctx.shadowBlur = 0;
		}
		else {
			ctx.shadowColor = colour;
			ctx.shadowBlur = blur / canvas.scale;
		}
	};
	
	ctx.sub = function(render) {
		ctx.save();
		render();
		ctx.restore();
	}
	
	ctx.scale(scale, scale);

	
	return canvas;
};