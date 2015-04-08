var interpolater = (function(currMin, currMax, otherMin, otherMax) {
  var left = currMax - currMin;
  var right = otherMax - otherMin;

  var scale = right / left;

  var getVal = function(val) {
    return otherMin + (val - currMin) * scale;
  };

  return getVal;
});

var Shape = function(opts) {
  this.color = opts.color || 'rgba(100,100,100,1)';
  this.position = null;
  this.angle = null;
};

Shape.prototype.setPosition = function(position, angle) {
  this.angle = angle || 0;
  this.position = position.get();
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

Rectangle.prototype.draw = function(ctx, alpha) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.angle);
  ctx.fillStyle = (alpha) ? this.setAlpha(alpha, this.color) : this.color;
  ctx.fillRect(0, 0, this.w, this.h);
  ctx.restore();
};


var Triangle = function(opts) {
  Shape.call(this, opts);
  this.h = opts.h;
  this.w = opts.w;
};

Triangle.prototype = Object.create(Shape.prototype);
Triangle.prototype.constructor = Triangle;

Triangle.prototype.draw = function(ctx, alpha) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.angle - Math.PI/2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.w/2, this.h);
  ctx.lineTo(this.w, 0);
  ctx.closePath();
  ctx.fillStyle = (alpha) ? this.setAlpha(alpha, this.color) : this.color;
  ctx.stroke();
  ctx.restore();
};

var Circle = function(opts) {
  Shape.call(this, opts);
  this.r = opts.r || 5;
  this.endAngle = 2*Math.PI;
};

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.draw2 = function(ctx, alpha) {
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.r, 0, this.endAngle, false);
  ctx.fillStyle = (alpha) ? this.setAlpha(alpha, this.color) : this.color;
  ctx.fill();
};

Circle.prototype.draw = function(ctx, alpha) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.angle);
  ctx.beginPath();
  ctx.arc(0, 0, this.r, 0, this.endAngle, false);
  ctx.fillStyle = (alpha) ? this.setAlpha(alpha, this.color) : this.color;
  ctx.fill();
  ctx.restore();
};

Circle.prototype.hit = function(x, y) {
  return (x <= this.position.x + this.r && x >= this.position.x - this.r) &&
         (y <= this.position.y + this.r && y >= this.position.y - this.r);
};


var Confetti = function(opts) {
  Shape.call(this, opts);
  this.h = opts.h;
  this.w = opts.w;
  this.canvasWidth = opts.canvasWidth;
  this.theta = interpolater(0, this.canvasWidth, 0, Math.PI * 4);
};

Confetti.prototype = Object.create(Shape.prototype);
Confetti.prototype.constructor = Confetti;

Confetti.prototype.draw = function(ctx, alpha) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  var angle = this.theta(this.position.y);
  ctx.rotate(angle);
  ctx.fillStyle = (alpha) ? this.setAlpha(alpha, this.color) : this.color;
  ctx.fillRect(0, 0, this.w, this.h);
  ctx.restore();
};
