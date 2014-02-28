/* globals define */

define([], function() {
	var nodeRep = function(options) {

		this.options = options;

		this.children = null;
		this.isLeaf = false;
		this.method = null;
		
		this.depth = options.depth;
		this.cached = null;
		this.weight = 1;
		this.lineage = 'O';

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
			this.weight = 1;
		};

		this.getFitness = function(fitfunc, scratch) {
			if(!scratch && this.cached !== null) {
				return this.cached;
			} else {
				this.cached = fitfunc(this.evaluateFunc());
				return this.cached;
			}
		};

		this.evaluateFunc = function() {
			var self = this;
			var childrenFunctions = [];
			for(var i = 0, l = this.children.length; i < l; i++) {
				childrenFunctions.push(this.children[i].evaluateFunc());
			}
			var rep;
			this.weight = 1;
			if (this.isLeaf) {
				rep = function(obj) {
					if(obj && obj[self.method]) {
						return obj[self.method];
					} else {
						return self.method;
					}
				};
			} else {
				for(var j = 0, k = this.children.length; j < k; j++) {
					this.weight += this.children[j].weight;
				}
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
			this.reset();
			var mutatingNode = this.randomNode();
			mutatingNode.generate();
		};

		this.cross = function (other) {
			this.reset();
			var mutatingNode = this.randomNode();
			var changeNode = other.randomNode().getClone();
			mutatingNode.replaceWith(changeNode);
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
			var rnum = Math.random() * this.weight;
			var compweight = 1;
			if (rnum < compweight) {
				return this;
			} else {
				var child;
				for(var i = 0, l = this.children.length; i < l; i++) {
					child = this.children[i];
					compweight += child.weight;
					if (rnum < compweight) {
						return child.randomNode();
					}
				}

			}
		};

	};

	return nodeRep;
});
