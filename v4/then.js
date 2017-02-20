var then = function() {
	var complete = 0, total = 0, after = function() { };
	var oncomplete = function() {
		if (after && (++complete >= total)) {
			setTimeout(after, 0);
		}
	};
	
	return {
		add: function() {
			total++;
			return oncomplete;
		},
		then: function(_after) {
			var old = after, self = this;
			after = function() {
				old();
				_after.call(self);
				after = function() { };
			};
			
			if (complete >= total) {
				setTimeout(after, 0);
			}
			
			return this;
		}
	};
};