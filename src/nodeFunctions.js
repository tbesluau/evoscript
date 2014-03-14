define(function() {
	return [
		function es_add (x, y) {
			return x + y || 0;
		},

		function es_subs (x, y) {
			return x - y || 0;
		},

		function es_mult (x, y) {
			return x * y || 0;
		},

		function es_div (x, y) {
			return x / y || 0;
		},

		function es_ave (x, y) {
			return (x + y) / 2;
		},

		function es_ifless (a, b, c, d) {
			if (a <= b) {
				return c || 0;
			} else {
				return d || 0;
			}
		},

		function es_switch (x, y) {
			if (x > 0) {
				return y || 0;
			} else {
				return 0;
			}
		},

		function es_sqrt (a, b) {
			return Math.sqrt((a - (a + b) / 2) * (a - (a + b) / 2) + (b - (a + b) / 2) * (b - (a + b) / 2)) || 0;
		},

		function es_mod (a, b) {
			return a % b || 0;
		},

		function es_latch (x, y) {
			if (x > 0) {
				window.es_store.es_latch = y;
			}
			return window.es_store.es_latch || 0;
		},
	];
});
