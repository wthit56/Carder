function card(config, data) {
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
	
	var images = new loader();
	
	for (var i = 0, l = config.layout.length; i < l; i++) {
		var area = config.layout[i];
		ctx.save(); {
			switch (area.type) {
				case "textbox": {
					var t = textbox(area.box);
					for (var p = 0, pl = area.includes.length; p < pl; p++) {
						var named = area.includes[p];
						if (named.name in data) {
							var string = data[named.name];
							if (named.pre) { string = named.pre(string); }
							if (!Array.isArray(string)) { string = [string]; }
							
							if (named.parsers) {
								named.parsers.forEach(function(p) {
									for (var si = 0, sl = string.length; si < sl; si++) {
										var s = string[si];
										if (typeof s === "string") {
											s.replace(p.find, function(m) {
												var r;
												switch(p.type) {
													case "glyph": {
														r = { glyph: config.glyphs[p.from ? m.replace(p.find, p.from) : p.as], shadow: p.shadow, shadow_blur: p.shadow_blur }
													} break;
													case "text": {
														if (p.italic) { console.log(p); }
														console.log(p);
														r = { text: p.from ? m.replace(p.find, p.from) : p.as, font: p.font, scale: p.scale, bold: p.bold, italic: p.italic };
													} break;
												}
												
												var pre_index = arguments[arguments.length - 2];
												var pre = s.substring(0, pre_index);
												var post = s.substring(pre_index + m.length);
												
												string.splice(si, 1); sl--;
												
												if (pre) {
													string.splice(si, 0, pre);
													si++; sl++;
												}
												string.splice(si, 0, r); si++; sl++;
												if (post) {
													string.splice(si, 0, post);
													sl++;
												}
												
												si--;
											});
										}
									}
								});
							}
							
							var _font = named.font;
							if (named.bold && !_font.bold) {
								if (_font.bold) { _font = _font.bold; }
								else {
									var b = Object.create(_font);
									b.bold = true;
									_font = b;
								}
							}
							if (named.italic && !_font.italic) {
								if (_font.italic) { _font = _font.italic; }
								else {
									console.log("faux italic");
									var b = Object.create(_font);
									b.italic = true;
									_font = b;
								}
							}
			
							

							
							var result = t.write(ctx, string, _font, named.scale, named.leading || 0, named.break || 0);
							if (!result.complete) { console.log("Could not complete render"); }
						}
					}
				} break;
				case "stats": {
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
								config.glyphs[named].render(ctx, cx, cy, size / 2);
								
								if (!missing && area.value && (data[named] !== "")) {
									ctx.save(); {
										var f = area.value.font, fs = (area.value.scale != null ? area.value.scale : 1),
											w = f.measure(ctx, data[named], fs).width,
											s = Math.min(size / w, 1);
										fs *= s;
											
										// var fx = cx - (w * s / 2);
										// var fy = cy + (-f.hanging - (f.alphabetic - f.hanging) / 2) * fs;
										
										if (area.value.outline !== false) {
											ctx.shadowColor = ctx.strokeStyle = area.value.outline || "white";
											ctx.lineWidth = (area.value.line || 2) / fs; ctx.shadowBlur = (area.value.shadow || 0) / fs;
										}
										f.render(ctx, data[named], cx, cy, null, fs, "stroke", "mid-cap middle");
										ctx.shadowBlur = 0;
										f.render(ctx, data[named], cx, cy, null, fs, "fill", "mid-cap middle");
										
										/*
										ctx.fillStyle = "rgba(255,0,0,0.9)";
										ctx.fillRect(cx - 10, cy - 0.5, 20, 1);
										//*/
									} ctx.restore();
								}
								
								if (hor) { x += size + (area.break || 0); }
								else { y += size + (area.break || 0); }
								
								if ((hor && x + size > area.box.to.x) || (!hor && y + size > area.box.to.y)) { console.log("card list " + i + " overflow"); break; }
							}
						} ctx.restore();
					}
				} break;
				case "glyph": {
					ctx.save(); {
						if (area.colour) { ctx.fillStyle = area.colour; }
						config.glyphs[area.name || data[area.from]].render(ctx, area.centre.x, area.centre.y, area.radius, area.colour, area.rotate || 0);
					} ctx.restore();
				} break;
				case "image": {
					var src = area.src;
					if (area.from) {
						src = src.replace(/%s/g, data[area.from]);
					}
					
					var image = new Image();
					image.src = src;
					
					ctx.save(); {
						var x, y;
						if (area.centre) {
							var s = area.scale != null ? area.scale : 1;
							x = area.centre.x - (image.width / 2 * s);
							y = area.centre.y - (image.height / 2 * s);
						}
						else {
							x = area.x; y = area.y;
						}
						
						ctx.translate(x, y);
						if (area.scale && (area.scale !== 1)) { ctx.scale(area.scale, area.scale); }
						ctx.drawImage(image, 0, 0);
					} ctx.restore();
					
				} break;
				case "rectangle": {
					ctx.fillStyle = area.colour;
					ctx.fillRect(area.from.x, area.from.y, area.to.x - area.from.x, area.to.y - area.from.y);
				} break;
			}
		} ctx.restore();
	}
	
	return canvas;
}