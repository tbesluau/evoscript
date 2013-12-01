// please indulge my OO bias

// Representation tree made of RepNodes
function RepNode (method) {
	
	var self = this;

	this.fitness = 0;
	this.method = method;
	this.isLeaf = typeof(this.method) != 'function';
	this.representation = '';

	this.parentNode = null;
	this.children = [];
	this.depth = 0;

	this.clone = function () {
		var newNode = new RepNode(self.method);
		if(self.isLeaf) {
			return newNode;
		} else {
			$.each(self.children, function (index, child) {
				newNode.addChild(child.clone());
			});
			return newNode;
		}
	};

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
	};
}

// the hatchery generates and evolves individuals
// it manages the reproduction and mutation of individuals
function Hatchery () {
	
	var self = this;
	
	// are we evolving on a list/csv file
	this.useList = false;
	// how many individuals are evolving in the hatchery
	this.poolSize = 1000;
	// what share of the population mutates each generation
	this.mutationRate = 0.02;
	// what share of the population gets to reproduce
	this.crossRate = 0.1;

	this.generation = 0;
	this.pool = [];
	this.maxDepth = 4;
	this.best = null;

	this.running = false;
	this.started = false;

	this.init = function () {
		this.pool = [];
		this.best = null;
		this.generation = 0;
		for(var i=0; i < this.poolSize; i++) {
			var newTree = self.generateTree(self.maxDepth);
			newTree.represent();
			self.pool.push(newTree);
		}
	};

	this.nextGen = function () {
		this.crossPool();
		this.mutatePool();
		this.evalPool();
		this.generation += 1;
	};

	this.evalPool = function () {
		$.each(this.pool, function (index, individual) {
			self.evalIndividual(individual);
		});
		self.pool.sort(function (a, b) {
			return a.fitness <= b.fitness? -1: 1;
		});
		self.pool.splice(self.poolSize);
	};

	this.evalIndividual = function (individual) {
		individual.fitness = es_fitness(individual.representation, self.useList);
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
		for(var j=0; j<self.poolSize * self.crossRate / 2; j++) {
			var best = crossCandidates.splice(0, 1)[0];
			var randomOther = crossCandidates.splice(Math.floor(Math.random() * crossCandidates.length), 1)[0];
			self.cross(best, randomOther);
		}
	};

	this.cross = function (rootNode1, rootNode2) {
		var newNode1 = rootNode1.clone();
		var newNode2 = rootNode2.clone();

		var allNodes = newNode1.allNodes();
		var crossNode1 = allNodes[Math.floor(Math.random()*allNodes.length)];
		allNodes = newNode2.allNodes();
		var crossNode2 = allNodes[Math.floor(Math.random()*allNodes.length)];
		if(crossNode1.parentNode) {
			var parentNode1 = crossNode1.parentNode;
			var index1 = parentNode1.children.indexOf(crossNode1);
			if(crossNode1.isLeaf) {
				parentNode1.addChild(new RepNode(getESLeafFunction()), index1);
			} else {
				parentNode1.addChild(crossNode2, index1);
				newNode1.recalibrate();
				self.trimNode(newNode1);
			}
			
		} else {
			newNode1 = crossNode2;
			newNode1.recalibrate();
		}
		if(crossNode2.parentNode) {
			var parentNode2 = crossNode2.parentNode;
			var index2 = parentNode2.children.indexOf(crossNode2);
			if(crossNode2.isLeaf) {
				parentNode2.addChild(new RepNode(getESLeafFunction()), index2);
			} else {
				parentNode2.addChild(crossNode1, index2);
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
		var newNode = rootNode.clone();
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
		if(!self.best || best.fitness < self.best.fitness) {
			self.best = best;
			draw(self.best);
		}
		$('#infospace').html(
			'<table><tr>' +
			'<th>Generation</th>' + 
			'<th>Best Fitness</th>' + 
			'<th>Total</th>' + 
			'<th>Best Representation</th>' + 
			'</tr><tr>' +
			'<td><div>' + self.generation + '</div></td>' + 
			'<td><div>' + self.best.fitness + '</div></td>' + 
			'<td><div>' + self.getTotal() + '</div></td>' + 
			'<td><button onclick="window.prompt(\'Best representation: \', \'' +
			self.best.representation +'\');">See/Copy</button></td>' +
			'</tr></table>'
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
		if(!self.started) {
			self.init();
			self.started = true;
		}
		self.running = true;
		self.run();
	};

	this.pause = function () {
		self.running = false;
	};

	this.stop = function () {
		self.started = false;
		self.running = false;
	};
}
