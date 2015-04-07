var Mover = function(ShapeType, shapeOpts, mass, G, initialPosition, width, height) {
  this.shape = new ShapeType(shapeOpts);
  this.worldWidth = width;
  this.worldHeight = height;
  this.position = initialPosition;
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.mass = mass;
  this.G = G;
  this.shape.setPosition(this.position);
};

Mover.prototype.update = function() {
  var angle = Math.atan2(this.velocity.y, this.velocity.x);
  this.velocity = this.velocity.add(this.acceleration);
  // this.velocity = this.velocity.limit(50);
  this.position = this.position.add(this.velocity);
  this.acceleration = this.acceleration.multiply(0);
  this.shape.setPosition(this.position, angle);
  this.checkEdges();
};

Mover.prototype.checkEdges = function() {
  if (this.position.x > this.worldWidth) { this.position.x = this.worldWidth; this.velocity.x *= -1; }
  else if(this.position.x < 0) { this.position.x = 0;  this.velocity.x *= -1; }

  if(this.position.y > this.worldHeight) { this.position.y = this.worldHeight; this.velocity.y *= -1; }
  else if(this.position.y < -1000) { this.position.y = 0; this.velocity.y *= -1; }
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

Mover.prototype.comeHere = function(other) {
  var d = this.position.subtract(other.position);
  var distance = d.magnitude();
  distance = Math.min(distance, 250);
  distance = Math.max(distance, 10);
  var force = d.normalize();

  var strength = (this.G * this.mass * other.mass) / (distance * distance);
  return (distance === 0) ? force.multiply(1) : force.multiply(strength);
};

Mover.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
};

Mover.prototype.stopForce = function() {
  return new Vector(this.velocity.x * -1, this.velocity.y * -1);
};
