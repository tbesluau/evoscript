// please indulge my OO bias

function cloneNode(node) {
	var newNode = new RepNode(node.method);
	if(node.isLeaf) {
		return newNode;
	} else {
		$.each(node.children, function (index, child) {
			newNode.addChild(cloneNode(child))
		});
		return newNode;
	}
}

function RepNode (method) {
	
	var self = this;

	this.fitness = 0;
	this.method = method;
	this.isLeaf = typeof(this.method) != 'function';
	this.representation = '';

	this.parentNode = null;
	this.children = [];
	this.depth = 0;

	this.represent = function () {
		var childrenNames = [];
		$.each(self.children, function (key, child) {
			childrenNames.push(child.represent());
		});
		representation = self.isLeaf? self.method:
			self.method.name + '(' + childrenNames.join(',') + ')';
		self.representation = representation;
		return representation;
	};

	this.addChild = function (node, index) {
		if(index === undefined) {
			self.children.push(node);
		} else {
			self.children[index] = node;
		}
		node.parentNode = self;
		node.depth = self.depth + 1;
	};

	this.recalibrate = function () {
		self.fitness = 0;
		self.depth = this.parentNode? this.parentNode.depth + 1: 0;
		if(self.depth > 15) {
			console.log(self.depth);
		}
		$.each(self.children, function (index, child) {
			child.recalibrate();
		});
	};

	this.allNodes = function () {
		var nodes = [self];
		$.each(self.children, function (index, child) {
			nodes = nodes.concat(child.allNodes());
		});
		return nodes;
	}

	this.draw = function (parentDOM) {
		if(!parentDOM) {
			$('#workspace').html('');
			parentDOM = $('#workspace');
		}
		if(self.isLeaf) {
			parentDOM.append(
				'<div class="evoscript-node leaf-div"><span>' + self.method + '</span></div>'
			);
		} else {
			var div = $(
				'<div class="evoscript-node"><div class="node-div"><span>' + self.method.name + '</span></div></div>'
			);
			parentDOM.append(div);
			$.each(self.children, function (index, child) {
				child.draw(div);
			});
		}
	};
}

