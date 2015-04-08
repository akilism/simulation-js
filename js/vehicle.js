var interpolater = (function(currMin, currMax, otherMin, otherMax) {
  var left = currMax - currMin;
  var right = otherMax - otherMin;

  var scale = right / left;

  var getVal = function(val) {
    return otherMin + (val - currMin) * scale;
  };

  return getVal;
});

var Vehicle = function(position, shapeType, shapeOpts) {
  this.position = position.get();
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.maxSpeed = 4;
  this.maxForce = 0.1;
  this.w = (shapeOpts.w) ? shapeOpts.w : shapeOpts.r;
  this.h = (shapeOpts.h) ? shapeOpts.h : shapeOpts.r;
  this.shape = new shapeType(shapeOpts);
  this.shape.setPosition(this.position);
};

Vehicle.prototype.applyForce = function(force) {
  this.acceleration = this.acceleration.add(force);
};

Vehicle.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
};

Vehicle.prototype.update = function() {
  var angle = Math.atan2(this.velocity.y, this.velocity.x);
  this.velocity = this.velocity.add(this.acceleration);
  this.velocity = this.velocity.limit(this.maxSpeed);
  this.position = this.position.add(this.velocity);
  this.acceleration = this.acceleration.multiply(0);
  this.shape.setPosition(this.position, angle);
};

Vehicle.prototype.seek = function(target) {
  var rawDesired = target.subtract(this.position);
  var d = rawDesired.magnitude();
  var normalizedDesired = rawDesired.normalize();
  var desiredVelocity;
  if(d < 100) {
    //scale the velocity down depending on distance to target.
    var vScaler = interpolater(0, 100, 0, this.maxSpeed);
    desiredVelocity = normalizedDesired.multiply(vScaler(d));
  } else{
    desiredVelocity = normalizedDesired.multiply(this.maxSpeed);
  }
  var steerForce = desiredVelocity.subtract(this.velocity);
  this.applyForce(steerForce.limit(this.maxForce));
};

Vehicle.prototype.flee = function(target) {
  var rawDesired = target.subtract(this.position);
  var d = rawDesired.magnitude();
  var normalizedDesired = rawDesired.normalize();
  if(d > 100) {
    //scale the velocity down depending on distance from target.
    var vScaler = interpolater(100, 500, this.maxSpeed, 0);
    desiredVelocity = normalizedDesired.multiply(-1 * vScaler(d));
  } else{
    desiredVelocity = normalizedDesired.multiply(-1 * this.maxSpeed);
  }
  var steerForce = desiredVelocity.subtract(this.velocity);
  this.applyForce(steerForce.limit(this.maxForce));
};

Vehicle.prototype.wander = function(l, r) {

};

