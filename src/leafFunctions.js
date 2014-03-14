define(function() {
	return function (headers) {
		return [
			function es_int () {
				return Math.floor(Math.random()*10);
			},

			function es_float () {
				return Math.random()*100;
			},

			function es_smallFloat () {
				return Math.random();
			},

			function es_header () {
				var header = '_';
				while (header.indexOf('_') === 0) {
					header = headers[Math.floor(Math.random()*headers.length)];
				}
				return header;
			},

			function es_headerDiff () {
				var header = 'foo';
				while (header.indexOf('_') !== 0) {
					header = headers[Math.floor(Math.random()*headers.length)];
				}
				var header2 = 'foo';
				while (header2.indexOf('_') !== 0) {
					header2 = headers[Math.floor(Math.random()*headers.length)];
				}
				return header + (Math.random() < 0.5 && '*-*' || '*/*') + header2;
			}
		];
	};
});
