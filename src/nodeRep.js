define([], function() {
	var nodeRep = function(options) {

		var children = null;
		var depth = options.depth;
		var isLeaf = false;
		var method = null;

		function generate() {
			children = [];
			isLeaf = Math.random() < 1/(depth + 1);

			if(isLeaf) {
				method = options.leafFunctions[Math.floor(Math.random()*options.leafFunctions.length)]();
			} else {
				method = options.nodeFunctions[Math.floor(Math.random()*options.nodeFunctions.length)];
				if(typeof(method) === 'function') {
					for(var i = 0, len = method.length; i < len; i++) {
						children.push(new nodeRep({
							depth: depth - 1,
							nodeFunctions: options.nodeFunctions,
							leafFunctions: options.leafFunctions
						}));
					}
				}
			}
		}
		if(options.clone) {
			isLeaf = options.clone.isLeaf();
			children = [];
			method = options.clone.getMethod();
			depth = options.clone.getDepth();
			if(typeof(method) === 'function') {
				for(var i = 0, len = method.length; i < len; i++) {
					children.push(new nodeRep({
						clone: options.clone.getChild(i),
						nodeFunctions: options.nodeFunctions,
						leafFunctions: options.leafFunctions
					}));
				}
			}
		} else {
			generate();
		}

		this.getClone = function () {
			return new nodeRep({
				clone: this,
				nodeFunctions: options.nodeFunctions,
				leafFunctions: options.leafFunctions
			});
		}

		this.getChild = function(index) {
			return children[index];
		}

		this.cross = function(other) {
			this.reset();

		}
		this.reset = function() {
			this.cached = null;
		}

		this.isLeaf = function() {
			return isLeaf;
		}
		this.getDepth = function() {
			return depth;
		}
		this.getMethod = function() {
			return method;
		}
		this.cached = null;
		this.getFitness = function(fitfunc, usecache) {
			if(usecache && this.cached !== null) {
				return this.cached;
			} else {
				if(!fitfunc) {
					console.log('here');
				}
				this.cached = fitfunc(this.evaluateFunc());
				return this.cached;
			}
		}
		this.evaluateFunc = function() {

			var childrenFunctions = [];
			for(var i = 0, l = children.length; i < l; i++) {
				childrenFunctions.push(children[i].evaluateFunc());
			}
			var rep = this.isLeaf() ?
				function(obj) {
					if(obj && obj[method]) {
						return obj[method];
					} else {
						return method;
					}
				} : function(obj) {
					var args = [];
					for(var i = 0, l = children.length; i < l; i++) {
						args.push(childrenFunctions[i](obj));
					}
					return method.apply(null, args);
				};
			return rep;
		}
		this.representation = function() {
			var childrenNames = [];
			for(var i = 0, l = children.length; i < l; i++) {
				childrenNames.push(children[i].representation());
			}
			var rep = this.isLeaf() ? method:
				method.name + '(' + childrenNames.join(',') + ')';
			return rep;
		}
		this.mutate = function() {
			this.reset();
			var mutating = Math.random() < 1/(depth + 1);

			if(mutating) {
				generate();
			} else {
				for(var i = 0, l = children.length; i < l; i++) {
					var childMutated = children[i].mutate();
					if(childMutated) {
						break;
					}
				}
			}
			return mutating;
		}

	};

	return nodeRep;
});