function textbox(box) {
	var x = box.from.x, y = box.from.y;
	
	return {
		break: function(height) {
			x = box.from.x; y += height;
		},
		
		write: function(ctx, renderers, font, scale, leading) {
			scale = scale || 1; leading = leading || 0;
			ctx.save(); {
				font.set(ctx);
				
				var line, layout = []; layout.push(line = []);
				{ // layout
					var lx = x, ly = y, only = true, word_count = 0;
					for (var i = 0, l = renderers.length; i < l; i++) {
						var r = renderers[i], text = null;
						
						if (typeof r === "string") {
							text = r;
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
									console.log(word.text, word_count);
									var w = font.measure(ctx, (word_count > 0 ? word.prespaces : "") + word.text).width,
										ws = font.measure(ctx, word.prespaces + word.text + word.spaces).width;
									
									if (!word.spaces && !word.prespaces) {
										if (word_count > 0) {
											var all_right = lx + ws, wrap = false, index = i + 1, next_width;
											while (all_right <= box.to.x) { // find width of all nobreak parts
												var next_text = find_word.exec(renderers[index]); // find next word
												if (next_text[1]) { break; } // space before; not a nobreak
												next_width = font.measure(ctx, next_text[2], scale).width;
												all_right += next_width;
												if (next_text[3]) { break; } // space after; no more nobreaks
												index++;
											}
											if (all_right > box.to.x) { wrap = true; }
										}
									}
									
									if (lx + w > box.to.x) { wrap = true; }
									if (wrap) {
										ly += font.bottom + leading;
										if (ly > box.to.y) {
											console.log("!! overflow !!");
											return { overflow: true };
										}
										
										layout.push(line = []);
										lx = box.from.x; word_count = 0;
										console.log("* wrap");
									}
									
									
									line.push(p = { font: font, scale: scale, x: lx, y: ly, prespaces: word.prespaces, text: word.text, spaces: word.spaces });
									if (word.spaces) { word_count++; }
									lx += ws;
									
									j++;
									if (j >= jl) { break; }
								}
							}
						}
					}
					
					console.groupCollapsed("render"); {
						for (var i = 0, t, l = layout.length; i < l; i++) {
							line = layout[i];
							if (line.length === 1) {
								t = line[0];
								t.font.render(ctx, t.text, t.x, t.y, box.to.x - box.from.x, t.scale);
							}
							else {
								// config.render = function(ctx, text, x, y, max_width, scale, order) {
								for (var j = 0, jl = line.length; j < jl; j++) {
									t = line[j];
									t.font.render(ctx, (t.prespaces || "") + t.text + (t.spaces || ""), t.x, t.y, null, scale);
								}
							}
							
							x = box.from.x; y += font.bottom + leading;
							if (y + font.bottom > box.to.y) {
								return { complete: false };
							}
						}
					} console.groupEnd("render");
				}
			} ctx.restore();
			
			return { complete: true };
		}
	};
}





