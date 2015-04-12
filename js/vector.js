var Vector = function(x, y) {
  this.x = x;
  this.y = y;
  this.mag = null;
  this.magSquared = null;
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

Vector.prototype.magnitudeSquared = function() {
  if(this.magSquared === null) { this.magSquared = (this.x * this.x) + (this.y * this.y); }
  return this.magSquared;
};

Vector.prototype.magnitude = function() {
  if(this.mag === null) { this.mag = Math.sqrt(this.magnitudeSquared()); }
  return this.mag;
};

Vector.prototype.normalize = function() {
  if(this.normalized === null) {
    var mag = this.magnitude();
    if(mag > 0) {
      this.normalized = this.divide(mag);
    } else {
      this.normalized = this.get();
    }
  }

  return this.normalized.get();
};

Vector.prototype.distanceSquared = function(other) {
  return (this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y);
};

Vector.prototype.distance = function(other) {
  return Math.sqrt(this.distanceSquared(other));
};

Vector.prototype.limit = function(max) {
  if(this.magnitude() > max) {
    var norm = this.normalize();
    return norm.multiply(max);
  }
  return new Vector(this.x, this.y);
};

Vector.prototype.dotProduct = function(other) {
  return (this.x * other.x) + (this.y * other.y);
};

Vector.prototype.angleBetween = function(other) {
  return Math.acos(this.dotProduct(other) / (this.magnitude() * other.magnitude()));
};

Vector.prototype.get = function() {
  return new Vector(this.x, this.y);
};
