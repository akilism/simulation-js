var Boid = function(position, shapeType, shapeOpts) {
  Vehicle.call(this, position, shapeType, shapeOpts);
  this.latticeRes = 100;
};

Boid.prototype = Object.create(Vehicle.prototype);
Boid.prototype.constructor = Boid;


Boid.prototype.flock = function(boids) {
  if(!boids) { return; }
  var separationForce = this.separate(boids);
  var alignmentForce = this.align(boids, this.latticeRes);
  var cohesionForce = this.cohesion(boids, this.latticeRes);

  separationForce = separationForce.multiply(1.5);

  this.applyForce(separationForce);
  this.applyForce(alignmentForce);
  this.applyForce(cohesionForce);
};

Boid.prototype.gridPosition = function() {
  return new Vector(Math.floor(this.position.x / this.latticeRes), Math.floor(this.position.y / this.latticeRes));
};
