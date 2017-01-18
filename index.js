document.write("<script src='file:///F:/JavaScript/Carder/word-wrap.js'></script>"+
"<script src='file:///F:/JavaScript/Carder/carder.js'></script>");
document.head.appendChild(document.createElement("STYLE")).innerHTML = ".card, .deck {box-shadow:0 0 0.5em rgba(0,0,0,0.3); margin:0.1em;}";

var carder = (function() { // on hold
	function c() {
		queue.push(arguments);
	}
	var queue = c.queue = [];
	
	return c;
})();
