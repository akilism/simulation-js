var DNA = function(phrase, genes) {
  this.genes = genes || [];
  this.phrase = phrase;
  this.fitness = 0;
  this.pGenes = '';
  this.mutationRate = 0.01;

  if(this.genes.length === 0) { this.randomGenes(); }
  this.pGenes = this.genes.join('');
};

DNA.prototype.randomGenes = function() {
  for(i = 0; i < this.phrase.length; i++) {
    this.genes.push(utils.getRandomChar());
  }
};

DNA.prototype.calculateFitness = function() {
  var dna = this;
  this.fitness = this.genes.reduce(function(curr, val, i) {
    if(val === dna.phrase[i]) { return ++curr; }
    else { return curr; }
  }, 0) / this.phrase.length;
};

DNA.prototype.isMatch = function() {
  return this.phrase === this.genes.join('');
};

DNA.prototype.crossover = function(partner) {
  var pivot = utils.randInt(this.genes.length);
  var genes = this.genes.slice(0, pivot).concat(partner.genes.slice(pivot));
  return new DNA(this.phrase, genes);
};

DNA.prototype.mutate = function() {
  var strand = this;
  var genes = this.genes.map(function(gene){
    if(Math.random() < strand.mutationRate) { return utils.getRandomChar(); }
    else { return gene; }
  });
  return new DNA(this.phrase, genes);
};
