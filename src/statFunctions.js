define(function() {
	window.es_store = {};
	return [

		function _es_EMA_10 (val, list, n) {
			var alpha = 2/(21);
			if (list.length) {
				return alpha * val + (1 - alpha) * list[list.length - 1][n];
			} else {
				return val;
			}
		},
	
		function _es_EMA_20 (val, list, n) {
			var alpha = 2/(41);
			if (list.length) {
				return alpha * val + (1 - alpha) * list[list.length - 1][n];
			} else {
				return val;
			}
		},
	
		function _es_EMA_50 (val, list, n) {
			var alpha = 2/(101);
			if (list.length) {
				return alpha * val + (1 - alpha) * list[list.length - 1][n];
			} else {
				return val;
			}
		},
	
		function es_diff (val, list, n) {
			if (list.length) {
				if (isNaN(val * 1 - list[list.length - 1][n])) {
					return 0;
				}
				return val * 1 - list[list.length - 1][n];
			} else {
				return 0;
			}
		},
	
		function es_diff_diff (val, list, n) {
			if (list.length > 1) {
				if (isNaN(val * 1 - 2 * list[list.length - 1][n] + list[list.length - 2][n])) {
					return 0;
				}
				return val * 1 - 2 * list[list.length - 1][n] + list[list.length - 2][n];
			} else {
				return 0;
			}
		},
	
		function es_3_diff (val, list, n) {
			if (list.length > 3) {
				return val * 1 - list[list.length - 3][n];
			} else {
				return 0;
			}
		},
	
		function es_10_diff (val, list, n) {
			if (list.length > 10) {
				return val * 1 - list[list.length - 10][n];
			} else {
				return 0;
			}
		},
	];
});
