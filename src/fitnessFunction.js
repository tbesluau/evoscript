define(function() {
	return function(headers, data) {
		return function (func) {
			var total = 0;
			var stored = null;

			for (var i = 0, listlen = data.length; i < listlen; i++) {
				var line = data[i];
				var obj = {};
				for (var j = 0, linelen = line.length; j < linelen; j++) {
					obj[headers[j]] = line[j];
				}
				var result = func(obj);

				// do something with this result here
				// in this example, we compare it with the next
				// value of the first header, so for headers A, B, C, D
				// we use An, Bn, Cn, and Dn to predict An+1 compared to An
				if(stored !== null) {
					total += Math.abs(stored - line[0]);
				}
				stored = result;
			}
			return total;
		}
	};
})