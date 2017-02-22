var colour = function(colour) {
	var temp = document.createElement("div");
	temp.style.color = colour // + " !important";
	document.body.appendChild(temp);
	var rgba = window.getComputedStyle(temp).color;
	temp.parentNode.removeChild(temp);
	
	var p = rgba.match(/\d+(?:\.\d+)?/g);
	return {
		r: +p[0], g: +p[1], b: +p[2], alpha: p[3] == null ? 1 : +p[3],
		toString: function() {
			return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
		}
	};
}