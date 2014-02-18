define(function() {
	return [
		function es_int () {
			return Math.floor(Math.random()*10);
		},

		function es_float () {
			return Math.random()*100;
		},

		function es_smallFloat () {
			return Math.random();
		}
	];
});