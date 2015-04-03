var Mover = function(Shape, shapeOpts, mass, initialPosition, width, height) {
  this.shape = new Shape(shapeOpts);
  this.worldWidth = width;
  this.worldHeight = height;
  this.position = initialPosition;
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.mass = mass;
  this.shape.setPosition(this.position);
};

Mover.prototype.update = function() {
  this.velocity = this.velocity.add(this.acceleration);
  this.position = this.position.add(this.velocity);
  this.acceleration = this.acceleration.multiply(0);
  this.shape.setPosition(this.position);
  this.checkEdges();
};

Mover.prototype.setNewColor = function(color) {
  this.shape.setNewColor(color);
};

Mover.prototype.checkEdges = function() {
  if (this.position.x > this.worldWidth) { this.position.x = this.worldWidth; this.velocity.x *= -1; }
  else if(this.position.x < 0) { this.position.x = 0;  this.velocity.x *= -1; }

  if(this.position.y > this.worldHeight) { this.position.y = this.worldHeight; this.velocity.y *= -1; }
  // else if(this.position.y < 0) { this.position.y = this.worldHeight; }
};

Mover.prototype.applyForce = function(force) {
  this.acceleration = this.acceleration.add(force.divide(this.mass));
};

Mover.prototype.getFriction = function(c, n) {
  return this.velocity.normalize().multiply(-1).multiply((c * n));
};

Mover.prototype.getDrag = function(c, p) {
  var dragMagnitude = c * Math.pow(this.velocity.magnitude(), 2);
  var drag = this.velocity.normalize().multiply(-1);
  return drag.multiply(dragMagnitude);
};

Mover.prototype.gravitationalForceOf = function(other) {
  var G = 1;
  var d = this.position.subtract(other.position);
  var distance = d.magnitude();
  var force = d.normalize();
  var strength = (G * this.mass * other.mass) / (distance * distance);
  return force.multiply(strength);
};

Mover.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
};

Mover.prototype.stopForce = function() {
  return new Vector(this.velocity.x * -1, this.velocity.y * -1);
};
