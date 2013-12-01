evoscript
=========

Open source genetic programming library in javascript.

What is a [genetic algorithm](http://en.wikipedia.org/wiki/Genetic_algorithm) and what is [genetic programming](http://en.wikipedia.org/wiki/Genetic_programming)?

## Hello world

    git clone https://github.com/tbesluau/evoscript.git
    cd evoscript
    open index.html
    
From there you have 2 options:
 * Either click the start button with no file which will run a simple fitness function to get close to a given number using only basic operations on ints.
 * Or upload the provided data/evoscript csv file then click the start button to run a list fitness function to estimate Dn+1 based on An, Bn, Cn, and Dn.

## Make your own

To make your own genetic algorithm, all you need to do is specify your own fitness function and, if needed, your representation function.

See or replace the functions in functions.js as a reference.

### Start/Pause Stop buttons

The Start/Pause button can be used safely to start the evolution process and pause it, restart it etc. It will pause at the next available break which happens between generations.

The stop button stops the evolution. Clicking the start button again after stopping will start from scratch and effectively lose the result of the evolution.

### Info section

The info section on top of the screen displays the following information:
 * Generation: the generation number the program is at. A generation is a wave of reproduction/mutation of the whole pool.
 * Best Fitness: the fitness value of the best individual in the pool.
 * Total: the sum of all the fitness values of all individuals in the pool
 * Best Representation: the representation of the best individual as a string, for instance:

        nodeA(nodeB(1, A), nodeC(0.342, "foobar"))

### Data files (CSV)

Individuals in evoscript are algorithms. Sometimes, you will use them to generate a simple result on their own, but most of the time you will use them on data sets. The individual algorithm will run for each set of data and the fitness function will use the result for each set to guess a value of the next set or make decisions that apply to the next sets etc.

Evoscript can handle most of the paperwork for you there. Simply upload a CSV file using the upload button. The first row must be the names of the variables, and the following rows their values. See data/evoscript.csv for an example. Once you upload a file and click start, those variables from the header will be automatically made available as leafs for the GA graph. This means that those variables need evaluated in your fitness function for each row, as they are in the functions.js file in the fitness_list example.

### Representation Functions

Representation functions are the nodes of the tree that acts as an individual algorithm. A node that is not a leaf will be a function, the children of which will be the function's argument. The function result will be passed up to the parent node, or be the result of the algorithm's evaluation in case the node is root of the tree. The leafs of the tree are functions that do not take any arguments.

Those functions live in functions.js node ones in es\_nodeFunction and leaf ones in es\_leafFunctions. Feel free to add your own to the lists.

### Fitness Function

Based on wether you are evaluating on a list or not, you will need to override the fintess function called fitness\_simple or fitness\_list (respectively) in functions.js. Result of the fitness function must be positive numbers the closer to zero the greater the fitness.

For instance for a prediction algo, you can sum the differences between the predictions and the real value and return it as the result of the fitness function. For a trading algo, you can return 1/gain, etc.

## Tips and tricks

 * Dev tools or firebug can slow down the process quite a bit. Make sure to turn them off for optimal performance.
 * If you want to participate/bugfix, please make a ticket first.
 * Stay tuned as we implement a system to share representation and fitness functions online and load them at will from evoscript.
