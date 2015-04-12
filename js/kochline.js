var KochLine = function(start, end) {
  this.start = start;
  this.end = end;
};

KochLine.prototype.getNextLines = function() {
  var a = this.kochPoint('a');
  var b = this.kochPoint('b');
  var c = this.kochPoint('c');
  var d = this.kochPoint('d');
  var e = this.kochPoint('e');
  return [new KochLine(a, b), new KochLine(b, c), new KochLine(c, d), new KochLine(d, e)];
};

KochLine.prototype.kochPoint = function(point) {
  if(point === 'a') { return this.start.get(); }
  if(point === 'b') { return this.getKochPointB(); }
  if(point === 'c') { return this.getKochPointC(); }
  if(point === 'd') { return this.getKochPointD(); }
  if(point === 'e') { return this.end.get(); }
};

//1/3 of the way from the start of the line.
KochLine.prototype.getKochPointB = function() {
  var v = this.end.subtract(this.start).divide(3);
  return v.add(this.start);
};

//move 1/3 of the way from the start of the line
//rotate up 60 degrees
KochLine.prototype.getKochPointC = function() {
  var a = this.start.get();
  var v = this.end.subtract(this.start).divide(3);
  a = a.add(v);
  // v = v.rotate(-utils.radians(60));
  return a.add(v.rotate(-utils.radians(60)));
};

//1/3 of the way from the end of the line.
KochLine.prototype.getKochPointD = function() {
  var v = this.end.subtract(this.start).multiply(2/3);
  return v.add(this.start);
};
