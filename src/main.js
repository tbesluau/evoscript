require(['jquery', 'evoscript', 'nodeFunctions', 'leafFunctions', 'fitnessFunction'], function($, evoscript, nodeFunctions, leafFunctions, fitnessFunction) {
	var data = [];
	var headers = [];
	function readFile(oncomplete) {
		var file = $('#file-field')[0].files[0];
		if (file) {
			var reader = new FileReader();
			// global on purpose
			reader.readAsText(file, "UTF-8");
			reader.onload = function (evt) {
				var linesplit;
				$.each(evt.target.result.split(/\r\n|\r|\n/g), function (index, line) {
					if (line.replace(',', '').replace(' ', '')) {
						linesplit = line.split(',');
						for (var i = 0; i < linesplit.length; i++) {
							if (!isNaN(linesplit[i])) {
								linesplit[i] = linesplit[i] * 1;
							}
						}
						data.push(linesplit);
					}
				});
				// global on purpose
				headers = data.splice(0, 1);
				if(headers.length === 1) {
					headers = headers[0];
				}
				/*
				var newheaders = [];
				$.each(headers, function (index, name) {
					$.each(es_stats, function (ind, statfunc) {
						newheaders.push(name + '_' + statfunc.name);
					});
				});
				var originum = headers.length;
				headers = headers.concat(newheaders);
				var newlist = [];
				for (var i = 0; i < data.length; i++) {
					var linelist = data[i];
					processedlist = [];
					var n = originum;
					$.each(linelist, function (index, value) {
						$.each(es_stats, function (ind, statfunc) {
							processedlist.push(statfunc(value, newlist, n));
							n += 1;
						});
					});
					newlist.push(linelist.concat(processedlist));
				}
				data = newlist;*/

				// since we are using a list, make headers available as nodes
				leafFunctions.push(
					function es_header () {
						return headers[Math.floor(Math.random()*headers.length)];
					}
				);
				if(oncomplete) {
					oncomplete();
				}
			};
			reader.onerror = function (evt) {
				$('#infospace').html('Error reading CSV file');
			};
		} else {
			if(oncomplete) {
				oncomplete();
			}
		}
	}



	var mainHatch, underdogs, fileLoaded, start;


	/**
	 * TODO: Implement Event queue for things like 'reset', 'generationComplete' or whatever else.
	 *  That would trigger the transfer of underdogs as well as screen drawing.
	 */

	$('#evoscript-trigger').click(function () {
		if(!mainHatch || !mainHatch.isRunning()) {
			if(fileLoaded) {
				mainHatch.start();
				//underdogs.start();
			} else {

				readFile(function() {
					start = new Date();
					fileLoaded = true;
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
							if(data.generation % 100 === 0) {
								$("#infospace").html(
									'<table><tr>' +
										'<th>Generation</th>' +
										'<th>Best Fitness</th>' +
										'<th>Time Running</th>' +
										'<th>Best Representation</th>' +
										'</tr><tr>' +
										'<td><div>' + data.generation + '</div></td>' +
										'<td><div>' + data.pool[0].cached + '</div></td>' +
										'<td><div>' + ((new Date()) - start) / 1000 + ' s</div></td>' +
										'<td><button onclick="window.prompt(\'Best representation: \', \'' +
										data.pool[0].representation() +'\');">See/Copy</button></td>' +
										'</tr></table>'
								);
								$("#workspace").html(data.pool[0].representation());
							}
						}
					});
					underdogs = new evoscript({
						poolSize:5,
						throttle: 1000,
						resetRate: 5,
						leafFunctions: leafFunctions,
						nodeFunctions: nodeFunctions,
						fitnessFunction: new fitnessFunction({
							headers: headers,
							data: data,
							targetColumn: 'D'
						})
					});

					mainHatch.start();
					//underdogs.start();
				});

			}
		} else {
			mainHatch.pause();
			underdogs.pause();
		}
	});

	$("#evoscript-stop").click(function() {
		mainHatch.stop();
		underdogs.stop();
	});
});