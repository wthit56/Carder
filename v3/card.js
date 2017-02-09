function card(config, data) {
	console.log(config.layout[0].box);
	
	var canvas = document.createElement("CANVAS");
	var s = config.scale != null ? config.scale : 1;
	canvas.width = config.card_size.width * s;
	canvas.height = config.card_size.height * s;
	
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0,0, canvas.width, canvas.height);
	
	ctx.scale(s, s);
	
	ctx.fillStyle = "black";
	ctx.textBaseline = "alphabetic";
	
	// config.layout[0].includes[0].font.render(ctx, "Txp", 0, 0, null, 1);
	
	for (var i = 0, l = config.layout.length; i < l; i++) {
		var area = config.layout[i];
		switch (area.type) {
			case "textbox": {
				var t = textbox(area.box);
				for (var p = 0, pl = area.includes.length; p < pl; p++) {
					var named = area.includes[p];
					if (named.name in data) {
						var result = t.write(ctx, [data[named.name]], named.font, named.scale, named.leading || 0, named.break || 0);
						console.log(result);
						if (!result.complete) { console.log("Could not complete render"); }
					}
				}
			} break;
			case "list": {
				var x = area.box.from.x, y = area.box.from.y;
				var wide = area.box.to.x - area.box.from.x, high = area.box.to.y - area.box.from.y;
				var hor = wide > high, size = hor ? high : wide;
				
				var includes;
				if (area.preserve_order) {
					includes = area.includes.slice();
					
					var start = 0;
					for (var p in data) {
						var index = includes.indexOf(p);
						if (index !== -1) {
							includes.splice(index,1);
							includes.splice(start,0, p);
							start++;
						}
					}
				}
				else { includes = area.includes; }
				
				for (var p = 0, pl = includes.length; p < pl; p++) {
					ctx.save(); {
						var named = includes[p], missing = true;
						if (named in data) { missing = false; }
						
						if (!missing || (area.missing !== "collapse")) {
							var cx = x + (size / 2), cy = y + (size / 2);
							if (missing) { ctx.fillStyle = area.missing; }
							config.lookup[named].render(ctx, cx, cy, size / 2);
							
							if (!missing && area.value && (data[named] !== "")) {
								ctx.save(); {
									var f = area.value.font, fs = (area.value.scale != null ? area.value.scale : 1),
										w = f.measure(ctx, data[named], fs).width,
										s = Math.min(size / w, 1);
									fs *= s;
										
									var fx = cx - (w * s / 2), fy = cy - ((f.hanging + (f.alphabetic / 2)) * fs);
									ctx.shadowColor = ctx.strokeStyle = area.value.outline || "white";
									ctx.lineWidth = (area.value.line || 2) / fs; ctx.shadowBlur = (area.value.shadow || 0) / fs;
									f.render(ctx, data[named], fx, fy, null, fs, "stroke");
									ctx.shadowBlur = 0;
									f.render(ctx, data[named], fx, fy, null, fs, "fill");
									
									/*
									ctx.fillStyle = "rgba(255,0,0,0.9)";
									ctx.fillRect(cx - 10, cy - 0.5, 20, 1);
									//*/
								} ctx.restore();
							}
							
							if (hor) { x += size + area.break; }
							else { y += size + area.break; }
							
							if ((hor && x + size > area.box.to.x) || (!hor && y + size > area.box.to.y)) { console.log("card list " + i + " overflow"); break; }
						}
					} ctx.restore();
				}
			} break;
		}
	}
	
	return canvas;
}