function Hatchery () {
	
	var self = this;

	this.poolSize = 1000;
	this.mutationRate = 0.02;
	this.crossRate = 0.1;

	this.generation = 0;
	this.pool = [];
	this.maxDepth = 4;
	this.best = null;

	this.running = false;

	this.init = function () {
		for(var i=0; i < this.poolSize; i++) {
			var newTree = self.generateTree(self.maxDepth);
			newTree.represent();
			self.pool.push(newTree);
		}
	};

	this.nextGen = function () {
		this.crossPool()
		this.mutatePool();
		this.evalPool();
		this.generation += 1;
	};

	this.evalPool = function () {
		$.each(this.pool, function (index, individual) {
			self.evalIndividual(individual)
		});
		self.pool.sort(function (a, b) {
			return a.fitness < b.fitness? 1: -1;
		});
		self.pool.splice(self.poolSize)
	};

	this.evalIndividual = function (individual) {
		result = eval(individual.representation);
		individual.fitness = es_fitness(result);
		return individual.fitness;
	};

	this.mutatePool = function () {
		$.each(this.pool, function (index, individual) {
			if(Math.random() < self.mutationRate) {
				self.mutate(individual);
			}
		});
	};
	
	this.crossPool = function () {
		var crossCandidates = [];
		for(var i=0; i<self.poolSize * self.crossRate; i++) {
			crossCandidates.push(self.pool[i]);
		}
		for(var i=0; i<self.poolSize * self.crossRate / 2; i++) {
			var best = crossCandidates.splice(0, 1)[0];
			var randomOther = crossCandidates.splice(Math.floor(Math.random() * crossCandidates.length), 1)[0];
			self.cross(best, randomOther);
		}
	};

	this.cross = function (rootNode1, rootNode2) {
		var newNode1 = cloneNode(rootNode1);
		var newNode2 = cloneNode(rootNode2);

		var allNodes = newNode1.allNodes();
		var crossNode1 = allNodes[Math.floor(Math.random()*allNodes.length)];
		allNodes = newNode2.allNodes();
		var crossNode2 = allNodes[Math.floor(Math.random()*allNodes.length)];
		if(crossNode1.parentNode) {
			var parentNode = crossNode1.parentNode;
			var index = parentNode.children.indexOf(crossNode1);
			if(crossNode1.isLeaf) {
				parentNode.addChild(new RepNode(getESLeafFunction()), index);
			} else {
				parentNode.addChild(crossNode2, index);
				newNode1.recalibrate();
				self.trimNode(newNode1);
			}
			
		} else {
			newNode1 = crossNode2;
			newNode1.recalibrate();
		}
		if(crossNode2.parentNode) {
			var parentNode = crossNode2.parentNode;
			var index = parentNode.children.indexOf(crossNode2);
			if(crossNode2.isLeaf) {
				parentNode.addChild(new RepNode(getESLeafFunction()), index);
			} else {
				parentNode.addChild(crossNode1, index);
				newNode2.recalibrate();
				self.trimNode(newNode2);
			}
			
		} else {
			newNode2 = crossNode1;
			newNode2.recalibrate();
		}
		newNode1.represent();
		newNode2.represent();
		self.pool.push(newNode1);
		self.pool.push(newNode2);
		/*console.log([
			newNode1.representation,
			rootNode1.representation,
			newNode2.representation,
			rootNode2.representation
		]);*/
	};

	this.trimNode = function (rootNode) {
		if(!rootNode.isLeaf) {
			if(rootNode.depth > self.maxDepth - 1) {
				var index = rootNode.parentNode.children.indexOf(rootNode);
				childNode = new RepNode(getESLeafFunction());
				rootNode.parentNode.addChild(childNode, index);
			} else {
				$.each(rootNode.children, function(index, child) {
					self.trimNode(child);
				});
			}
		}
	};

	this.mutate = function (rootNode) {
		var before = rootNode.representation;
		var newNode = cloneNode(rootNode);
		allNodes = newNode.allNodes();
		mutedNode = allNodes[Math.floor(Math.random()*allNodes.length)];
		if(!mutedNode.parentNode) {
			newNode = self.generateTree(self.maxDepth);
		} else {
			parentNode = mutedNode.parentNode;
			var index = parentNode.children.indexOf(mutedNode);
			if(mutedNode.isLeaf) {
				parentNode.addChild(new RepNode(getESLeafFunction()), index);
			} else {
				parentNode.addChild(self.generateTree(self.maxDepth - parentNode.depth - 1), index);
				newNode.recalibrate();
			}
		}
		newNode.represent();
		self.pool.push(newNode);
		var after = newNode.representation;
		console.log(after != before? 'ok': 'bad');
	   	console.log([before, after]);
	};

	this.getBestCandidate = function () {
		var poolTop = self.pool[0];
		return poolTop;
	};

	this.generateTree = function (depth, parentNode) {
		var rootNode = parentNode || new RepNode(getESNodeFunction());
		var leafChildrenOnly = depth < 2;
		if(!rootNode.isLeaf) {
			for(var i=0; i<rootNode.method.length; i++) {
				childNode = new RepNode(leafChildrenOnly? getESLeafFunction(): getESNodeFunction());
				rootNode.addChild(childNode);
				self.generateTree(depth - 1, childNode);
			}
		}
		return rootNode;
	};

	this.draw = function () {
		var best = self.getBestCandidate();
		if(!self.best || best.fitness > self.best.fitness) {
			self.best = best;
			self.best.draw();
		}
		$('#infospace').text(
			'Gen ' + self.generation + ', Best individual: ' + self.best.fitness
			+ ' (total: ' + self.getTotal() + ')'
		);

	};

	this.getTotal = function () {
		var total = 0;
		$.each(self.pool, function (index, individual) {
			total += individual.fitness;
		});
		return total;
	};

	this.run = function () {
		self.nextGen();
		self.draw();
		if(self.running) {
			window.setTimeout(self.run, 10);
		}
	};

	this.start = function () {
		self.init();
		self.running = true;
		self.run();
	};

	this.stop = function () {
		self.running = false;
	};
}

$('#workspace').html('evoscript loaded');
var hatchery = new Hatchery();
$('#evoscript-trigger').click(function () {
	if(!hatchery.running) {
		hatchery.start();
	} else {
		hatchery.stop();
	}
});
