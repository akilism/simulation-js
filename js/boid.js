var Boid = function(position, shapeType, shapeOpts) {
  Vehicle.call(this, position, shapeType, shapeOpts);
};

Boid.prototype = Object.create(Vehicle.prototype);
Boid.prototype.constructor = Boid;
