// making sure stuff loads
$('#workspace').html('evoscript loaded');
$('#infospace').html(
	'Press "Start" to get started, after defining your representation functions and fitness functions in functions.js'
);
// hatchery is our main hatchery
var hatchery = new Hatchery();
// underdogs is our secondary hatchery
// that gets reset every so often and its
// top dogs can get transfered into the main hatch
var underdogs = new Hatchery();

underdogs.resetRate = 200;
underdogs.pushTo = hatchery;
underdogs.infospace = '#infospace-underdog';
underdogs.drawBest = false;

// basic buttons wiring
$('#evoscript-trigger').click(function () {
	if(!hatchery.running) {
		readFile([hatchery, underdogs]);
		startSystem([hatchery, underdogs]);
	} else {
		hatchery.pause();
		underdogs.pause();
	}
});
$('#evoscript-stop').click(function () {
	hatchery.stop();
	underdogs.stop();
});

function startSystem (hatches) {
	if(waitforfile) {
		setTimeout(function () {
			startSystem(hatches);
		}, 50);
	} else {
		$.each(hatches, function(index, hatch) {
			hatch.start();
		});
	}
}

// handling file uploads for list based fitness functions
function readFile(hatches) {
	var file = $('#file-field')[0].files[0];
	if (file) {
		$.each(hatches, function(index, hatch) {
			hatch.useList = true;
		});
		//global on purpose
		waitforfile = true;
		var reader = new FileReader();
		// global on purpose
		es_list = [];
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
					es_list.push(linesplit);
				}
			});
			// global on purpose
			es_headers = es_list.splice(0, 1);
			if(es_headers.length === 1) {
				es_headers = es_headers[0];
			}
			var newheaders = [];
			$.each(es_headers, function (index, name) {
				$.each(es_stats, function (ind, statfunc) {
					newheaders.push(name + '_' + statfunc.name);
				});
			});
			var originum = es_headers.length;
			es_headers = es_headers.concat(newheaders);
			var newlist = [];
			for (var i = 0; i < es_list.length; i++) {
				var linelist = es_list[i];
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
			es_list = newlist;
			waitforfile = false;
			// since we are using a list, make headers available as nodes
			es_leafFunctions.push(
				function es_header () {
					return es_headers[Math.floor(Math.random()*es_headers.length)];
				}
			);
		};
		reader.onerror = function (evt) {
			$('#infospace').html('Error reading CSV file');
		};
	} else {
		waitforfile = false;
	}
}
