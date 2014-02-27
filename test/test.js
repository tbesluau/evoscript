require(['jquery', 'evoscript', 'nodeFunctions', 'leafFunctions', 'fitnessFunction'], function($, evoscript, nodeFunctions, leafFunctions, fitnessFunction) {

	Math.seed = 12345;
	Math.random = function () {
		var x = Math.sin(Math.seed++) * 10000; return x - Math.floor(x);
	};

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
		poolSize:1000,
		throttle: 0,
		leafFunctions: leafFunctions,
		nodeFunctions: nodeFunctions,
		fitnessFunction: new fitnessFunction({
			headers: headers,
			data: data,
			targetColumn: 'A'
		}),
		onGeneration: function(data) {
			if(data.generation % 500 === 0) {
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
				console.log(mainHatch.getBestIndividual() == 25.999999999999996);
				mainHatch.stop();
			}
		}
	});
	mainHatch.start();

});
