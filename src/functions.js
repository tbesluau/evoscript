// the base representation functions

var es_fitness = function (result) {
	return -1 * Math.abs(result - 278);
};

var es_nodeFunctions = [

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
];

var es_leafFunctions = [

	function es_int () {
		return Math.floor(Math.random()*10);
	}

];

var es_functions = es_nodeFunctions.concat(es_leafFunctions);
$.each(es_nodeFunctions, function (index, func) {
	window[func.name] = func;
});

function getESFunction () { // not used
	return es_functions[Math.floor(Math.random()*es_functions.length)];
}

function getESNodeFunction () {
	return es_nodeFunctions[Math.floor(Math.random()*es_nodeFunctions.length)];
}

function getESLeafFunction () {
	return es_leafFunctions[Math.floor(Math.random()*es_leafFunctions.length)]();
}
