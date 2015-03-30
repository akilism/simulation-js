var Vector = function(x, y) {
  this.x = x;
  this.y = y;
  this.mag = null;
  this.normalized = null;
};

Vector.prototype.add = function(other) {
  return new Vector((this.x + other.x), (this.y + other.y));
};

Vector.prototype.subtract = function(other) {
  return new Vector((this.x - other.x), (this.y - other.y));
};

Vector.prototype.multiply = function(n) {
  return new Vector((this.x * n), (this.y * n));
};

Vector.prototype.divide = function(n) {
  return new Vector((this.x / n), (this.y / n));
};

Vector.prototype.magnitude = function() {
  if(!this.mag) { this.mag = Math.sqrt((this.x * this.x) + (this.y * this.y)); }
  return this.mag;
};

Vector.prototype.normalize = function() {
  if(!this.normalized) {
    var mag = this.magnitude();
    if(mag > 0) {
      this.normalized = this.divide(mag);
    }
    this.normalized = this;
  }

  return this.normalized;
};
