var Particle = function(ShapeType, shapeOpts, position, mass) {
  this.acceleration = new Vector(0, 0);
  var dir = (Math.random() > 0.50) ? 1 : -1;
  this.velocity = new Vector(dir*(Math.random()*10), 0);
  this.position = position.get();

  this.aVelocity = 0.05;
  this.aAcceleration = Math.random();
  this.angle = Math.PI / 2;

  this.timeToLive = 1.5;
  this.mass = mass;
  this.shape = new ShapeType(shapeOpts);
  this.shape.setPosition(this.position, this.angle);
};

Particle.prototype.applyForce = function(force) {
  var f = force.get();
  this.acceleration = this.acceleration.add(f.divide(this.mass));
};

Particle.prototype.update = function() {
  this.velocity = this.velocity.add(this.acceleration);
  this.position = this.position.add(this.velocity);
  this.aVelocity += this.aAcceleration;
  this.angle += this.aVelocity;
  this.timeToLive -= 0.01;
  this.shape.setPosition(this.position, this.angle);
  this.acceleration = this.acceleration.multiply(0);
};

Particle.prototype.draw = function(ctx) {
  this.shape.draw(ctx, this.timeToLive);
};

Particle.prototype.isDead = function() {
  return (this.timeToLive < 0); // || (this.position.x > 1100 || this.position.x < 100) || (this.position.y < 0 || this.position.y > 700);
};
