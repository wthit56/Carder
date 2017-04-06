function textarea(config) {
	var width = config.to.x - config.from.x,
		height = config.to.y - config.from.y;
	var tx = config.from.x, ty = config.from.y;
	
	return {
		to_words: function(content) {
			var find_part = /(\s*)(\S+)(\s*)/g;
			
			var word, words = [word = { from: null, parts: [], post: "" }];
			var i = 0, p = null, complete = false;
			
			var f=0
			while (++f<1000 && i < content.length) {
				if (f === 999) { debugger; }
				p = content[i]; text = p; i++;
				
				if (typeof text === "object") {
					if ("text" in text) {
						text = text.text;
					}
				}
				// console.log(text);
				
				if (typeof text === "string") {
					text.replace(find_part, function(m, pre, part, post) {
						console.log([text, part]);
						if (pre) {
							if (word.parts.length === 0) { // current has no parts
								if (words.length > 1) { // more words already exist
									// add "pre" to previous word
									words[words.length - 2].post += pre;
								}
								else { // this is the first word
									// add "pre" to first word
									word.pre = pre;
								}
							}
							else { // current word has parts
								// add "pre" to current word
								word.post += pre;
								// end word
								words.push(word = { parts: [], post: "" });
							}
						}
						
						// store original content part
						word.from = p;
						// add content to current word
						word.parts.push(part);
						
						if (post) {
							// add "post" to current word
							word.post += post;
							// end word
							words.push(word = { pre: "", parts: [], post: "" });
						}
					});
				}
			}
			
			if (word.parts.length === 0) { // last word has no content
				console.log("remove last word");
				// remove last word
				words.pop();
			}
			
			return words;
		},
		
		layout: function(content) {
			var lines = [];
			var x = 0;
			
			var i = 0, p = null;
			while (i < content.length) {
				if (p === null) { p = content[i]; i++; }
				console.log(i, p);
				p = null;
			}
			
			return lines;
		},
		write: function(ctx, content) {
		}
	};
}