var Boid = function(position, shapeType, shapeOpts) {
  Vehicle.call(this, position, shapeType, shapeOpts);
  this.latticeRes = 35;
};

Boid.prototype = Object.create(Vehicle.prototype);
Boid.prototype.constructor = Boid;


Boid.prototype.flock = function(boids) {
  if(!boids) { return; }
  var separationForce = this.separate(boids);
  var alignmentForce = this.align(boids, this.latticeRes);
  var cohesionForce = this.cohesion(boids, this.latticeRes);

  // alignmentForce = alignmentForce.multiply(0.5);
  // cohesionForce = cohesionForce.multiply(0.5);
  separationForce = separationForce.multiply(1.5);

  this.applyForce(separationForce);
  this.applyForce(alignmentForce);
  this.applyForce(cohesionForce);
  cohesionForce = null; separationForce = null; alignmentForce = null;
};

Boid.prototype.wrap = function(canvasWidth, canvasHeight) {
  if(this.position.x > canvasWidth) { this.position.x = 0; }
  if(this.position.x < 0) { this.position.x = canvasWidth; }
  if(this.position.y > canvasHeight) { this.position.y = 0; }
  if(this.position.y < 0) { this.position.y = canvasHeight; }
};

Boid.prototype.gridPosition = function() {
  return new Vector(Math.floor(this.position.x / this.latticeRes), Math.floor(this.position.y / this.latticeRes));
};
