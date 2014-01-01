// please indulge my OO bias

// Representation tree made of RepNodes
function RepNode (method) {
	
	var self = this;

	this.fitness = null;
	this.method = method;
	this.isLeaf = typeof(this.method) != 'function';
	this.representation = '';
	this.removalFlag = false;

	this.parentNode = null;
	this.children = [];
	this.depth = 0;

	// use this function to obtain a copy of the item. This is the preferred method
	// for cloning there are good changes toolkit methods for this won't work
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

	// recursively determins the representation of the node, as string that
	// can be evaluated during fitness calculation
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

	// adds a node as the child of this node
	this.addChild = function (node, index) {
		if(index === undefined) {
			self.children.push(node);
		} else {
			self.children[index] = node;
		}
		node.parentNode = self;
		node.depth = self.depth + 1;
	};

	// recalculates the depth from this node down
	this.recalibrate = function () {
		self.fitness = null;
		self.depth = this.parentNode? this.parentNode.depth + 1: 0;
		$.each(self.children, function (index, child) {
			child.recalibrate();
		});
	};

	// returns a list of all nodes from this node down
	// useful to pick a random one among them
	// XXX we dhouldn't need that, let's random as we go down
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
	// how big can our representation tree be
	this.maxDepth = 4;
	// are there random events in evaluation of fitness?
	// if not we will not re-evaluate an individual again
	this.forceEval = false;
	// after how many generation to wipe clean
	// 0 means never, keep it there for single hatch systems
	this.resetRate = 0;
	// DOM element selector to show info
	this.infospace = '#infospace';
	// whether to draw best individual on screen
	// set to false for underdogs hatches
	this.drawBest = true;
	// if there is a reset top results can be pushed to a main hatch
	this.pushTo = null;
	// the ratio to push
	this.topPush = 0.05;
	// the main hatch reserve to pull
	this.reserve = [];

	this.generation = 0;
	this.pool = [];
	this.best = null;

	this.running = false;
	this.started = false;

	// init/reset function
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

	// manages the whole happening for each generation
	this.nextGen = function () {
		this.crossPool();
		this.mutatePool();
		this.evalPool();
		this.generation += 1;
		if(this.resetRate && this.generation >= this.resetRate) {
			this.stop();
			this.pushTo.reserve = self.pool.splice(0, Math.floor(self.pool.length * self.topPush));
			window.setTimeout(self.start, 1000);
		}
	};

	// evaluate the whole pool and removes unfit individuals
	this.evalPool = function () {
		if(self.reserve.length) {
			self.pool = self.pool.concat(self.reserve);
			self.reserve = [];
		}
		$.each(this.pool, function (index, individual) {
			self.evalIndividual(individual);
		});
		self.pool.sort(function (a, b) {
			var abest = a.fitness <= b.fitness;
			if(b.removalFlag && !a.removalFlag) {
				return -1;
			}
			if(a.removalFlag && !b.removalFlag) {
				return 1;
			}
			return a.fitness <= b.fitness? -1: 1;
		});
		self.pool.splice(self.poolSize);
	};

	// runs the fitness function on an individual
	this.evalIndividual = function (individual) {
		if(!this.forceEval && individual.fitness !== null) {
			return individual.fitness;
		}
		individual.fitness = es_fitness(individual.representation, self.useList);
		return individual.fitness;
	};

	// random individuals throughout the pool are mutated
	// mutated is kept if at least as good as original
	this.mutatePool = function () {
		$.each(this.pool, function (index, individual) {
			if(Math.random() < self.mutationRate) {
				self.mutate(individual);
			}
		});
	};
	
	// top individuals get to reproduce
	// offsprings are kept if better than a parent
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

	// selects a random node off of each individual and exchanges it
	// then trims to max depth
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
		self.evalIndividual(newNode1);
		self.evalIndividual(newNode2);
		var bestnew,
			lowNew,
			bestRoot,
			lowRoot;
		if(newNode1.fitness < newNode2.fitness) {
			bestNew = newNode1;
			lowNew = newNode2;
		} else {
			bestNew = newNode2;
			lowNew = newNode1;
		}
		if(rootNode1.fitness < rootNode2.fitness) {
			bestRoot = rootNode1;
			lowRoot = rootNode2;
		} else {
			bestRoot = rootNode2;
			lowRoot = rootNode1;
		}
		if(bestNew.fitness <= lowRoot.fitness) {
			self.pool.push(bestNew);
			lowRoot.removalFlag = true;
			if(lowNew.fitness <= bestRoot.fitness) {
				self.pool.push(lowNew);
				bestRoot.removalFlag = true;
			}
		}
	};

	// trims a tree by replacing nodes that are at max depth
	// by random leaves
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

	// picks a random node off of an individual
	// generates a new subtree from there down
	this.mutate = function (rootNode) {
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
		self.evalIndividual(newNode);
		if(newNode.fitness <= rootNode.fitness) {
			self.pool.push(newNode);
			rootNode.removalFlag = true;
		}
	};

	this.getBestCandidate = function () {
		var poolTop = self.pool[0];
		return poolTop;
	};

	// creates a tree from scratch
	// TODO does it have to be a full depth tree?
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

	// prints the generation's stats and draws the best individual
	// if the es_draw function is setup
	this.draw = function () {
		var best = self.getBestCandidate();
		if(!self.best || best.fitness < self.best.fitness) {
			self.best = best;
			if(self.drawBest) {
				es_draw(self.best);
			}
		}
		$(self.infospace).html(
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

	// returns the total fitness of every individual in the pool
	// TODO can this be calculated somewhere on the fly?
	this.getTotal = function () {
		var total = 0;
		$.each(self.pool, function (index, individual) {
			total += individual.fitness;
		});
		return total;
	};

	// simple running loop that will start the next generation
	// and draw it
	this.run = function () {
		self.nextGen();
		self.draw();
		if(self.running) {
			window.setTimeout(self.run, 10);
		}
	};

	// priming and starting
	// or unpausing if already started
	this.start = function () {
		if(!self.started) {
			self.init();
			self.started = true;
		}
		self.running = true;
		self.run();
	};

	// pauses without consequences
	// starting from there just unpauses
	this.pause = function () {
		self.running = false;
	};

	// stops the evolution
	// starting again will start from scratch
	this.stop = function () {
		self.started = false;
		self.running = false;
	};
}
