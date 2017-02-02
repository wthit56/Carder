function ww_next(ctx, width, string, result) {
	var line = string, lnw = 0, last = true;
	while (true) {
		lnw = ctx.measureText(line).width;
		if (lnw < width) {
			break;
		}
		else {
			last = false;
			lsp = line.lastIndexOf(" ");
			if (lsp === -1) { break; }
			line = line.substr(0, lsp);
		}
	}
	
	if (result) {
		result.text = line;
		if (typeof line ==="number"){debugger;}
		result.width = lnw;
		result.last = last;
		return result;
	}
	else { return line; }
}

function ww_render(ctx, telem, text, result) {
	var y = telem.from.y, x = telem.from.x;
	var width = telem.to.x - telem.from.x;
	
	var indent = telem.indent || 0;
	var new_line = ww_next(ctx, width - indent, text, {});
	
	if (new_line.width > width - indent) {
		if (indent > 0) {
			indent = 0; y += telem.line_height;
			new_line = ww_next(ctx, width, text, new_line);
		}
	}
	
	while (true) {
	ctx.fillText(new_line.text, x + indent, y, width);
		hanger = new_line.width;
		text = text.substr(new_line.text.length + 1);
		
		if (new_line.last) { break; }
		
		new_line = ww_next(ctx, width, text, new_line);
		if (new_line.text) { y += telem.line_height; }
		if (text) { indent = 0; }
	}
	
	if (result) {
		result.bottom = y;
		result.hanger = indent + hanger;
		return result;
	}
}

function ww_rich(ctx, telem, parts, result) {
	var space = 0//ctx.measureText("| |").width - ctx.measureText("||").width;
	var indent = telem.indent || 0, y = telem.from.y;
	var r = { bottom: 0, hanger: 0 };
	var first = true, nospace = false;
	var t = Object.create(telem); t.from = Object.create(telem.from);
	parts.forEach(function(part) {
		t.indent = indent + (!first && !nospace ? space : 0); t.from.y = y;
		
		if (part.break) {
			r.hanger = 0;
			r.bottom = y + telem.line_height + (telem.break_margin || 0)
		}
		else if (part.style) {
			if (typeof part.style === "function") {
				if (part.style.width() > t.to.x - t.from.x - indent) {
					t.indent = 0;
					t.from.y += telem.line_height;
					r.hanger = part.style.width;
					r.bottom = t.from.y;
				}
				else {
					r.hanger = t.from.x + t.indent + part.style.width;
					r.bottom = t.from.y;
				}
				part.style(ctx, t, part);
			}
			else if (typeof part.style === "string") {
				ctx.save();
				ctx.font = part.style;
				ww_render(ctx, t, part.text, r);
				ctx.restore();
			}
			else {
				ctx.save();
				if (part.style.font) { ctx.font = part.style.font; }
				if (part.style.line_height) { ctx.translate(0, -(part.style.line_height - telem.line_height) / 2); }
				ww_render(ctx, t, part.text, r);
				ctx.restore();
			}			
		}
		else {
			ww_render(ctx, t, part.text, r);
		}
		
		indent = r.hanger; y = r.bottom;
		first = false; nospace = part.nospace;
	});
}





