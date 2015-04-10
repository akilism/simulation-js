var interpolater = (function(currMin, currMax, otherMin, otherMax) {
  var left = currMax - currMin;
  var right = otherMax - otherMin;

  var scale = right / left;

  var getVal = function(val) {
    return otherMin + (val - currMin) * scale;
  };

  return getVal;
});

var Vehicle = function(position, shapeType, shapeOpts) {
  this.position = position.get();
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.maxSpeed = 3;
  this.maxForce = 0.1;
  this.w = (shapeOpts.w) ? shapeOpts.w : shapeOpts.r;
  this.h = (shapeOpts.h) ? shapeOpts.h : shapeOpts.r;
  this.shape = new shapeType(shapeOpts);
  this.shape.setPosition(this.position);
  this.futurePosition = null;
  this.theta = null;
  this.l = null;
  this.r = null;
  this.normalPoint = null;
  this.predictPos = null;
  this.startPredict = null;
  this.startEnd = null;
  this.path = null;
};

Vehicle.prototype.applyForce = function(force) {
  this.acceleration = this.acceleration.add(force);
};

Vehicle.prototype.draw = function(ctx) {
  this.shape.draw(ctx);
  // this.drawWanderer(ctx);
  // this.drawPathFollow(ctx);
};

Vehicle.prototype.drawWanderer = function(ctx) {
  if(this.l) {
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.futurePosition.x, this.futurePosition.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.futurePosition.x, this.futurePosition.y, this.r, 0, Math.PI*2, false);
    ctx.stroke();

    var x = (this.r * Math.cos(this.theta)) + this.futurePosition.x;
    var y = (this.r * Math.sin(this.theta)) + this.futurePosition.y;
    ctx.beginPath();
    ctx.moveTo(this.futurePosition.x, this.futurePosition.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI*2, false);
    ctx.fill();
    ctx.stroke();
  }
};

Vehicle.prototype.drawPathFollow = function(ctx) {
    // ctx.beginPath();
    // ctx.moveTo(this.position.x, this.position.y);
    // ctx.lineTo(this.futurePosition.x, this.futurePosition.y);
    // ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.predictPos.x, this.predictPos.y, 2, 0, Math.PI*2, false);
      ctx.fill();
      ctx.stroke();

      // ctx.beginPath();
      // ctx.moveTo(this.predictPos.x, this.predictPos.y);
      // ctx.lineTo(this.path.start.x, this.path.start.y);
      // ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.normalPoint.x, this.normalPoint.y, 2, 0, Math.PI*2, false);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.predictPos.x, this.predictPos.y);
      ctx.lineTo(this.normalPoint.x, this.normalPoint.y);
      ctx.stroke();
};

Vehicle.prototype.update = function() {
  var angle = Math.atan2(this.velocity.y, this.velocity.x);
  this.velocity = this.velocity.add(this.acceleration);
  this.velocity = this.velocity.limit(this.maxSpeed);
  this.position = this.position.add(this.velocity);
  this.acceleration = this.acceleration.multiply(0);
  this.shape.setPosition(this.position, angle);
};

Vehicle.prototype.follow = function(desired) {
  var dVel = desired.multiply(this.maxSpeed);
  var steerForce = dVel.subtract(this.velocity);
  this.applyForce(steerForce);
};

Vehicle.prototype.seek = function(target) {
  var rawDesired = target.subtract(this.position);
  var d = rawDesired.magnitude();
  var normalizedDesired = rawDesired.normalize();
  var desiredVelocity;
  if(d < 100) {
    //scale the velocity down depending on distance to target.
    var vScaler = interpolater(0, 100, 0, this.maxSpeed);
    desiredVelocity = normalizedDesired.multiply(vScaler(d));
  } else{
    desiredVelocity = normalizedDesired.multiply(this.maxSpeed);
  }
  var steerForce = desiredVelocity.subtract(this.velocity);
  this.applyForce(steerForce.limit(this.maxForce));
};

Vehicle.prototype.flee = function(target) {
  var rawDesired = target.subtract(this.position);
  var d = rawDesired.magnitude();
  var normalizedDesired = rawDesired.normalize();
  if(d > 100) {
    //scale the velocity down depending on distance from target.
    var vScaler = interpolater(100, 500, this.maxSpeed, 0);
    desiredVelocity = normalizedDesired.multiply(-1 * vScaler(d));
  } else{
    desiredVelocity = normalizedDesired.multiply(-1 * this.maxSpeed);
  }
  var steerForce = desiredVelocity.subtract(this.velocity);
  this.applyForce(steerForce.limit(this.maxForce));
};

Vehicle.prototype.wander = function(l, r, counter) {
  this.r = r;
  this.l = l;
  var p = this.velocity.get().normalize().multiply(l);
  this.futurePosition = this.position.add(p);
  if(!this.theta || Math.random() > 0.90) {
    this.theta = Math.random() * 360;
  } else {
    // this.theta += 0.01;
  }
  var x = (r * Math.cos(this.theta)) + this.futurePosition.x;
  var y = (r * Math.sin(this.theta)) + this.futurePosition.y;

  return new Vector(x, y);
};

