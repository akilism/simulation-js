//steering force = desired velocity - current velocity


var Vehicle = function(position, shapeType, shapeOpts) {
  this.position = position.get();
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.maxSpeed = 4;
  this.maxForce = 0.1;
  this.mass = 3;
  this.shape = new shapeType(shapeOpts);
  this.shape.setPosition(this.position);
};

Vehicle.prototype.seek = function(target) {
  var rawDesired = target.subtract(this.position);
  var normalizedDesired = rawDesired.normalize();
  var desiredVelocity = normalizedDesired.multiply(this.maxSpeed);
  var steerForce = desiredVelocity.subtract(this.velocity);
  this.applyForce(steerForce.limit(this.maxForce));
};

Vehicle.prototype.flee = function(target) {
  var rawDesired = target.subtract(this.position);
  var normalizedDesired = rawDesired.normalize();
  var desiredVelocity = normalizedDesired.multiply(-1 * this.maxSpeed);
  var steerForce = desiredVelocity.subtract(this.velocity);
  this.applyForce(steerForce.limit(this.maxForce));
};

Vehicle.prototype.applyForce = function(force) {
  this.acceleration = this.acceleration.add(force.divide(this.mass));
};

Vehicle.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
};

Vehicle.prototype.update = function() {
  var angle = Math.atan2(this.velocity.y, this.velocity.x);
  this.velocity = this.velocity.add(this.acceleration);
  // this.velocity = this.velocity.multiply(this.damping);
  this.velocity = this.velocity.limit(this.maxSpeed);
  this.position = this.position.add(this.velocity);
  this.acceleration = this.acceleration.multiply(0);
  this.shape.setPosition(this.position, angle);
};
