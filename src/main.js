require(['jquery', 'evoscript', 'nodeFunctions', 'leafFunctions'], function($, evoscript, nodeFunctions, leafFunctions) {

	var mainHatch = new evoscript({throttle: 100});
	var underdogs = new evoscript({
		poolSize:100,
		throttle: 1000,
		resetRate: 5,
		leafFunctions: leafFunctions,
		nodeFunctions: nodeFunctions
	});

	/**
	 * TODO: Implement Event queue for things like 'reset', 'generationComplete' or whatever else.
	 *  That would trigger the transfer of underdogs as well as screen drawing.
	 */


	$("#evoscript-trigger").click(function() {
		if(mainHatch.isRunning()) {
		    mainHatch.pause();
		} else {
		    //mainHatch.start();
		}
		if(underdogs.isRunning()) {
			underdogs.pause();
		} else {
			underdogs.start();
		}
	});

	$("#evoscript-stop").click(function() {
		mainHatch.stop();
		underdogs.stop();
	});
});