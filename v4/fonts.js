// https://fonts.googleapis.com/css?family=Pangolin|Sansita" rel="stylesheet

var fonts = (function() {

	var fonts = function() {
		var next = then();
		var sent = {};
		
		return {
			add: function(config) {
				if (!(config.face in sent)) {
					var url = "https://fonts.googleapis.com/css?family=" + encodeURIComponent(config.face);
					
					var link = document.createElement('link');
					link.rel = 'stylesheet';
					link.type = 'text/css';
					link.href = url;
					document.head.appendChild(link);
					
					var image = new Image();
					image.src = url;
					var complete = next.add();
					image.onerror = function(e) {
						complete();
					}
					
					sent[config.face] = true;
				}
				return fonts.font(config);
			},
			then: function(action) {
				next.then(action);
			}
		};
	};

	fonts.font = function font(config) {
		var font = "", font_key = "";
		
		function update_font(f) {
			var k = [f.face, f.bold, f.italic, f.size].join("|");
			if (k !== font_key) {
				font = (
					(f.italic ? "italic " : "") +
					(
						f.bold == null ? ""
						: typeof f.bold === "boolean" ?
							f.bold ? "bold " : ""
						: f.bold + " "
					) +
					(f.size != null
						? f.size +
							(typeof f.size === "number" ? "px" : "") +
							" "
						: ""
					) +
					quoted(f.face)
				);
				font_key = k;
			}
			// console.log(f.italic, font);
			return font;
		}
		
		config.set = function(ctx) {
			update_font(this);
			if (ctx.font !== font) { ctx.font = font; }
			return font;
		};
		config.render = function(ctx, text, x, y, max_width, align, scale, renderers) {
			if (scale == null) { scale = 1; }
			if (align == null) { align = "top left"; }

			align = align.split(" ");
			align = { x: align[1], y: align[0] };

			ctx.save(); {
				this.set(ctx);
				
				var y_offset = 0;
				if (align.y in this) { y_offset = -this[align.y] || 0; }
				else {
					switch(align.y) {
						case "bottom": {
							y_offset = -this.bottom || 0;
						} break;
						case "mid-cap": {
							var h = (this.hanging || 0), a = (this.alphabetic || 0);
							y_offset = -h - ((a - h) / 2);
						} break;
					}
				}
				y_offset = (y_offset * scale) + (this[ctx.textBaseline] || 0) * scale;
				
				
				var x_offset = 0;
				if (align.x !== "left") {
					var width = ctx.measureText(text).width * scale;
					
					switch(align.x) {
						case "right": {
							x_offset = -width;
						} break;
						case "middle": {
							x_offset = -width / 2;
						} break;
					}
				}
			
				ctx.translate(x + x_offset, y + y_offset);
				ctx.scale(scale, scale);
				
				if (renderers) {
					if (!Array.isArray(renderers)) {
						renderers.call(this, ctx, text, 0, 0, max_width);
					}
					else {
						for (var i = 0, l = renderers.length; i < l; i++) {
							renderers[i].call(this, ctx, text, 0, 0, max_width);
						}
					}
				}
				else {
					fonts.fill.call(this, ctx, text, 0, 0, max_width);
				}
			} ctx.restore();
		};
			
		config.measure = function(ctx, text, scale) {
			if (scale == null) { scale = 1; }
			
			var result;
			ctx.save(); {
				this.set(ctx);
				result = { width: ctx.measureText(text).width * scale, height: this.bottom };
			} ctx.restore();
			return result;
		};
		
		return config;
	}

	fonts.fill = function(ctx, text, x, y, max_width) {
		if (max_width == null) { ctx.fillText(text, x, y); }
		else { ctx.fillText(text, x, y, max_width); }
	};
	fonts.stroke = function(ctx, text, x, y, max_width) {
		if (max_width == null) { ctx.strokeText(text, x, y); }
		else { ctx.strokeText(text, x, y, max_width); }
	};

	var quoted = function quoted(f) {
		return (f.indexOf(" ") !== -1 ? "'" + f.replace(/'/g, "\\'") + "'" : f);
	}

	return fonts;

})();