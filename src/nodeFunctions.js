define(function() {
	return [
		function es_add (x, y) {
			return x + y;
		},

		function es_subs (x, y) {
			return x - y;
		},

		function es_mult (x, y) {
			return x * y;
		},

		function es_div (x, y) {
			if(!y) {
				return 0;
			}
			return x / y;
		},

		function es_ave (x, y) {
			return (x + y) / 2;
		},

		function es_ifless (a, b, c, d) {
			if (a <= b) {
				return c;
			} else {
				return d;
			}
		},

		function es_switch (x, y) {
			if (x > 0) {
				return y;
			} else {
				return 0;
			}
		},

		function es_sqrt (a, b) {
			return Math.sqrt((a - (a + b) / 2) * (a - (a + b) / 2) + (b - (a + b) / 2) * (b - (a + b) / 2));
		}
	];
});