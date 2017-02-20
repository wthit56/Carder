function cardsheet(config, cards) {
	if (!config) { throw "No config found."; }
	if (!cards) { throw "No cards found."; }
	
	var cols, rows;
	var cw = config.card_size.width, ch = config.card_size.height;
	if (config.grid) {
		cols = config.grid.cols;
		rows = config.grid.rows;
		
		var width = cols * cw, height = rows * ch;
		var p = next_power(Math.max(width, height));
		var max_size = config.max_size || 2048, min_scale = config.min_scale || (2 / 3);
		if ((max_size < p) && (min_scale !== 1)) {
			var s = Math.min(
				min_scale,
				Math.min(ch, p / rows) / ch,
				Math.min(cw, p / cols) / cw
			);
			if (
				(s === 1) &&
				((ch * rows < p) || (cw * cols < p))
			) {
				p = p >> 1;
				s = Math.min(
					min_scale,
					Math.min(ch, p / rows) / ch,
					Math.min(cw, p / cols) / cw
				);
			}
			cw *= s; ch *= s;
		}
	}
	else {
		var i = cards.length, split = 1, lowest = { cols: 10, rows: 7 }, lowest_split = 1, lowest_waste = Infinity, lowest_split_ratio = 1, lowest_waste_ratio = Infinity, lowest_ratio;
		while (i / split > 1) {
			var r = eval_layout(cards.length, null, null, cw, ch, split, "jump for waste");
			
			if (r.waste < lowest_waste) { lowest_split = r.split; lowest_waste = r.waste; lowest = r; }
			
			var wr = (1 / r.waste) * r.split;
			if (wr < lowest_waste_ratio) { lowest_split_ratio = r.split; lowest_waste_ratio = wr; lowest_ratio = r; }
			
			split = r.split + 1;
		}
		
		cols = lowest.cols; rows = lowest.rows;
	}
	
	var width = cw * cols;
	var height = ch * rows;
	
	var canvasses = [];
	var canvas, ctx;
	
	var card_info = [], current_cardsheet;
	var max_page = (rows * cols) - 1, index_offset = -max_page;
	for (var i = 0, l = cards.length; i < l; i++) {
		var index = i - index_offset;
		if (index >= max_page) { // too many cards; make a new sheet
			canvas = document.createElement("CANVAS");
			canvas.width = width; canvas.height = height;
			
			ctx = canvas.getContext("2d");
			ctx.fillStyle = "#aaa";
			ctx.fillRect(0,0, width,height);
			
			if (config.hidden) {
				render_card(ctx, cw, ch, cols - 1, rows - 1, config.hidden);
			}
			
			canvasses.push(current_cardsheet = { cardsheet: canvas, cols: cols, rows: rows });
			
			index_offset += max_page;
			index = 0;
		}
		
		var card = cards[i];
		var x = index % cols;
		var y = (index - x) / cols;
		
		render_card(ctx, cw, ch, x, y, card);
	
		card_info.push(card.$cardsheet_info = { cardsheet: current_cardsheet, index: index });
	}
	
	return { cards: card_info, cardsheets: canvasses };
}

function next_power(n) {
	var i = 1, max = 1 << 30;
	while (i < n && i < max) { i = i << 1; }
	if (i === max) { i = 0; }
	return i;
}

function eval_layout(card_count, _cols, _rows, card_width, card_height, split, jump_for_waste) {
	var p, cols, rows;
	if (_cols == null) {
		var csq = card_width * card_height, per = (Math.ceil(card_count / split) + 1);
		var side = Math.sqrt(csq * per);
		p = next_power(side);
		
		if (card_width <= card_height) {
			cols = Math.min(Math.floor(p / card_width), 10); rows = Math.ceil(per / cols);
		}
		else {
			rows = Math.min(Math.floor(p / card_height), 7); cols = Math.ceil(per / rows);
		}
	
		if ((cols > 10) || (rows > 7)) {
			return layout(card_count, _cols, _rows, card_width, card_height, split + 1);
		}
	}
	else {
		p = next_power(Math.max(_cols * card_width, _rows * card_height));
		cols = _cols; rows = _rows;
	}
	
	var width = (cols * card_width), height = (rows * card_height);
	if ((width > p || height > p) && _cols != null) {
		return layout(card_count, _cols, _rows, card_width, card_height, split + 1);
	}
	else {
		var sq = width * height;
		
		var waste = ((p * p) - sq) * split;
		var r = { split: split, cols: cols, rows: rows, width: width, height: height, memory_side: p, waste: waste };
		return r;
	}
}

function render_card(ctx, cw, ch, x, y, image) {
	ctx.save(); {
		ctx.drawImage(image, x * cw, y * ch, cw, ch);
	} ctx.restore();
}
