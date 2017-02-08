function card(config, data) {
	var canvas = document.createElement("CANVAS");
	var s = config.scale != null ? config.scale : 1;
	canvas.width = config.card_size.width * s;
	canvas.height = config.card_size.height * s;
	
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0,0, canvas.width, canvas.height);
	
	ctx.fillStyle = "black";
	
	
	
	return canvas;
}