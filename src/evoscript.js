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

		function evalPool() {
			for(var i = 0, l = pool.length; i < l; i++) {
				pool[i].getFitness(_options.fitnessFunction, true);
			}

			pool.sort(function(a,b) {
				return a.cached <= b.cached ? -1: 1;
			});
			pool.splice(_options.poolSize);
		}

		function mutatePool() {
			for(var i = 0, l = pool.length; i < l; i++) {
				if(Math.random() < _options.mutationRate) {
					var mutator = pool[i].getClone();
					mutator.mutate();
					pool.push(mutator);
				}
			}
		}

		function crossPool() {
			var crossCandidates = [];
			// This gets the crossRate top % of the pool only. It should also include others, but at a lower weighted frequency.
			for(var i = 0, len = _options.poolSize * _options.crossRate; i < len; i++) {
				crossCandidates.push(pool[i]);
			}
			for(var j = 0, len = crossCandidates; j < len; j++) {
				var child1 = crossCandidates[j].getClone();
				var child2 = child1.cross(crossCandidates[Math.floor(Math.random() * crossCandidates.length)].getClone());


			}
		}

		this.getKeepers = function (reset){
			var x = keepers;
			if(reset === true) {
				keepers = [];
			}
			return x;
		};

		this.getBestIndividual = function () {
			return pool[0].cached;
		};

		this.isRunning = function () {
			return running;
		};

		this.start = function () {
			if(!started) {
				this.init();
				started = true;
			}
			running = true;
			$.proxy(run, this)();
		};

		this.pause = function () {
			running = false;
		};

		this.stop = function () {
			running = false;
			started = false;
		};

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
				pool.push(new nodeRep({
					depth: _options.maxDepth,
					nodeFunctions: _options.nodeFunctions,
					leafFunctions: _options.leafFunctions
				}));
			}
		};

		// Evolves a single generation.
		this.evolve = function () {
			crossPool();
			mutatePool();
			evalPool();
			generation += 1;
			if(typeof(_options.onGeneration) === "function") {
				_options.onGeneration({
					pool: pool,
					generation: generation
				});
			}

			if(_options.resetRate && generation >= _options.resetRate) {
				this.stop();
				keepers = keepers.concat(pool.splice(0, Math.floor(pool.length * _options.keepRate)));
				window.setTimeout($.proxy(this.start, this), _options.throttle + 1000);
			}
		};


	};


	return hatchery;
});
