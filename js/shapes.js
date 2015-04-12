var Shape = function(opts) {
  this.color = opts.color || 'rgba(100,100,100,1)';
  this.position = null;
  this.angle = null;
};

Shape.prototype.setPosition = function(position, angle) {
  this.angle = angle || 0;
  this.position = position;
};

Shape.prototype.setAlpha = function(alpha, color) {
    var colorParts = color.split(',');
    //rgba(r //g //b //a)
    colorParts[3] = alpha + ')';
    return colorParts.join(',');
};

var Rectangle = function(opts) {
  Shape.call(this, opts);
  this.h = opts.h;
  this.w = opts.w;
  // this.canvasWidth = opts.canvasWidth;
};

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;


var Triangle = function(opts) {
  Shape.call(this, opts);
  this.h = opts.h;
  this.w = opts.w;
};

Triangle.prototype = Object.create(Shape.prototype);
Triangle.prototype.constructor = Triangle;


var Circle = function(opts) {
  Shape.call(this, opts);
  this.r = opts.r || 5;
  this.endAngle = 2*Math.PI;
};

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.hit = function(x, y) {
  return (x <= this.position.x + this.r && x >= this.position.x - this.r) &&
         (y <= this.position.y + this.r && y >= this.position.y - this.r);
};


var Confetti = function(opts) {
  Shape.call(this, opts);
  this.h = opts.h;
  this.w = opts.w;
  this.canvasWidth = opts.canvasWidth;
  this.theta = utils.interpolater(0, this.canvasWidth, 0, Math.PI * 4);
};

Confetti.prototype = Object.create(Shape.prototype);
Confetti.prototype.constructor = Confetti;
