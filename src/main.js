// making sure stuff loads
$('#workspace').html('evoscript loaded');
$('#infospace').html(
	'Press "Start" to get started, after defining your representation functions and fitness functions in functions.js'
);

// basic buttons wiring
var hatchery = new Hatchery();
$('#evoscript-trigger').click(function () {
	if(!hatchery.running) {
		readFile();
		startSystem();
	} else {
		hatchery.pause();
	}
});
$('#evoscript-stop').click(function () {
	hatchery.stop();
});

function startSystem () {
	if(waitforfile) {
		setTimeout(startSystem, 50);
	} else {
		hatchery.start();
	}
}

// handling file uploads for list based fitness functions
function readFile() {
	var file = $('#file-field')[0].files[0];
	if (file) {
		hatchery.useList = true;
		//global on purpose
		waitforfile = true;
		var reader = new FileReader();
		// global on purpose
		es_list = [];
		reader.readAsText(file, "UTF-8");
		reader.onload = function (evt) {
			$.each(evt.target.result.split(/\r\n|\r|\n/g), function (index, line) {
				es_list.push(line.split(','));
			});
			// global on purpose
			es_headers = es_list.splice(0, 1);
			if(es_headers.length === 1) {
				es_headers = es_headers[0];
			}
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
