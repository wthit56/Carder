function textbox(box) {
	var x = box.from.x, y = box.from.y;
	
	return {
		break: function(height) {
			x = box.from.x; y += height;
		},
		
		write: function(ctx, renderers, _font, _scale, leading, _break) {
			scale = scale || 1; leading = leading || 0;
			ctx.save(); {
				_font.set(ctx);
				
				var line, layout = []; layout.push(line = []);
				{ // layout
					var lx = x, ly = y, only = true, word_count = 0;
					
					var gside = (_font.alphabetic - _font.hanging) * _scale;
					var radius = Math.sqrt(gside * gside * 2) / 2;
					var gy_offset = radius - (gside / 2);
					
					for (var i = 0, l = renderers.length; i < l; i++) {
						var r = renderers[i];
						
						if (r.glyph) {
							if (lx + radius > box.to.x) {
								ly += (font.bottom * scale) + leading;
								if (ly > box.to.y) {
									console.log("glyph overflow, part " + i);
									return { overflow: true };
								}
								
								layout.push(line = []);
								lx = box.from.x; word_count = 0;
							}
							
							var gx = lx + radius,
								// gy = ly - (_font[ctx.textBaseline] * _scale) + radius,
								gy = ly + (_font.hanging * _scale) + radius - gy_offset;
							line.push({ glyph: r.glyph, x: gx, y: gy, radius: radius, shadow: r.shadow, shadow_blur: r.shadow_blur });
							
							
							lx += radius * 2;
						}
						else {
							var text = null, font, scale;
							
							if (typeof r === "string") {
								text = r; font = _font, scale = _scale;
							}
							else if (r.font) {
								text = r.text; font = r.font; scale = r.scale;
								console.log("renderer", r);
								
								if (r.bold && !font.bold) {
									if (font.bold) { font = font.bold; }
									else {
										var b = Object.create(font);
										b.bold = true;
										font = b;
									}
								}
								if (r.italic && !font.italic) {
									if (font.italic) { font = font.italic; }
									else {
										console.log("faux italic");
										var b = Object.create(font);
										b.italic = true;
										font = b;
									}
								}
							}
							
							var find_words = /(\s*)(\S+)(\s*)/g, find_word = /(\s*)(\S*)(\s*)/;
							if (text !== null) {
								var lt = "", lw = 0;
								
								var words = [];
								text.replace(find_words, function(m, prespaces, word, spaces) {
									words.push({ prespaces: prespaces, text: word, spaces: spaces });
								});
								
								if (words.length > 0) {
									var lt = "", lw = 0, p;
									
									var j = 0, jl = words.length;
									while (true) {
										var word = words[j], wrap = false;
										var m = font.measure(ctx, (word_count > 0 ? word.prespaces : "") + word.text, scale),
											ms = font.measure(ctx, word.prespaces + word.text + word.spaces, scale);
										var w = m.width, ws = ms.width;
										
										if (!word.spaces && !word.prespaces) {
											if (word_count > 0 && i + 1 < l) {
												var all_right = lx + ws, wrap = false, index = i + 1, next_width;
												while (all_right <= box.to.x && (index < renderers.length)) { // find width of all nobreak parts
													if (renderers[index].text) {
														var next_text = find_word.exec(renderers[index]); // find next word
														if (next_text[1]) { break; } // space before; not a nobreak
														next_width = font.measure(ctx, next_text[2], scale).width;
														all_right += next_width;
														if (next_text[3]) { break; } // space after; no more nobreaks
													}
													else if (renderers[index].glyph) {
														all_right += radius * 2;
													}
													index++;
												}
												if (all_right > box.to.x) { wrap = true; }
											}
										}
										
										if (lx + w > box.to.x) { wrap = true; }
										if (wrap) {
											ly += (font.bottom * scale) + leading;
											if (ly > box.to.y) {
												console.log("text overflow part " + i);
												return { overflow: true };
											}
											
											layout.push(line = []);
											lx = box.from.x; word_count = 0;
										}
										
										var wy = ly;
										if (font[ctx.textBaseline] !== _font[ctx.textBaseline]) {
											wy = wy - (font[ctx.textBaseline] * scale - _font[ctx.textBaseline] * _scale);
										}
										
										line.push(p = { font: font, scale: scale, x: lx, y: wy, prespaces: word.prespaces, text: word.text, spaces: word.spaces });
										if (word.spaces) { word_count++; }
										lx += ws;
										
										j++;
										if (j >= jl) { break; }
									}
								}
							}
						}
					}
					
					for (var i = 0, t, l = layout.length; i < l; i++) {
						if (y + (_font.bottom * scale) > box.to.y) {
							return { complete: false };
						}
						
						line = layout[i];
						if (line.length === 1 && !line[0].glyph) {
							t = line[0];
							t.font.render(ctx, t.text, t.x, t.y, box.to.x - box.from.x, t.scale);
						}
						else {
							// config.render = function(ctx, text, x, y, max_width, scale, order) {
							for (var j = 0, jl = line.length; j < jl; j++) {
								t = line[j];
								if (t.glyph) {
									ctx.save(); {
										if (t.shadow) {
											console.log(t.shadow, t.shadow_blur);
											ctx.shadowBlur = t.shadow_blur; ctx.shadowColor = t.shadow;
										}
										t.glyph.render(ctx, t.x, t.y, t.radius);
									} ctx.restore();
								}
								else {
									t.font.render(ctx, (t.prespaces || "") + t.text + (t.spaces || ""), t.x, t.y, null, t.scale);
								}
							}
						}
						
						y += (_font.bottom * scale) + leading;
					}
				} console.groupEnd("render");
			}
			
			y += (_break || 0);
			
			return { complete: true };
		}
	};
}





