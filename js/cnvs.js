var cnvs = (function() {
  var canvas,
    ctx,
    isCanvasEnabled,
    drawPending,
    canvasHeight,
    canvasWidth,
    time = 0,
    counter = 0,
    movers = [],
    oscillators = [],
    attractors = [],
    repellers = [],
    particleSystems = [],
    basicShapes = [],
    waves = [],
    pendulums = [],
    springs = [],
    vehicles = [],
    boids = [],
    boidGrid = [],
    clickX,
    clickY,
    moveX,
    moveY,
    xScaler,
    yScaler,
    rScaler,
    alphaScaler,
    flowField,
    path,
    tx = 0,
    ty = 10000,
    mouseClicked = false;

  var setCanvas = function(can) {
    canvas = can;
    if(canvas.getContext) {
      ctx = canvas.getContext('2d');
      canvasHeight = canvas.height;
      canvasWidth = canvas.width;
      isCanvasEnabled = true;
      // canvas.addEventListener('click', onClick);
      // canvas.addEventListener('mousemove', onMouseMove);
      xScaler = utils.interpolater(0, 1, 0, 600);
      yScaler = utils.interpolater(0, 1, 0, 600);
      rScaler = utils.interpolater(10, 50, Math.min(75, canvasWidth/8), Math.max(15, canvasWidth/24));
      alphaScaler = utils.interpolater(0, 1, 0, 255);
      // addParticleSystem(canvasWidth/2, canvasHeight/2);
      // addRepeller();
      // addOscillator();
      // addMover();
      // addCircle();
      // addPendulum();
      // addWave();
      // addSpring();
      // addPath(30);
      // flowField = new FlowField(canvasWidth, canvasHeight);
      for(var i = 0; i < 300; i++) {
        var x = Math.random() * canvasWidth;
        var y = Math.random() * canvasHeight;
        addBoid(x, y);
        // addVehicle(x, y);
      }
    } else {
      isCanvasEnabled = false;
    }
  };

  var getColor = function(isBlack) {
      var r = Math.floor(Math.random() * 256),
      g = Math.floor(Math.random() * 256),
      b = Math.floor(Math.random() * 256),
      a = Math.random();
      if(isBlack) {
        r = 0; g = 0; b = 0;
        a = 1;
      }
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };

  var r = 175;
  var theta = 0;
  var polarUpdate = function(shape) {
    var x = (r * Math.cos(theta)) + (canvasWidth/2);
    var y = (r * Math.sin(theta)) + (canvasHeight/2);
    var position = new Vector(x, y);
    shape.setPosition(position);
    theta += 0.1;
  };

  var harmonicUpdate = function(shape) {
    var amplitude = 300;
    var period = 240;
    var x = amplitude * Math.cos((Math.PI * 2) * counter / period);
    var position = new Vector(x+canvasWidth/2, canvasHeight/2);
    shape.setPosition(position);
  };

  var waveMaker = function(angleVel, amplitude, yOffset) {

    var startAngle = 0;
    var draw = function(ctx) {
      var angle = startAngle;
      for(var x = -32; x <= canvasWidth+32; x += 12) {
        var y = amplitude * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y+yOffset, 24, 0, 2*Math.PI, false);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.stroke();
        ctx.fill();
        angle += angleVel;
      }
      startAngle += 0.01;
    };

    return {
      draw:draw
    };
  };

  var pendulumMaker = function() {
    var origin = new Vector(canvasWidth/2, 40);
    var armLength = Math.max(64, Math.floor(Math.random() * 200));
    var angle =  Math.PI / 2;
    var aVelocity = 0.0;
    var aAcceleration = 0.0;
    var damping = 0.995;
    var newPosition = null;

    var setNewPosition = function() {
      var position = new Vector(armLength * Math.sin(angle), armLength * Math.cos(angle));
      newPosition = position.add(origin);
    };

    var update = function() {
      var gravity = 0.4;
      aAcceleration = (-1 * gravity / armLength) * Math.sin(angle);
      aVelocity += aAcceleration;
      aVelocity = Math.min(1.5, aVelocity);
      angle += aVelocity;
      // aVelocity = damping * aVelocity;
    };

    var drawArm = function(ctx, position) {
      ctx.beginPath();
      ctx.moveTo(position.origin.x, position.origin.y);
      ctx.lineTo(position.new.x, position.new.y);
      ctx.stroke();
    };

    var drawBob = function(ctx, position) {
      ctx.beginPath();
      ctx.arc(position.x, position.y, 24, 0, 2*Math.PI, false);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.stroke();
      ctx.fill();
    };

    var draw = function(ctx) {
      drawArm(ctx, {origin: origin, new: newPosition});
      drawBob(ctx, newPosition);
      setNewPosition();
    };

    setNewPosition();
    return {
      draw:draw,
      update:update,
      getNewPostion: function () { return newPosition.get(); },
      setOrigin: function(o) { origin = o.get(); }
    };
  };

  var springMaker = function(ctx) {
    var Spring = function(x, y, l, ctx) {
      this.anchor = new Vector(x, y);
      this.restLength = l;
      this.k = 0.1; //how rigid is this spring?
      this.ctx = ctx;
    };

    Spring.prototype.connect = function(bob) {
      var force = bob.position.subtract(this.anchor);
      var currentLength = force.magnitude();
      var x = currentLength - this.restLength;
      var normForce = force.normalize();
      return normForce.multiply(-1 * this.k * x);
    };

    Spring.prototype.draw = function(bobPos) {
      this.ctx.fillStyle = 'rgba(0,0,0,1)';
      this.ctx.fillRect(this.anchor.x-5, this.anchor.y-5, 10, 10);
      this.ctx.beginPath();
      this.ctx.moveTo(this.anchor.x, this.anchor.y);
      this.ctx.lineTo(bobPos.x, bobPos.y);
      this.ctx.stroke();
    };


    var spring = new Spring(canvasWidth/2, 40, 240, ctx);

    var bob = new Mover(Circle,
      {r: 25 , color: getColor(true), ctx: ctx},
      12,
      0.01,
      new Vector(canvasWidth/2, 40),
      canvasWidth,
      canvasHeight);

    var update = function() {
      var gravity = new Vector(0, 0.1);
      bob.applyForce(gravity);

      var springForce = spring.connect(bob);
      bob.applyForce(springForce);
      bob.update();
    };

    var draw = function() {
      bob.draw();
      spring.draw(bob.position);
    };

    return {
      draw:draw,
      update:update
    };
  };

  var addCircle = function() {
    basicShapes.push({ update: polarUpdate,
      shape: new Circle({ r: 50, color: getColor(), ctx: ctx })});
    basicShapes[basicShapes.length-1].shape.setPosition(new Vector(canvasWidth/2, canvasHeight/2), 0);
  };

  var addAttractor = function() {
    var mass = 50;
    attractors.push(new Attractor(Circle,
      {r: mass, color: '#00FF00', ctx: ctx},
      mass,
      10,
      new Vector(canvasWidth/2, canvasHeight-100)
    ));
  };

  var addOscillator = function() {
    var angle = new Vector(0, 0);
    var amplitude = new Vector(Math.random() * canvasWidth/2, Math.random() * canvasHeight/2);
    var vX = (Math.random > 0.5) ? -Math.min(0.05, Math.random()) : Math.min(0.05, Math.random());
    var vY = (Math.random > 0.5) ? -Math.min(0.05, Math.random()) : Math.min(0.05, Math.random());
    var velocity = new Vector(vX, vY);
    oscillators.push(new Oscillator(Circle,
      {r: 25, color: getColor(true), ctx: ctx},
      angle,
      velocity,
      amplitude,
      new Vector(canvasWidth/2, canvasHeight/2),
      canvasWidth, canvasHeight
    ));
  };

  var addRepeller = function() {
    var mass = 40;
    repellers.push(new Repeller(Circle,
      {r: mass, color: 'rgba(140, 140, 0, .5)', ctx: ctx},
      mass,
      1,
      new Vector(canvasWidth/2, canvasHeight/2)
    ));
  };

  var addMover = function() {
    var mass = Math.max(10, Math.round(Math.random() * 25));
    // Circle,
    //   {r: rScaler(mass) , color: getColor(true)}
    // Mover(Rectangle,
    //   {w: 30, h: 15, color: getColor(true)}
    movers.push(new Mover(Circle,
      {r: mass , color: getColor(true), ctx: ctx},
      mass,
      0.1,
      new Vector(Math.random() * canvasWidth,
      Math.random() * canvasHeight),
      canvasWidth,
      canvasHeight));
  };

  var addWave = function() {
    waves.push(waveMaker(0.15, canvasHeight/4, canvasHeight/2));
  };

  var addParticleSystem = function(x, y) {
    particleSystems.push(new ParticleSystem(
      new Vector(x, y),
      canvasWidth,
      canvasHeight,
      ctx));
  };

  var addPendulum = function () {
    pendulums.push(pendulumMaker());
  };

  var addSpring = function() {
    springs.push(springMaker(ctx));
  };

  var addVehicle = function(xOff, yOff) {
    var x = (xOff) ? canvasWidth/2 + xOff : canvasWidth/2;
    var y = (yOff) ? canvasHeight/2 + yOff : canvasHeight/2;
    // Triangle,
    //   {w: 15, h:30, color: getColor(true)}
    vehicles.push(new Vehicle(
      new Vector(x, y),
      Circle,
      {r: 5, color: getColor(true), ctx: ctx}
    ));
  };

  var addBoid = function(x, y) {
    boids.push(new Boid(
      new Vector(x, y),
      Triangle,
      {w: 5, h:15, color: getColor(true), ctx:ctx}
    ));
  };

  var addPath = function(r) {
    path = new Path(r, ctx);
    path.addPoint(new Vector(30, 930));
    path.addPoint(new Vector(430, 430));
    path.addPoint(new Vector(630, 490));
    path.addPoint(new Vector(740, 220));
  };

  var tick = function(delta) {
    update(delta);
    redraw();
  };

  var render = function() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // drawMousePos();
    particleSystems.forEach(function(particleSystem) { particleSystem.draw(ctx); });
    repellers.forEach(function(repeller) { repeller.draw(ctx); });
    attractors.forEach(function(attractor) { attractor.draw(ctx); });
    movers.forEach(function(mover) { mover.draw(ctx); });
    oscillators.forEach(function(oscillator) { oscillator.draw(ctx); });
    basicShapes.forEach(function(shape) { shape.shape.draw(ctx); });
    waves.forEach(function(wave) { wave.draw(ctx); });
    pendulums.forEach(function(pendulum) { pendulum.draw(ctx); });
    springs.forEach(function(spring) { spring.draw(ctx); });
    if(path) { path.draw(); }
    vehicles.forEach(function(vehicle) { vehicle.draw(ctx); });
    // boids.forEach(function(boid) {
    //   //bi-lattice subdivision.
    //   //store all boids in a [x][y] grid
    //   var gridPos = boid.gridPosition();
    //   if(!boidGrid[gridPos.x]) { boidGrid[gridPos.x] = []; }
    //   if(!boidGrid[gridPos.x][gridPos.y]) { boidGrid[gridPos.x][gridPos.y] = []; }
    //   boidGrid[gridPos.x][gridPos.y].push(boid);
    //   boid.draw(ctx);
    // });
    drawBoids();
    counter++;
  };

  var drawBoids = function() {
    boids.forEach(function(boid) {
      //bi-lattice subdivision.
      //store all boids in a [x][y] grid
      var gridPos = boid.gridPosition();
      if(!boidGrid[gridPos.x]) { boidGrid[gridPos.x] = []; }
      if(!boidGrid[gridPos.x][gridPos.y]) { boidGrid[gridPos.x][gridPos.y] = []; }
      boidGrid[gridPos.x][gridPos.y].push(boid);
      drawBoid(boid);
    });
  };

  var drawBoid = function(boid) {
    if (boid.shape instanceof Circle) { drawCircle(boid); }
    else if (boid.shape instanceof Confetti) { drawConfetti(boid); }
    else if (boid.shape instanceof Rectangle) { drawRectangle(boid); }
    else if (boid.shape instanceof Triangle) { drawTriangle(boid); }
  };

  var drawCircle = function(body) {
    ctx.save();
    ctx.translate(body.shape.position.x, body.shape.position.y);
    ctx.rotate(body.shape.angle);
    ctx.beginPath();
    ctx.arc(0, 0, body.shape.r, 0, body.shape.endAngle, false);
    ctx.fillStyle = (body.timeToLive) ? body.shape.setAlpha(body.timeToLive, body.shape.color) : body.shape.color;
    ctx.fill();
    ctx.restore();
  };

  var drawConfetti = function(body) {
    ctx.save();
    ctx.translate(body.shape.position.x, body.shape.position.y);
    var angle = body.shape.theta(body.shape.position.y);
    ctx.rotate(angle);
    ctx.fillStyle = (body.timeToLive) ? body.shape.setAlpha(body.timeToLive, body.shape.color) : body.shape.color;
    ctx.fillRect(0, 0, body.shape.w, body.shape.h);
    ctx.restore();
  };

  var drawRectangle = function(body) {
    ctx.save();
    ctx.translate(body.shape.position.x, body.shape.position.y);
    ctx.rotate(body.shape.angle);
    ctx.fillStyle = (body.timeToLive) ? body.shape.setAlpha(body.timeToLive, body.shape.color) : body.shape.color;
    ctx.fillRect(0, 0, body.shape.w, body.shape.h);
    ctx.restore();
  };

  var drawTriangle = function(body) {
    ctx.save();
    ctx.translate(body.shape.position.x, body.shape.position.y);
    ctx.rotate(body.shape.angle - Math.PI/2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(body.shape.w/2, body.shape.h);
    ctx.lineTo(body.shape.w, 0);
    ctx.closePath();
    ctx.fillStyle = (body.timeToLive) ? body.shape.setAlpha(body.timeToLive, body.shape.color) : body.shape.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  var run = function(timestamp) {
    drawPending = false;
    var delta = timestamp - time;
    time = timestamp;

    tick(delta);
    render();
  };

  var onClick = function(evt) {
    clickX = evt.clientX;
    clickY = evt.clientY;
    // console.log('click', clickX, clickY);
    mouseClicked = !mouseClicked;

    if(!mouseClicked) {
      ga('send', 'event', 'canvas', 'click', 'froze canvas', mouseClicked);
    } else {
      ga('send', 'event', 'canvas', 'click', 'unfroze canvas', mouseClicked);
    }
  };

  var onMouseMove = function(evt) {
    moveX = evt.clientX;
    moveY = evt.clientY;
    // console.log('move', moveX, moveY);
  };

  var redraw = function() {
    if(!drawPending) {
      drawPending = true;
      requestAnimationFrame(run);
    }
  };

  var drawMousePos = function() {
    if(moveX && moveY) {
      ctx.beginPath();
      ctx.arc(moveX, moveY, 20, 0, Math.PI*2, false);
      ctx.fillStyle = 'rgba(0,0,0, 0.5)';
      ctx.fill();
    }
  };

  var update = function(delta) {
    // if(counter % 10 === 0) {
    //   particleSystems[0].addParticles(50);
    // }
    // particleSystems[0].applyRepellers(repellers);
    // particleSystems[0].update();

    // if(attractors.length < 1) {
    //   addAttractor();
    // }

    // if(movers.length < 20){ //} && counter % 10 === 0) {
    //   addMover();
    // }

    // if(oscillators.length < 10 && counter % 30 === 0) {
    //   addOscillator();
    // }

    // if(vehicles.length < 400 && counter % 15 === 0) {
      // addVehicle(Math.random() * canvasWidth/4, Math.random() * canvasHeight/4);
    // }

    movers.forEach(updateMover);
    basicShapes.forEach(updateBasicShape);
    oscillators.forEach(updateOscillator);
    pendulums.forEach(updatePendulum);
    springs.forEach(updateSpring);
    vehicles.forEach(updateVehicle);
    boids.forEach(updateBoid);
    boidGrid = [];
  };

  var bilatticeFlock = function(boid) {
    //bi-lattice subdivision.
    //only look at boids in same grid position or neighbor positions
    var gridPos = boid.gridPosition();
    if(boidGrid[gridPos.x] !== undefined) {
      for(var i = -1; i <= 1; i++) {
        for(var p = -1; p <= 1; p++) {
          var col = i + gridPos.x;
          var row = p + gridPos.y;
          if(row < 0 || col < 0) { continue; }
          if(!boidGrid[col] || !boidGrid[col][row]) { continue; }
          boid.flock(boidGrid[col][row]);
        }
      }
    }
  };

  var updateBoid = function(boid) {
    boid.wrap(canvasWidth, canvasHeight);
    bilatticeFlock(boid);
    // var bounds = boid.stayInBounds(-50, canvasWidth, canvasHeight);
    // if(bounds) {
    //  bounds = bounds.multiply(2);
    //  boid.applyForce(bounds);
    // }

    boid.update();
  };

  var updateVehicle = function(vehicle) {
    var x = moveX || canvasWidth/2;
    var y = moveY || canvasHeight/2;
    // vehicle.seek(new Vector(x, y));

    var cohesion = vehicle.cohesion(vehicles, 50);

    var separate = vehicle.separate(vehicles);
    var bounds = vehicle.stayInBounds(20, canvasWidth, canvasHeight);
    // vehicle.flee(new Vector(x, y));
    // vehicle.seek(vehicle.wander(250, 75, counter));
    // var flowForce = flowField.lookup(vehicle.position);
    // vehicle.follow(flowForce);
    // vehicle.seek(vehicle.followPath(paths[0]));
    // vehicle.followPath(path);
    // var followPathSegments = vehicle.followPathSegments(path);

    if(separate) {
      separate = separate.multiply(1.5);
      vehicle.applyForce(separate);
    }

    if(cohesion) {
      cohesion = cohesion.multiply(0.5);
      vehicle.applyForce(cohesion);
    }

    // if(followPathSegments) {
    //   followPathSegments = followPathSegments.multiply(0.5);
    //   vehicle.applyForce(followPathSegments);
    // }

    if(bounds) {
     bounds = bounds.multiply(2);
      vehicle.applyForce(bounds);
    }

    vehicle.update();
  };

  var updateBasicShape = function(shape) {
    shape.update(shape.shape);
  };

  var updateOscillator = function(oscillator) {
    oscillator.oscillate();
  };

  var updatePendulum = function(pendulum, i) {
    //wire up previous pendulum to be this ones origin.
    if(i > 0) {
      pendulum.setOrigin(pendulums[i-1].getNewPostion());
    }
    pendulum.update();
  };

  var updateSpring = function(spring) {
    spring.update();
  };

  var updateMover = function(mover) {
    /* drag and friction forces.
    if(mover.position.y > canvasHeight - 300) {
      var drag = mover.getDrag(0.005, 1);
      mover.applyForce(drag);
    }

    var friction = mover.getFriction(0.01, 1);
    mover.applyForce(friction);
    //*/
    if(!mouseClicked) {
      // attractors.forEach(function(attractor) {
      //   mover.applyForce(attractor.comeToMe(mover));
      // });

      movers.forEach(function(otherMover) {
        if(mover !== otherMover) {
          otherMover.applyForce(mover.comeHere(otherMover));
        }
      });
      // mover.applyForce(new Vector(0.25, 0.0)); //wind
    } else {
      var friction = mover.getFriction(1, 10);
      mover.applyForce(friction);
    }
    // mover.applyForce(new Vector(0.0, 0.1)); //gravity
    mover.update();
  };

  var updateMoverFreeze = function(mover) {
    if(!mouseClicked) {
      if(Math.random() > 0.5) {
        mover.applyForce(new Vector(0.5, 0.0));
      } else {
        mover.applyForce(new Vector(-0.5, 0.0));
      }
      mover.applyForce(new Vector(0.0, 0.0025));
    } else {
      mover.applyForce(new Vector(-mover.velocity.x, -mover.velocity.y));
    }
  };

  return {
    setCanvas:setCanvas,
    redraw:redraw,
    isCanvasEnabled: function() { return isCanvasEnabled; }
  };
})();
