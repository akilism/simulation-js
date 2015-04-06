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
    attractors = [],
    repellers = [],
    particleSystems = [],
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
      rScaler = interpolater(100, 400, Math.min(90, canvasWidth/8), Math.max(15, canvasWidth/24));
      alphaScaler = interpolater(0, 1, 0, 255);
      particleSystems.push(new ParticleSystem(new Vector(canvasWidth/1.8, 150), canvasWidth, canvasHeight));
      addRepeller();
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
        a = 1;//
      }
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };

  var addAttractor = function() {
    var mass = 60;
    attractors.push(new Attractor(Circle,
      {r: mass, color: '#00FF00'},
      mass,
      1,
      new Vector(canvasWidth/2, canvasHeight - 100)
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
    var mass = Math.max(100, Math.round(Math.random() * 400));
    movers.push(new Mover(Circle,
      {r: rScaler(mass) , color: getColor(true)},
      mass,
      0.01,
      new Vector(Math.random()*canvasWidth,
      canvasHeight + 300),
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
    // repellers.forEach(function(repeller) { repeller.draw(ctx); });
    // attractors.forEach(function(attractor) { attractor.draw(ctx); });
    movers.forEach(function(mover) { mover.draw(ctx); });
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

    if(attractors.length < 1) {
      addAttractor();
    }

    if(movers.length < 500 && counter > 20) {
      for(var i = 0; i < 50; i++) {
        addMover();
      }
      counter = 0;
    } else { counter++; }
    movers.forEach(updateMover);
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
      attractors.forEach(function(attractor) {
        mover.applyForce(attractor.comeToMe(mover));
      });

      mover.applyForce(new Vector(0.01, 0)); //wind
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
