define(function() {
	return function(data) {

		var dataobj = [];
		for (var i = 0, listlen = data.data.length; i < listlen; i++) {
			var line = data.data[i];
			var obj = {};
			for (var j = 0, linelen = line.length; j < linelen; j++) {
				obj[data.headers[j]] = line[j];
			}
			dataobj.push(obj);
		}

		return function (func) {
			var total = 0;
			var stored = null;

			for (var i = 0, listlen = data.data.length; i < listlen; i++) {

				var result = func(dataobj[i]);

				// do something with this result here
				// in this example, we compare it with the next
				// value of the first header, so for headers A, B, C, D
				// we use An, Bn, Cn, and Dn to predict An+1 compared to An
				if(stored !== null) {
					total += Math.abs(stored - dataobj[i][data.targetColumn]);
				}
				stored = result;
			}
			return total;
		}
	};
})