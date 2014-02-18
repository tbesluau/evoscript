define(['nodeRep'], function(nodeRep) {
	var defaults = {
		poolSize: 1000,
		mutationRate: 0.2,
		crossRate: 0.1,
		maxDepth: 4,
		throttle: 0,
		resetRate: 0,
		keepRate: 0.05,
		leafFunctions: [],
		nodeFunctions: [],
		fitnessFunction: function () { return 0; }

	};

	var hatchery = function(override_options) {
		var _options = $.extend(true, {}, defaults, override_options);

		var pool = [];
		var best = null;
		var generation = 0;
		var running = false;
		var started = false;
		var keepers = [];

		this.getKeepers = function (reset){
			var x = keepers;
			if(reset === true) {
				keepers = [];
			}
			return x;
		}

		this.isRunning = function () {
			return running;
		}

		this.start = function () {
			if(!started) {
				this.init();
				started = true;
			}
			running = true;
			$.proxy(run, this)();
		}

		this.pause = function () {
			running = false;
		}

		this.stop = function () {
			running = false;
			started = false;
		}

		var run = function () {
			if(running) {
				this.evolve();
				window.setTimeout($.proxy(run, this), _options.throttle);
			}
		};

		this.init = function () {
			pool = [];
			best = null;
			generation = 0;
			for(var i = 0; i < _options.poolSize; i++) {
				pool.push(generateTree(_options.maxDepth));
			}
		}

		// Evolves a single generation.
		this.evolve = function () {
			//crossPool();
			//mutatePool();
			//evalPool();
			generation += 1;
			console.log(pool[0].representation());
			if(_options.resetRate && generation >= _options.resetRate) {
				this.stop();
				keepers = keepers.concat(pool.splice(0, Math.floor(pool.length * _options.keepRate)));
				window.setTimeout($.proxy(this.start, this), _options.throttle + 1000);
			}
		}

		// Generate a single item.
		var generateTree = function (depth) {
			if(depth === 1) {
				return new nodeRep(_options.leafFunctions);
			} else {
				var node = new nodeRep(_options.nodeFunctions);
				for(var i = 0, len = node.getMethod().length; i < len; i++) {
					node.addChild(generateTree(depth - 1));
				}
				return node;
			}
		};
	};


	return hatchery;
});