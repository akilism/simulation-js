var CellularAutomata = function(ruleSet, cellSize, canvasWidth, canvasHeight) {
  this.ruleSet = ruleSet;
  this.cellSize = cellSize;
  this.numCells = Math.floor((canvasWidth)/cellSize);
  this.cells = [];
  this.generation = 0;
  this.maxGenerations = Math.floor((canvasHeight-100)/cellSize);
  this.cells.length = this.numCells;
  this.generations = [];

  for(var i = 0; i < this.numCells; i++) {
    this.cells[i] = (i === Math.floor(this.numCells/2)) ? 1 : 0;
    // this.cells[i] = Math.round(random.umonteCarlo());
  }
  this.generations[this.generation] = this.cells;
  this.generation++;

};

CellularAutomata.prototype.spawn = function() {

  var getChild = function(cell, i) {
    var left = (i-1 >= 0) ? this.cells[i-1] : 0; //this.cells[this.cells.length - 1];
    var middle = cell;
    var right = (i+1 < this.cells.length) ? this.cells[i+1] : 0; //this.cells[0];
    return this.rules([left, middle, right]);
  };

  if(this.generation < this.maxGenerations) {
    var newCells = this.cells.map(getChild.bind(this));
    this.cells = newCells;
    this.generations[this.generation] = newCells;
    this.generation++;
  }
};


CellularAutomata.prototype.rules = function(states) {
   return this.ruleSet[states.join('')];
};
