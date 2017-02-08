function loader(oncomplete) {
	var total = 0, complete = 0;
	var todo = [];
	
	function onload() {
		complete++;
		if (complete >= total) {
			oncomplete();
		}
	}
	
	return {
		add: function(src) {
			var img = new Image();
			img.onload = onload;
			todo.push({ image: img, src: src });
			total++;
			return img;
		},
		load: function() {
			var img;
			while(img = todo.pop()) {
				img.image.src = img.src;
			}
		}
	};
}