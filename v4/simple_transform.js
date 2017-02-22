
var simple_transform = (function() {
	var simple_transform = function(ctx, config) {
		if (config.normalize) { config = simple_transform.normalize(config); }
		ctx.translate(config.translate.x, config.translate.y);
		ctx.rotate(config.rotate);
		ctx.scale(config.scale.x, config.scale.y);
	};

	simple_transform.normalize = function(config) {
		return {
			translate: simple_vec(config.translate, 0),
			scale: simple_vec(config.scale, 1),
			rotate: simple_angle(config.rotate)
		}
	};

	var simple_vec = function(val, default_val) {
		if (val == null) { val = default_val || 0; }
		
		if (typeof val === "number") { return { x: val, y: val }; }
		else { return { x: val.x, y: val.y }; }
	}
	
	var parse = /^(\d+(?:\.\d+)?)(deg|rad)$/;
	var to_rad = Math.PI / 180;
	var simple_angle = function(val) {
		switch (typeof val) {
			case "number": return val * to_rad;
			case "string": {
				var p = val.match(parse);
				val = +p[1];
				if (p[2] === "rad") { return val; }
				else { return val * to_rad; }
			} break;
			default: return 0;
		}
	}
	
	return simple_transform;
})();