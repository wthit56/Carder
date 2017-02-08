function textbox(box) {
	var x = box.from.x, y = box.from.y;
	
	return {
		break: function(height) {
			x = box.from.x; y += height;
		},
		
		write: function(ctx, renderers, font, scale, leading) {
			leading = leading || 0;
			
			var space_width = font.measure(ctx, " ", scale).width;
			
			ctx.save(); {
				font.set(ctx);
				var order = (
					font.fillStyle
						? font.strokeWidth
							? "stroke fill"
							: "fill"
						: "stroke"
				);
				console.log(order);
				
				
				for (var i = 0, l = renderers.length; i < l; i++) {
					var r = renderers[i];
					if (typeof r === "string") {
						ctx.save(); {
							if (font.strokeWidth) { ctx.lineWidth = font.strokeWidth; ctx.strokeStyle = font.strokeStyle; }
							if (font.fillStyle) { ctx.fillStyle = font.fillStyle; }
							
							var from = -1, to = -1, rendering = false, space = true, next_renderer;
							var f=0;
							while (++f<1000 && (to < r.length || rendering)) {
								if (!rendering) {
									from = to + 1;
									to = r.indexOf(" ", from);
									if (to === -1) {
										var last_char = r[r.length - 1];
										next_renderer = renderers[i + 1];
										
										if ((last_char !== " ") && ((i < l - 1) && !breakable_left(next_renderer))) {
											console.log("no break");
											// x = box.from.x; y += font.bottom + leading;
											space = false;
										}
										
										to = r.length;
										console.log(r.substring(from, to));
									}
									rendering = true;
									
									if (from === to) { break; }
								}
								
								var word = r.substring(from, to);
								
								var tw = font.measure(ctx, word, scale).width;
								if (x + tw <= box.to.x) {
									font.render(ctx, word, x, y, null, scale, order);
									x += tw + (space ? space_width : 0);
									space = true;
									rendering = false;
								}
								else {
									x = box.from.x; y += font.bottom + leading;
									rendering = true;
									
									if (y + font.bottom > box.to.y) {
										return { complete: false, from_renderer: i, from_character: from };
									}
								}
							}
						} ctx.restore();
					}
				}
			} ctx.restore();
				
			return { complete: true };
		}
	};
}

function breakable_left(r) {
	if (r == null) { return true; }
	else if (typeof r === "string") { return r[0] === " "; }
	else if (r.text) { return r.text[0] === " "; }
	else { return false; }
}
function breakable_right(r) {
	if (r == null) { return true; }
	else if (typeof r === "string") { return r[r.length - 1] === " "; }
	else if (r.text) { return r.text[r.text.length - 1] === " "; }
	else { return false; }
}
