function embiggenner(canvas, size) {
	canvas.preview_size = size;
	
	canvas.style.width = size.width + "px";
	canvas.onclick = function() {
		canvas.embiggen = !canvas.embiggen;
		
		if (canvas.embiggen) {
			canvas.style.left = canvas.offsetLeft + "px";
			canvas.style.top = canvas.offsetTop + "px";
			canvas.style.position = "absolute";
			canvas.style.width = "";
			canvas.style.borderRadius = "30px";
		}
		else {
			canvas.style.position = "";
			canvas.style.width = size.width + "px";
			canvas.style.borderRadius = "";
		}
	};
	
	canvas.style.width = size.width + "px";
}
