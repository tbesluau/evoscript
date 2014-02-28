require(['jquery', 'evoscript', 'nodeFunctions', 'leafFunctions', 'fitnessFunction'], function($, evoscript, nodeFunctions, leafFunctions, fitnessFunction) {

	Math.seed = 9;
	Math.random = function () {
		var x = Math.sin(Math.seed++) * 10000; return x - Math.floor(x);
	};
	leafFunctions.push(
		function es_header () {
			return headers[Math.floor(Math.random()*headers.length)];
		}
	);


	var data = [
		[1, 2, 3],
		[2, 3, 3],
		[3, 2, 3],
		[4, 3, 3],
		[5, 2, 3],
		[6, 3, 3],
		[7, 2, 3],
		[8, 3, 3],
		[9, 2, 3],
		[10, 0, 6],
		[0, 2, 3],
	];
	var headers = ['A', 'B', 'C'];
	mainHatch = new evoscript({
		poolSize: 20,
		mutationRate: 0.2,
		crossRate: 0.2,
		throttle: 0,
		leafFunctions: leafFunctions,
		nodeFunctions: nodeFunctions,
		fitnessFunction: new fitnessFunction({
			headers: headers,
			data: data,
			targetColumn: 'A'
		}),
		onGeneration: function(data) {
			/*console.log('-----------------------------------------');
			console.log(mainHatch.getBestIndividual().cached);
			console.log(mainHatch.getBestIndividual().lineage);
			console.log(mainHatch.getWorstIndividual().cached);
			console.log(mainHatch.getWorstIndividual().lineage);*/
			if(data.generation % 800 === 0) {
				$("#testspace").html(
					'<table><tr>' +
						'<th>Generation</th>' +
						'<th>Best Fitness</th>' +
						'<th>Time Running</th>' +
						'<th>Best Representation</th>' +
						'</tr><tr>' +
						'<td><div>' + data.generation + '</div></td>' +
						'<td><div>' + data.pool[0].cached + '</div></td>' +
						'<td><button onclick="window.prompt(\'Best representation: \', \'' +
						data.pool[0].representation() +'\');">See/Copy</button></td>' +
						'</tr></table>'
				);
				$("#testspace").append(data.pool[0].representation());
				window.best = mainHatch.getBestIndividual();
				if (mainHatch.getBestIndividual().cached == 9) {
					// output to be improved.
					console.log('test passed');
				}
				mainHatch.stop();
			}
		}
	});
	mainHatch.start();

});