Vehicle.prototype.stayInBounds = function(wSize, canvasWidth, canvasHeight) {
  var desired, steer, sum = new Vector(0, 0), count = 0;

  if(this.position.x <= wSize) {
    desired = new Vector(this.maxSpeed, this.velocity.y);
    steer = desired.subtract(this.velocity);
    steer = steer.limit(this.maxForce);
    sum = sum.add(steer);
    count++;
  }

  if(this.position.x >= canvasWidth - wSize) {
    desired = new Vector(-this.maxSpeed, this.velocity.y);
    steer = desired.subtract(this.velocity);
    steer = steer.limit(this.maxForce);
    sum = sum.add(steer);
    count++;
  }

  if(this.position.y <= wSize) {
    desired = new Vector(this.velocity.x, this.maxSpeed);
    steer = desired.subtract(this.velocity);
    steer = steer.limit(this.maxForce);
    sum = sum.add(steer);
    count++;
  }

  if(this.position.y >= canvasHeight - wSize) {
    desired = new Vector(this.velocity.x, -this.maxSpeed);
    steer = desired.subtract(this.velocity);
    steer = steer.limit(this.maxForce);
    sum = sum.add(steer);
    count++;
  }

  if(count) {
    var avg = sum.divide(count);
    steer = avg.subtract(this.velocity);
    this.applyForce(steer);
  }
};

Vehicle.prototype.followPath = function(path) {
  // debugger;
  this.path = path;
  var predict = this.velocity.get().normalize().multiply(this.h + 25);
  this.predictPos = this.position.add(predict);

  this.startPredict = this.predictPos.subtract(path.start);
  this.startEnd = path.end.subtract(path.start);
  var theta = this.startPredict.angleBetween(this.startEnd);
  var startNormal = this.startPredict.magnitude() * Math.cos(theta);
  this.normalPoint = path.start.add(this.startEnd.normalize().multiply(startNormal));
  //can use dot product because we normalize startEnd. scalar projection.
  // this.normalPoint = path.start.add(this.startEnd.normalize().multiply(this.startPredict.dotProduct(this.startEnd)));
  var distance = this.predictPos.distance(this.normalPoint);
  if(distance > path.r - 5) {  //seek 25 pixels in front of normal point.
    var scale = this.startEnd.normalize().multiply(25);
    this.seek(this.normalPoint.add(scale));
  }
};

Vehicle.prototype.followPathSegments = function(path) {
  var target;
  var shortest = Infinity;
  var predict = this.velocity.get().normalize().multiply(this.h + 25);
  this.predictPos = this.position.add(predict);

  for(var i = 1; i < path.points.length; i++) {
    var a = path.points[i-1].get();
    var b = path.points[i].get();
    var normalPoint = this.getNormalPoint(this.predictPos, a, b);

    if(normalPoint.x < a.x || normalPoint.x > b.x) {
      normalPoint = b.get();
    }

    var distance = this.predictPos.distance(normalPoint);

    if (distance < shortest) {
      shortest = distance;
      target = normalPoint.get();
    }
  }

  this.normalPoint = target;
  this.seek(target);
};

Vehicle.prototype.getNormalPoint = function(predictPos, a, b) {
  var startPredict = predictPos.subtract(a);
  var startEnd = b.subtract(a);
  var theta = startPredict.angleBetween(startEnd);
  var startNormal = startPredict.magnitude() * Math.cos(theta);
  var normalPoint = a.add(startEnd.normalize().multiply(startNormal));
  //can use dot product because we normalize startEnd. scalar projection.
  // normalPoint = a.add(startEnd.normalize().multiply(startPredict.dotProduct(startEnd)));
  return normalPoint;
};

Vehicle.prototype.group = function(vehicles) {
  var desiredCohesion = (this.shape.r) ? this.shape.r * 2 : this.shape.w * 2;
  var count = 0;
  var vehicle = this;

  var sum = vehicles.map(function(otherVehicle) {
    var dist = vehicle.position.distance(otherVehicle.position);

    if (dist > desiredCohesion) {
      var diff = vehicle.position.subtract(otherVehicle.position).multiply(-1);
      return diff.normalize().divide(dist);
    }

    return false;
  }).filter(function(diff) {
    return (diff);
  }).reduce(function(sum, curr, i) {
    count++;
    return sum.add(curr);
  }, new Vector(0, 0));

  if(count > 0) {
    var avg = sum.divide(count);
    var steer = avg.normalize().multiply(this.maxSpeed).add(this.velocity);
    steer = steer.limit(this.maxForce);
    this.applyForce(steer);
  }
};

Vehicle.prototype.separate = function(vehicles) {
  var desiredSeparation = (this.shape.r) ? this.shape.r * 3 : this.shape.w * 3;
  var count = 0;
  var vehicle = this;

  var sum = vehicles.map(function(otherVehicle) {
    var dist = vehicle.position.distance(otherVehicle.position);

    if ((dist > 0) && (dist < desiredSeparation)) {
      var diff = vehicle.position.subtract(otherVehicle.position);
      return diff.normalize().divide(dist);
    }

    return false;
  }).filter(function(diff) {
    return (diff);
  }).reduce(function(sum, curr, i) {
    count++;
    return sum.add(curr);
  }, new Vector(0, 0));

  if(count > 0) {
    var avg = sum.divide(count);
    var steer = avg.normalize().multiply(this.maxSpeed).subtract(this.velocity);
    steer = steer.limit(this.maxForce);
    this.applyForce(steer);
  }
};

