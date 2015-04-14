var cnvs = (function() {
  var canvas,
    ctx,
    isCanvasEnabled,
    drawPending,
    canvasHeight,
    canvasWidth,
    clickX,
    clickY,
    moveX,
    moveY,
    time = 0,
    counter = 0,
    tx = 0,
    ty = 10000,
    mouseClicked = false,
    xScaler,
    yScaler,
    rScaler,
    alphaScaler,
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
    flowField,
    path,
    ca,
    gol,
    kochLines = [];

  var setCanvas = function(can) {
    canvas = can;
    if(canvas.getContext) {
      ctx = canvas.getContext('2d');
      canvasHeight = canvas.height;
      canvasWidth = canvas.width;
      isCanvasEnabled = true;
      canvas.addEventListener('click', onClick);
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
      // for(var i = 0; i < 250; i++) {
      //   var x = Math.random() * canvasWidth;
      //   var y = Math.random() * canvasHeight;
      //   addBoid(x, y);
      //   // addVehicle(x, y);
      // }
      //cool rulesets.
      // { '111': 0,'110': 1, '101': 0, '100': 1, '011': 1, '010': 0, '001': 1, '000': 0 }
      // { '100': 1, '101': 1, '110': 1, '111': 0, '011': 1, '010': 1, '001': 1, '000': 0 }
      // { 100: 1, 101: 1, 110: 1, 111: 1, 011: 1, 010: 0, 001: 1, 000: 0 }
      // { 100: 1, 101: 1, 110: 1, 111: 0, 011: 1, 010: 1, 001: 1, 000: 0 }
      // { 100: 1, 101: 1, 110: 0, 111: 1, 011: 0, 010: 1, 001: 1, 000: 1 }
      // { 100: 1, 101: 1, 110: 0, 111: 1, 011: 0, 010: 1, 001: 1, 000: 1 }
      // ca = new CellularAutomata({ '111': Math.round(random.umonteCarlo()),
      //   '110': Math.round(random.umonteCarlo()),
      //   '101': Math.round(random.umonteCarlo()),
      //   '100': Math.round(random.umonteCarlo()),
      //   '011': Math.round(random.umonteCarlo()),
      //   '010': Math.round(random.umonteCarlo()),
      //   '001': Math.round(random.umonteCarlo()),
      //   '000': Math.round(random.umonteCarlo()) },
      //   10, canvasWidth, canvasHeight);
      // gol = new GameOfLife(10, canvasWidth, 240);
      // kochLines.push(new KochLine(new Vector(0, 400), new Vector(canvasWidth, 400)));
      // tree();
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
      aVelocity = damping * aVelocity;
    };

    setNewPosition();
    return {
      update:update,
      setNewPosition:setNewPosition,
      getNewPostion: function () { return newPosition.get(); },
      getOrigin: function () { return origin.get(); },
      setOrigin: function(o) { origin = o.get(); }
    };
  };

  var springMaker = function() {
    var Spring = function(x, y, l) {
      this.anchor = new Vector(x, y);
      this.restLength = l;
      this.k = 0.1; //how rigid is this spring?
    };

    Spring.prototype.connect = function(bob) {
      var force = bob.position.subtract(this.anchor);
      var currentLength = force.magnitude();
      var x = currentLength - this.restLength;
      var normForce = force.normalize();
      return normForce.multiply(-1 * this.k * x);
    };

    var spring = new Spring(canvasWidth/2, 40, 240);

    var bob = new Mover(Circle,
      {r: 25 , color: getColor(true)},
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

    return {
      getBob: function() { return bob; },
      getSpring: function() { return spring; },
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
      {r: 5, color: getColor(true)}
    ));
  };

  var addBoid = function(x, y) {
    boids.push(new Boid(
      new Vector(x, y),
      Triangle,
      {w: 5, h:10, color: getColor(true)}
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
    // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // drawMousePos();
    particleSystems.forEach(function(particleSystem) { drawParticleSystem(particleSystem); });
    repellers.forEach(function(repeller) { drawBody(repeller); });
    attractors.forEach(function(attractor) { drawBody(attractor); });
    movers.forEach(function(mover) { drawBody(mover); });
    oscillators.forEach(function(oscillator) { drawOscillator(oscillator) });
    basicShapes.forEach(function(shape) { drawBody(shape); });
    pendulums.forEach(function(pendulum) { drawPendulum(pendulum) });
    springs.forEach(function(spring) { drawSpring(spring); });
    if(path) { path.draw(); }
    waves.forEach(function(wave) { wave.draw(ctx); });
    vehicles.forEach(function(vehicle) { drawBody(vehicle); });
    drawBoids();
    kochLines.forEach(function(line) { drawKochLine(line); });
    // drawCells();
    // drawGoL();
    counter++;

    // drawRecursiveCircles(canvasWidth/2, canvasHeight/2, canvasWidth/2);
    // cantor(10, 20, canvasWidth-20);
  };

  var tree = function() {
    // ctx.fillRect(0, 0, canvasWidth, canvasHeight, 1);
    ctx.translate(canvasWidth/2, canvasHeight);
    branch(200);
    ctx.restore();
  };

  var branch = function(len) {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    ctx.stroke();
    ctx.translate(0, -len);

    var scaleFactor = 0.66;
    // var theta = Math.PI/6;// * random.perlin1d(len);
    if(len > 2) {

      var i = Math.max(1, Math.floor(Math.random() * 4));

      for(var p = 0; p < i; p++) {
        var theta = (Math.random() > 0.5) ? (Math.PI/2) * random.perlin1d(len) : -(Math.PI/2) * random.perlin1d(len);
        ctx.save();
        ctx.rotate(theta);
        branch(len * scaleFactor);
        ctx.restore();
      }
      // ctx.save();
      // ctx.rotate(-theta);
      // branch(len * scaleFactor);

    }
    ctx.restore();
  };

  var drawKochLine = function(line) {
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.stroke();
  };

  var cantor = function(x, y , len) {
    if(len >= 1) {
      var newLineGap = 20;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.closePath();
      ctx.stroke();

      cantor(x, y + newLineGap, len/3);
      cantor(x + len * 2/3, y + newLineGap, len/3);
    }
  };

  var drawRecursiveCircles = function(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2*Math.PI, false);
      ctx.stroke();
      if(r > 10) {
        drawRecursiveCircles(x + r/2, y - r/2, r/2);
        drawRecursiveCircles(x - r/2, y + r/2, r/2);
        // drawRecursiveCircles(x + r/2, y + r/2, r/2);
        // drawRecursiveCircles(x - r/2, y - r/2, r/2);
      }
    };

  var drawCells = function() {
    ca.generations.forEach(function(generation, g) {
      generation.forEach(function(cell, i){
        ctx.fillStyle = (cell === 1) ? '#000' : '#ddd';
        ctx.fillRect((i*ca.cellSize), g*ca.cellSize, ca.cellSize, ca.cellSize);
        ctx.strokeRect((i*ca.cellSize), g*ca.cellSize, ca.cellSize, ca.cellSize);
      });
    });
  };

  var drawGoL = function() {
    gol.board.forEach(function(col, x) {
      col.forEach(function(cell, y) {
        ctx.fillStyle = (cell === 1) ? '#000' : '#ddd';
        ctx.fillRect((x*gol.cellSize), y*gol.cellSize, gol.cellSize, gol.cellSize);
        ctx.strokeRect((x*gol.cellSize), y*gol.cellSize, gol.cellSize, gol.cellSize);
      });
    });
  };

  var drawBoids = function() {
    boids.forEach(function(boid) {
      //bi-lattice subdivision.
      //store all boids in a [x][y] grid
      var gridPos = boid.gridPosition();
      if(!boidGrid[gridPos.x]) { boidGrid[gridPos.x] = []; }
      if(!boidGrid[gridPos.x][gridPos.y]) { boidGrid[gridPos.x][gridPos.y] = []; }
      boidGrid[gridPos.x][gridPos.y].push(boid);
      drawBody(boid);
    });
  };

  var drawParticleSystem = function(particleSystem) {
    particleSystem.particles.forEach(function(particle) {
      drawBody(particle);
    });
  };

  var drawOscillator = function(oscillator) {
    ctx.save();
    ctx.translate(canvasWidth/2, canvasHeight/2);
    drawBody(oscillator);
    ctx.restore();
  };

  var drawPendulum = function(pendulum) {
    var position = pendulum.getNewPostion();
    var origin = pendulum.getOrigin();

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(position.x, position.y, 24, 0, 2*Math.PI, false);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.stroke();
    ctx.fill();
    pendulum.setNewPosition();
  };

  var drawSpring = function(spring) {
      var s = spring.getSpring();
      var bob = spring.getBob();
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(s.anchor.x-5, s.anchor.y-5, 10, 10);
      ctx.beginPath();
      ctx.moveTo(s.anchor.x, s.anchor.y);
      ctx.lineTo(bob.position.x, bob.position.y);
      ctx.stroke();
      drawBody(bob);
  };

  var drawBody = function(body) {
    if (body.shape instanceof Circle) { drawCircle(body); }
    else if (body.shape instanceof Confetti) { drawConfetti(body); }
    else if (body.shape instanceof Rectangle) { drawRectangle(body); }
    else if (body.shape instanceof Triangle) { drawTriangle(body); }
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
    ctx.rect(0, 0, body.shape.w, body.shape.h);
    ctx.fill();
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
    // updateKochLines();

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
    //   addVehicle(Math.random() * canvasWidth/4, Math.random() * canvasHeight/4);
    // }

    movers.forEach(updateMover);
    basicShapes.forEach(updateBasicShape);
    oscillators.forEach(updateOscillator);
    pendulums.forEach(updatePendulum);
    springs.forEach(updateSpring);
    vehicles.forEach(updateVehicle);
    boids.forEach(updateBoid);
    boidGrid = null;
    boidGrid = [];

    // if(counter % 4 === 0) {
    //   // ca.spawn();
    //   gol.spawn();
    //   console.log('number of generations:', gol.generations);
    // }

  };

  var updateKochLines = function() {
    var nextLines = [];
    kochLines.forEach(function(line) {
      nextLines = nextLines.concat(line.getNextLines());
    });
    kochLines = nextLines;
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
