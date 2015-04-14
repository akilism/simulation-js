var randRangeFloat = function(min, max)  {
  return Math.random() * (max - min) + min;
};

var randRangeInt = function(min, max)  {
  return Math.floor(Math.random() * (max - min)) + min;
};

var getRandomChar = function() {
  var n = randRangeInt(65, 91);
  return (Math.random() < 1/27) ? ' ' : String.fromCharCode(n).toLowerCase();
};

var randInt = function(i) {
  return Math.floor(Math.random() * i);
};

var range = function*(min, max) {
  var i = min;
  while(i < max) {
    yield i++;
  }
};

var DNA = function(phrase, genes) {
  this.genes = genes || [];
  this.phrase = phrase;
  this.fitness = 0;
  this.pGenes = '';
  this.mutationRate = 0.01;

  if(this.genes.length === 0) {
    this.randomGenes();
  }
};

DNA.prototype.randomGenes = function() {
  for(i = 0; i < this.phrase.length; i++) {
    this.genes.push(getRandomChar());
  }
};

DNA.prototype.calculateFitness = function() {
  var dna = this;
  this.pGenes = this.genes.join('');
  this.fitness = this.genes.reduce(function(curr, val, i) {
    if(val === dna.phrase[i]) { return ++curr; }
    else { return curr; }
  }, 0) / this.phrase.length;
};

DNA.prototype.isMatch = function() {
  return this.phrase === this.genes.join('');
};

DNA.prototype.crossover = function(partner) {
  var pivot = randInt(this.genes.length);
  var genes = this.genes.slice(0, pivot).concat(partner.genes.slice(pivot));
  return new DNA(this.phrase, genes);
};

DNA.prototype.mutate = function() {
  this.genes = this.genes.map(function(gene){
    if(Math.random() < mutationRate) { return getRandomChar(); }
    else { return gene; }
  });
  return this;
  // return new DNA(this.phrase, genes);
};


var run = function(population, bestSoFar, generations) {
  if(generations >= 500) {
    return  {child: bestSoFar, generation: generations};
  }
  var phrase = 'to be or not to be';
  population = population || [];
  var popGen = range(0, 200);
  var genVal = popGen.next();
  while(!genVal.done) {
    population.push(new DNA(phrase));
    genVal = popGen.next();
  }

  var matches = population.filter(function(dna) {
    return dna.isMatch();
  });

  if(matches.length > 0) {
    return {child: matches[0], generation: generations};
  }

  population.forEach(function(dna) {
    dna.calculateFitness();
    if(!bestSoFar || bestSoFar.fitness < dna.fitness) { bestSoFar = dna; }
    // console.log(dna.genes.join(''), ': ', dna.fitness);
  });

  var matingPool = [];
  population.forEach(function(dna) {
    for(var i = 0; i < dna.fitness*100; i++) {
      matingPool.push(dna);
    }
  });

  var children = getChildren(matingPool);
  generations++;
  return run(children, bestSoFar, generations);
};

var getChildren = function(matingPool) {
  var reproduce = function(mPool, children) {
    if(mPool.length > 0) { return children; }
    var p0 = Math.floor(Math.random() * mPool.size);
    var p1 = Math.floor(Math.random() * mPool.size);
    var parent0 = mPool[p0];
    var parent1 = mPool[p1];
    var newPool = mPool;
    if(mPool.length === 1) {
      return children.push(parent0.crossover(parent1).mutate());
    } else if(p0 > p1) {
      newPool.splice(p0, 1);
      newPool.splice(p1, 1);
      return reproduce(newPool, children.push(parent0.crossover(parent1).mutate()));
    } else {
      newPool.splice(p1, 1);
      newPool.splice(p0, 1);
      return reproduce(newPool, children.push(parent0.crossover(parent1).mutate()));
    }
  };

  return reproduce(matingPool, []);
};


var top = run([], false, 0);
console.log(top);
