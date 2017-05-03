function carder_load(scripts, onload) {
	var loaded = document.querySelectorAll("script");
	var dir = loaded[loaded.length - 2].src.replace(/\/[^\/]+$/, "/");
	var all = "";
	scripts.forEach(function(script) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			all += ";\n;" + this.responseText;
		};
		xhr.open("GET", dir + script + ".js");
		xhr.send();
		
		// document.head.appendChild(document.createElement("SCRIPT")).src = ;
	});
	
	console.log(all);
	// eval("onload="+onload+";\n;"+all+";\n;onload()");
	// debugger;
	// then();
	// console.log(document.querySelectorAll("script"));
}