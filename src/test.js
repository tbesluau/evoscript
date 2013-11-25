function testall () {
	console.log('starting tests');
	console.log(getESFunction());
	var hatchery = new Hatchery();
	hatchery.init();
	window.setInterval(function () {increment(hatchery);}, 1);
	console.log('done testing');
}

var best = -10000000;

function increment(hatchery) {
	hatchery.nextGen();
	var topdog = hatchery.getBestCandidate();
	if(topdog.fitness > best) {
		best = topdog.fitness;
		topdog.draw();
	}
	var total = 0;
	$.each(hatchery.pool, function (index, individual) {
			total += individual.fitness;
	});
	console.log(best + ' ' + total);
}

