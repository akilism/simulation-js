var interpolater = (function(currMin, currMax, otherMin, otherMax) {
  var left = currMax - currMin;
  var right = otherMax - otherMin;

  var scale = right / left;

  var getVal = function(val) {
    return otherMin + (val - currMin) * scale;
  };

  return getVal;
});

var FlowField = function(canvasWidth, canvasHeight) {
  this.resolution = 10;
  this.cols = Math.ceil(canvasWidth/this.resolution);
  this.rows = Math.ceil(canvasHeight/this.resolution);
  this.field = [];
  this.theta = interpolater(0, 1, 0, Math.PI * 2);
  this.populateFieldNoise();
};

FlowField.prototype.populateFieldNoise = function() {
  var noise = perlinNoise;
  var xOff = 0;
  for(var x = 0; x < this.cols; x++) {
    this.field[x] = [];
    var yOff = 0;
    for(var y = 0; y < this.rows; y++) {
      var t = this.theta(noise.perlin2d(xOff, yOff));
      this.field[x][y] = new Vector(Math.cos(t), Math.sin(t));
      yOff += 0.1;
    }
    xOff += 0.1;
  }
};


FlowField.prototype.populateField = function() {
  for(var x = 0; x < this.cols; x++) {
    this.field[x] = [];
    for(var y = 0; y < this.rows; y++) {
      this.field[x][y] = new Vector(1, 0);
    }
  }
};

FlowField.prototype.lookup = function(vPos) {
  var col = Math.min(this.cols-1, Math.max(0, Math.floor(vPos.x/this.resolution)));
  var row = Math.min(this.rows-1, Math.max(0, Math.floor(vPos.y/this.resolution)));
  return this.field[col][row].get();
};
