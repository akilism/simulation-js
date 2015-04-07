var Oscillator = function(ShapeType, shapeOpts, angle, velocity, amplitude, initialPosition, canvasWidth, canvasHeight) {
  this.angle = angle;
  this.velocity = velocity;
  this.amplitude = amplitude;
  this.shape = new ShapeType(shapeOpts);
  this.position = initialPosition;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.shape.setPosition(this.position, this.angle);
};

Oscillator.prototype.oscillate = function() {
  this.angle = this.angle.add(this.velocity);
  this.position = new Vector(Math.sin(this.angle.x) * this.amplitude.x, Math.sin(this.angle.y) * this.amplitude.y);
  this.shape.setPosition(this.position, this.angle);
};

Oscillator.prototype.draw = function(ctx) {
  ctx.save();
  ctx.translate(this.canvasWidth/2, this.canvasHeight/2);
  this.shape.draw(ctx);
  ctx.restore();
};
