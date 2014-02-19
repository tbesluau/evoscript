define([], function() {
	var nodeRep = function(functions) {

		var children = [];
		var depth = 0;
		var parentNode = null;
		var isLeaf = false;

		var method = functions[Math.floor(Math.random()*functions.length)];
		if(method.length === 0) {
			isLeaf = true;
			method = method();
		}

		this.addChild = function(node) {
			children.push(node);
		}
		this.isLeaf = function() {
			return isLeaf;
		}
		this.getMethod = function() {
			return method;
		}
		this.representation = function() {
			var childrenNames = [];
			for(var i = 0, l = children.length; i < l; i++) {
				childrenNames.push(children[i].representation());
			}
			var rep = this.isLeaf() ? method:
				method.name + '(' + childrenNames.join(',') + ')';
			//this.representation = rep;
			return rep;
		}
	};

	return nodeRep;
});