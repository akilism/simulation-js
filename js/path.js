var Path = function(r) {
  this.r = r;
  this.points = [];
};

Path.prototype.draw = function(ctx) {
  var start, end;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.lineWidth = this.r * 2;
  ctx.strokeStyle = 'gray';
  for(var i = 1; i < this.points.length; i +=1) {
    start = this.points[i-1];
    end = this.points[i];
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
  }
  ctx.stroke();

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  for(var i = 1; i < this.points.length; i +=1) {
    start = this.points[i-1];
    end = this.points[i];
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
  }

  ctx.stroke();
};

Path.prototype.addPoint = function(point) {
  this.points.push(point);
};

