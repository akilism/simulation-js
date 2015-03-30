var Walker = function(width, height) {
  this.x = width/2;
  this.y = height/2;
};

Walker.prototype.display = function() {

};

Walker.prototype.walk = function() {
  // var stepX = Math.floor(Math.random()*3)-1;
  // var stepY = Math.floor(Math.random()*3)-1;

  // this.x += stepX;
  // this.y += stepY;

  var num = Math.random();
  if(num < 0.4) { this.x += 5; }
  else if(num < 0.6) { this.x -= 5; }
  else if(num < 0.8) { this.y += 5; }
  else { this.y -= 5; }
};


