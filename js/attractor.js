var Attractor = function(ShapeType, shapeOpts, mass, G, initialPosition) {
  this.shape = new ShapeType(shapeOpts);
  this.position = initialPosition;
  this.mass = mass;
  this.G = G;
  this.shape.setPosition(this.position);
};

Attractor.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
};

Attractor.prototype.comeToMe = function(mover) {
  var d = this.position.subtract(mover.position);
  var distance = d.magnitude();
  distance = Math.min(distance, 2500);
  distance = Math.max(distance, 5);
  var force = d.normalize();
  var strength = (this.G * this.mass * mover.mass) / (distance * distance);
  return force.multiply(strength);
};
