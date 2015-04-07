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
    clickX,
    clickY,
    moveX,
    moveY,
    xScaler,
    yScaler,
    rScaler,
    alphaScaler,
    tx = 0,
    ty = 10000,
    wave,
    pendulum,
    mouseClicked = false;

  var interpolater = (function(currMin, currMax, otherMin, otherMax) {
    var left = currMax - currMin;
    var right = otherMax - otherMin;

    var scale = right / left;

    var getVal = function(val) {
      return otherMin + (val - currMin) * scale;
    };

    return getVal;
  });

  var setCanvas = function(can) {
    canvas = can;
    if(canvas.getContext) {
      ctx = canvas.getContext('2d');
      canvasHeight = canvas.height;
      canvasWidth = canvas.width;
      isCanvasEnabled = true;
      canvas.addEventListener('click', onClick);
      // canvas.addEventListener('mousemove', onMouseMove);
      xScaler = interpolater(0, 1, 0, 600);
      yScaler = interpolater(0, 1, 0, 600);
      rScaler = interpolater(100, 400, Math.min(75, canvasWidth/8), Math.max(15, canvasWidth/24));
      alphaScaler = interpolater(0, 1, 0, 255);
      // particleSystems.push(new ParticleSystem(new Vector(canvasWidth/1.8, 150), canvasWidth, canvasHeight));
      // addRepeller();
      // addOscillator();
      // addMover();
      // addCircle();
      // wave = waveMaker(0.25, canvasHeight/6, canvasHeight/2);
      wave = waveMaker(0.15, canvasHeight/4, canvasHeight/2);
      pendulum = pendulumMaker();
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

  var r = 75;
  var theta = 0;
  var polarUpdate = function(shape) {
    var x = (r * Math.cos(theta)) + (canvasWidth/2);
    var y = (r * Math.sin(theta)) + (canvasHeight/2);
    var position = new Vector(x, y);
    shape.setPosition(position);
    theta += 0.01;
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
    var armLength = 250;
    var angle = Math.PI / 4;
    var aVelocity = 0.0;
    var aAcceleration = 0.0;
    var damping = 0.995;

    var update = function() {
      var gravity = 0.4;
      aAcceleration = (-1 * gravity / armLength) * Math.sin(angle);
      aVelocity += aAcceleration;
      angle += aVelocity;
      // aVelocity *= this.damping;
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
    }

    var draw = function(ctx) {
      var position = new Vector(armLength * Math.sin(angle), armLength * Math.cos(angle));
      var newPosition = position.add(origin);
      drawArm(ctx, {origin: origin, new: newPosition});
      drawBob(ctx, newPosition);
    };

    return {
      draw:draw,
      update:update
    };
  };

  var addCircle = function() {
    basicShapes.push({ update: harmonicUpdate,
      shape: new Circle({ r: 50, color: getColor() })});
    basicShapes[basicShapes.length-1].shape.setPosition(new Vector(canvasWidth/2, canvasHeight/2), 0);
  };

  var addAttractor = function() {
    var mass = 50;
    attractors.push(new Attractor(Circle,
      {r: mass, color: '#00FF00'},
      mass,
      1,
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
      {r: 25, color: getColor(true)},
      angle,
      velocity,
      amplitude,
      new Vector(canvasWidth/2, canvasHeight/2),
      canvasWidth, canvasHeight
    ));
  };

  var addRepeller = function() {
    var mass = 20;
    repellers.push(new Repeller(Circle,
      {r: mass, color: 'rgba(140, 140, 0, .5)'},
      mass,
      1,
      new Vector(canvasWidth/2, canvasHeight/2)
    ));
  };

  var addMover = function() {
    var mass = Math.max(30, Math.round(Math.random() * 40));
    // Circle,
    //   {r: rScaler(mass) , color: getColor(true)},
    movers.push(new Mover(Rectangle,
      {w: 30, h: 15, color: getColor(true)},
      mass,
      0.01,
      new Vector(10,
      20),
      canvasWidth,
      canvasHeight));
  };

  var tick = function(delta) {
    update(delta);
    redraw();
  };

  var render = function() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    particleSystems.forEach(function(particleSystem) { particleSystem.draw(ctx); });
    repellers.forEach(function(repeller) { repeller.draw(ctx); });
    attractors.forEach(function(attractor) { attractor.draw(ctx); });
    movers.forEach(function(mover) { mover.draw(ctx); });
    oscillators.forEach(function(oscillator) { oscillator.draw(ctx); });
    basicShapes.forEach(function(shape) { shape.shape.drawAngle(ctx); });
    // wave.draw(ctx);
    pendulum.draw(ctx);
    counter++;
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

  var update = function(delta) {
    // if(counter % 10 === 0) {
    //   particleSystems[0].addParticles(25);
    // }
    // particleSystems[0].applyRepellers(repellers);
    // particleSystems[0].update();

    // if(attractors.length < 1) {
    //   addAttractor();
    // }

    // if(movers.length < 10 && counter % 30 === 0) {
    //   addMover();
    // }

    // if(oscillators.length < 10 && counter % 60 === 0) {
    //   addOscillator();
    // }

    movers.forEach(updateMover);
    basicShapes.forEach(updateBasicShape);
    oscillators.forEach(function(o) {
      o.oscillate();
    });
    pendulum.update();
  };

  var updateBasicShape = function(shape) {
    shape.update(shape.shape);
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

      mover.applyForce(new Vector(0.01, 0.05)); //wind
    } else {
      var friction = mover.getFriction(1, 10);
      mover.applyForce(friction);
    }
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
