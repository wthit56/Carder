var then = function(prerequisites) {
	var complete = 0, total = 0, after = function() { };
	var oncomplete = function() {
		if ((++complete >= total) && after) {
			console.log("after triggered");
			setTimeout(after, 0);
		}
	};
	
	var obj = {
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
	
	if (prerequisites) {
		prerequisites.forEach(function(p) {
			if (p.then) { p.then(obj.add()); }
		});
	}
	
	return obj;
};