function ww_debug(ctx, text, size, font, leading) {
	ctx.save();

	text = text || "QWERTYUIOPASDFGHJKLZXCVBNM\nqwertyuiopasdfghjklzxcvbnm\n1234567890!\"$%^&*()";

	var scale = size / font.px;
	font = {
		font: font.font, px: size, style: font.style,
		baseline: font.baseline * scale, x_height: font.x_height * scale,
		cap_height: font.cap_height * scale, tail_height: font.tail_height * scale
	};
	var y = (font.cap_height || font.x_height) - font.baseline;
	
	ww_set_font(ctx, size, font);
	
	ctx.textBaseline = "middle";
	text.split("\n").forEach(function(t, i) {
		var width = ctx.measureText(t).width;

		ctx.save();
		ctx.translate(0, y);
		ctx.save();
		
		/* small */		ctx.fillStyle = "rgba(0,255,0,1)"; ctx.fillRect(0, font.baseline - font.x_height, width, font.x_height);
		if (font.cap_height > font.x_height) {
			/* cap */		ctx.fillStyle = "rgba(255,0,0,1)"; ctx.fillRect(0, font.baseline - font.cap_height, width, font.cap_height - font.x_height);
		}
		/* tail */		ctx.fillStyle = "rgba(255,0,0,1)"; ctx.fillRect(0, font.baseline, width, font.tail_height);
		ctx.restore();

		ctx.fillText(t, 0, 0);
		ctx.restore();
		
		y += font.cap_height + font.tail_height + leading;
	});
	ctx.restore();
}

function ww_next(ctx, text, max_width, result) {
	result = result || {};
	result.overflow = false;
	result.last = false;
	result.cutoff = "";
	
	var w = ctx.measureText(text).width;
	var line = text, s;
	while ((w > max_width) && line) {
		s = line.lastIndexOf(" ");
		if (s !== -1) { line = line.substr(0, s); }
		else { result.overflow = true; break; }
		w = ctx.measureText(line).width;
	} 
	
	if (line === text) {
		result.text = text;
		result.last = true;
	}
	else {
		var i = line.length;
		while (text[i] === " ") {
			i++;
		}
		result.text = text.substr(0, i);
	}
	
	result.width = w;

	return result;
}

var outer_space = /^\s+|\s+$/g;
var space_end = /\s+$/, space_start = /^\s+/;
function ww_render(ctx, text, size, font, leading, indent, bound, result, debug) {
	result = result || {};
	result.cutoff = ""; result.last_line_width = 0; result.bottom = 0;
	
	if (size === null) { size = font.px; }
	
	if (debug) {
		ctx.save(); {
			ctx.fillStyle = "rgba(255,0,0,0.5)";
			ctx.fillRect(bound.from.x, bound.from.y, bound.to.x - bound.from.x, bound.to.y - bound.from.y);
		} ctx.restore();
	}
	
	var scale = size / font.px;

	var y = bound.from.y + (font.cap_height - font.baseline) * scale;
	var to_bottom = (font.baseline + font.tail_height) * scale;
	var line_height = leading + (font.cap_height + font.tail_height) * scale;
	
	var r = {};
	
	
	
	
	
	ctx.save(); {
		ctx.textBaseline = "middle";
		
		var new_line = true;
		var t, s, f;
		if (!Array.isArray(text)) { text = [text]; }
		for (var i = 0, l = text.length; i < l; i++) {
			var t = text[i];
			if (t.break) {
				indent = 0;
				y += line_height + leading;
			}
			else {
				var s = size, f = font, sc = scale;
				if (typeof text[i] === "object") {
					f = t.font;
					s = ("size" in t) ? t.size : font.px;
					sc = s / f.px;
					t = t.text;
				}
				ww_set_font(ctx, s, f);
				
				if (t) {
					while (t) {
						var max_width = bound.to.x - bound.from.x - indent;
						ww_next(ctx, t, max_width, r);
						
						var r2 = {};
						if (r.last && (i < l - 1)) {
							var nt = text[i + 1], ntt = (typeof nt === "string") ? nt : nt.text;
							if (!space_end.test(r.text) && !space_start.test(ntt)) {
								ctx.save(); {
									if (nt.font) {
										ww_set_font(ctx, null, nt);
										// ctx.font = nt.size + "px " + nt.font;
									}
									ww_next(ctx, ntt, max_width - (indent + r.width), r2)
									if (r2.overflow) {
										// next text would overflow
										var li = r.text.lastIndexOf(" ");
										if (li !== -1) {
											ww_next(ctx, r.text.substr(0, li + 1), max_width, r);
											text.splice(i + 1,0, { text: r.text.substr(li + 1), size: nt.size || s, font: nt.font || f }); l++;
										}
										else {
											y += line_height; indent = 0;
										}
									}
								} ctx.restore();
							}
						}
						
						var offset_y = 0;
						if (f !== font) {
							offset_y = ((font.baseline * scale) - (f.baseline * (s / f.px))) / 2;
							
							// ctx.fillRect(bound.from.x + indent - 20, y + (font.baseline * scale) - 0.1, 100, 0.2);
						}
						
						if (r.overflow) { // squashed
							if (new_line) { // 1 word on 1 line
								ctx.fillText(r.text.replace(outer_space, ""), bound.from.x + indent, y + offset_y, max_width);
							}
							else { // not the only word; push to the next line
								indent = 0;
								y += line_height;
								continue;
							}
						}
						else {
							ctx.fillText(r.text, bound.from.x + indent, y + offset_y);
						}
						
						if (y + line_height + to_bottom > bound.to.y) { break; }
						t = t.substr(r.text.length);
						if (t) {
							y += line_height;
							new_line = true;
							indent = 0;
						}
						else { new_line = false; }
					}
				
					indent = indent + r.width;
				}
				
				if (t) {
					result.cutoff = t;
					console.log("Text cut off from {" + (t.text || t) + "} onward");
				}
			}
			
		}	
	} ctx.restore();
	
	result.last_line_width = r.width;
	result.bottom = y + to_bottom;
	
	return result;
}

function ww_set_font(ctx, size, font) {
	ctx.font = (font.style ? font.style + " " : "") + (size != null ? size : font.px) + "px '" + font.font + "'";
}


