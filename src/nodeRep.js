/* globals define */

define([], function() {
	var nodeRep = function(options) {

		this.options = options;

		this.children = null;
		this.isLeaf = false;
		this.method = null;
		
		this.depth = options.depth;
		this.cached = null;
		this.weight = null;

		this.generate = function () {
			this.children = [];
			this.isLeaf = Math.random() < 1/(this.depth + 1);
			if(this.isLeaf) {
				this.method = options.leafFunctions[Math.floor(Math.random()*options.leafFunctions.length)]();
			} else {
				this.method = options.nodeFunctions[Math.floor(Math.random()*options.nodeFunctions.length)];
				if(typeof(this.method) === 'function') {
					for(var i = 0, len = this.method.length; i < len; i++) {
						this.children.push(new nodeRep({
							depth: this.depth - 1,
							nodeFunctions: options.nodeFunctions,
							leafFunctions: options.leafFunctions
						}));
					}
				}
			}
		};

		if(options.clone) {
			this.isLeaf = options.clone.isLeaf;
			this.children = [];
			this.method = options.clone.method;
			this.depth = options.clone.depth;
			if(typeof(this.method) === 'function') {
				for(var i = 0, len = this.method.length; i < len; i++) {
					this.children.push(new nodeRep({
						clone: options.clone.getChild(i),
						nodeFunctions: options.nodeFunctions,
						leafFunctions: options.leafFunctions
					}));
				}
			}
			options.clone = null;
		} else {
			this.generate();
		}

		this.getClone = function () {
			return new nodeRep({
				clone: this,
				nodeFunctions: this.options.nodeFunctions,
				leafFunctions: this.options.leafFunctions
			});
		};

		this.getChild = function(index) {
			return this.children[index];
		};

		this.reset = function() {
			this.cached = null;
			this.weight = null;
			for(var i = 0, l = this.children.length; i < l; i++) {
				this.children[i].reset();
			}
		};

		this.getFitness = function(fitfunc, isBest, scratch) {
			if(!scratch && !isBest && this.cached !== null) {
				return this.cached;
			} else {
				var cache = fitfunc(this.evaluateFunc(), isBest);
				if (typeof(isBest) !== 'object') {
					this.cached = cache;
				}
				return cache;
			}
		};

		this.getWeight = function() {
			if (this.weight) {
				return this.weight;
			}
			else {
				this.weight = this.calculateWeight();
				return this.weight;
			}
		};

		this.calculateWeight = function () {
			if (this.isLeaf) {
				return 1;
			} else {
				var childweight = 0;
				for(var i = 0, l = this.children.length; i < l; i++) {
					childweight += this.children[i].calculateWeight();
				}
				return 1 + childweight;
			}
		};

		this.evaluateFunc = function() {
			var self = this;
			var childrenFunctions = [];
			for(var i = 0, l = this.children.length; i < l; i++) {
				childrenFunctions.push(this.children[i].evaluateFunc());
			}
			var rep;
			if (this.isLeaf) {
				rep = function(obj) {
					if(obj && obj[self.method] !== undefined) {
						return obj[self.method];
					} else {
						return self.method;
					}
				};
			} else {
				rep = function(obj) {
					var args = [];
					for(var i = 0, l = self.children.length; i < l; i++) {
						args.push(childrenFunctions[i](obj));
					}
					return self.method.apply(null, args);
				};
			}
			return rep;
		};

		this.representation = function() {
			var childrenNames = [];
			for(var i = 0, l = this.children.length; i < l; i++) {
				childrenNames.push(this.children[i].representation());
			}
			var rep = this.isLeaf ? this.method:
				this.method.name + '(' + childrenNames.join(',') + ')';
			return rep;
		};

		this.mutate = function () {
			var mutatingNode = this.randomNode();
			mutatingNode.generate();
			this.reset();
		};

		this.cross = function (other) {
			var mutatingNode = this.randomNode();
			var changeNode = other.randomNode().getClone();
			mutatingNode.replaceWith(changeNode);
			this.reset();
		};

		this.replaceWith = function (other) {
			this.method = other.method;
			this.children = other.children;
			this.isLeaf = other.isLeaf;
			this.trim();
		};

		this.trim = function () {
			if (this.depth === 0 && !this.isLeaf) {
				this.method = this.options.leafFunctions[Math.floor(Math.random()*options.leafFunctions.length)]();
				this.children = [];
				this.isLeaf = true;
			} else {
				var child;
				for(var i = 0, l = this.children.length; i < l; i++) {
					child = this.children[i];
					child.depth = this.depth - 1;
					child.trim();
				}
			}
		};

		this.randomNode = function () {
			var rnum = Math.random() * this.getWeight();
			var compweight = 1;
			if (rnum < compweight) {
				return this;
			} else {
				var child;
				for(var i = 0, l = this.children.length; i < l; i++) {
					child = this.children[i];
					compweight += child.getWeight();
					if (rnum < compweight) {
						return child.randomNode();
					}
				}
			}
		};

	};

	return nodeRep;
});
