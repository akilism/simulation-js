var Repeller = function(Shape, shapeOpts, mass, G, initialPosition) {
  this.shape = new Shape(shapeOpts);
  this.position = initialPosition;
  this.mass = mass;
  this.G = G;
  this.dir = 1;
  this.shape.setPosition(this.position);
};

Repeller.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
};

Repeller.prototype.update = function(canvasWidth) {
  if (this.position.x > canvasWidth / 2 + 20) {
    this.dir = -1;
  }

  if (this.position.x < canvasWidth / 2 - 120) {
    this.dir = 1;
  }
  this.position = this.position.add(new Vector(this.dir, 0));

  this.shape.setPosition(this.position);
};

Repeller.prototype.goAway = function(mover) {
  var d = this.position.subtract(mover.position);
  var distance = d.magnitude();
  distance = Math.min(distance, 2500);
  distance = Math.max(distance, 5);
  var force = d.normalize();
  var strength = -1 * (this.G * this.mass * mover.mass) / (distance * distance);
  return force.multiply(strength);
};
