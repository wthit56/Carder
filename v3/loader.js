var loader = function() {
	var total = 0, complete = 0;
	var action;
	function set_onload() {
		complete++;
		if (action && (complete >= total)) { action(); }
	}
	
	this.add = function(src, onload, args) {
		var i = new Image();
		i.onload = function() {
			if (onload) { onload.apply(i, args); }
			set_onload();
		}
		i.src = src;
		
		total++;
		
		return i;
	};
		
	this.then = function(_action) {
		action = _action;
		if (total === complete) { action(); }
	};
};
