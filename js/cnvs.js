var cnvs = (function() {
  var canvas,
    ctx,
    isCanvasEnabled,
    drawPending,
    canvasHeight,
    canvasWidth,
    time = 0,
    counter = 0,
    circles = [],
    attractors = [],
    clickX,
    clickY,
    moveX,
    moveY,
    xScaler,
    yScaler,
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
      // addCircles(10);

    } else {
      isCanvasEnabled = false;
    }
  };

  // var addCircles = function(numCircles) {
  //   for(var i = 0; i < numCircles; i++) {
  //     circles.push(new Mover(Circle, {r: 5 , color: '#dfdfdf'}, 10, new Vector(Math.random()*450, canvasHeight/2), canvasWidth, canvasHeight));
  //   }
  // };

  var getColor = function() {
      var r = Math.floor(Math.random() * 256),
      g = Math.floor(Math.random() * 256),
      b = Math.floor(Math.random() * 256),
      a = 1;
      // r = 0; g = 0; b = 0;
      a = 0.5;//Math.random();
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };

  var addCircle = function() {
    var mass = Math.max(100, Math.round(Math.random() * 400));
    circles.push(new Mover(Circle,
      {r: rScaler(mass) , color: 'rgba(0,0,0,1)'},
      mass,
      new Vector(Math.random()*canvasWidth,
      canvasHeight + 300),
      canvasWidth,
      canvasHeight));
  };

  var addAttractor = function() {
    var mass = 60;
    attractors.push(new Attractor(Circle,
      {r: mass, color: '#00FF00'},
      mass,
      1.5,
      new Vector(canvasWidth/2, canvasHeight/2)
    ));
  };

  var tick = function(delta) {
    update(delta);
    redraw();
  };

  var render = function() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    circles.forEach(function(circle) {
      circle.draw(ctx);
    });

  };

  var run = function(timestamp) {
    drawPending = false;
    var delta = timestamp - time;
    time = timestamp;

    tick(delta);
    render();
  };

  var flipCircleColors = function(toRandom) {
    circles.forEach(function(circle) {
      var color = (toRandom) ? getColor() : 'rgba(0,0,0,1)';
      circle.setNewColor(color);
    });
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

    if(attractors.length < 1) {
      addAttractor();
    }

    if(circles.length < 500 && counter > 20) {
      for(var i = 0; i < 50; i++) {
        addCircle();
      }
      counter = 0;
    } else { counter++; }
    circles.forEach(updateCircle);
  };

  var updateCircle = function(circle) {
    /* drag and friction forces.
    if(circle.position.y > canvasHeight - 300) {
      var drag = circle.getDrag(0.005, 1);
      circle.applyForce(drag);
    }

    var friction = circle.getFriction(0.01, 1);
    circle.applyForce(friction);
    //*/
    if(!mouseClicked) {
      attractors.forEach(function(attractor) {
        circle.applyForce(attractor.comeToMe(circle));
      });

      circle.applyForce(new Vector(0.01, 0)); //wind
      circle.applyForce(new Vector(0, 0.1 * circle.mass)); //gravity
    } else {
      var friction = circle.getFriction(1, 10);
      circle.applyForce(friction);
    }
    circle.update();
  };

  var updateCircleFreeze = function(circle) {
    if(!mouseClicked) {
      if(Math.random() > 0.5) {
        circle.applyForce(new Vector(0.5, 0.0));
      } else {
        circle.applyForce(new Vector(-0.5, 0.0));
      }
      circle.applyForce(new Vector(0.0, 0.0025));
    } else {
      circle.applyForce(new Vector(-circle.velocity.x, -circle.velocity.y));
    }
  };

  var Circle = function(opts) {
    this.r = opts.r || 5;
    this.color = opts.color || '#dfdfdf';
    this.endAngle = 2*Math.PI;
    this.position = null;
    this.newColor = null;
  };


  Circle.prototype.incrementColor = function(a, b, x) {
    if(b != a) {
      return a += 1;
    }
    return a;
    // return a * (1 - x) + b * x;
  };

  Circle.prototype.setNewColor = function(color) {
    this.newColor = color;
  };

  Circle.prototype.getColorString = function(color) {
    return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
  };

  Circle.prototype.getColorObj = function(color) {
    var colors = color.replace('rgba(', '').replace(')', '').split(',');

    // if(colors[0].indexOf('r') > -1) { debugger; }
    return {
      r: parseFloat(colors[0]),
      g: parseFloat(colors[1]),
      b: parseFloat(colors[2]),
      a: parseFloat(colors[3]),
    };
  };

  Circle.prototype.setColor = function() {
    if(this.newColor === this.color || !this.newColor) { return this.color; }

    var newColorObj = this.getColorObj(this.newColor);
    var oldColorObj = this.getColorObj(this.color);

    var currColorObj = {
      r: this.incrementColor(oldColorObj.r, newColorObj.r, 1),
      g: this.incrementColor(oldColorObj.g, newColorObj.g, 1),
      b: this.incrementColor(oldColorObj.b, newColorObj.b, 1),
      a: 0.5
    };
    var colorStr = this.getColorString(currColorObj);
    // console.log(colorStr);
    this.color = colorStr;
  };

  Circle.prototype.draw = function(ctx) {
    this.setColor();
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, this.endAngle, false);

    ctx.fillStyle = this.color;
    ctx.fill();
  };

  Circle.prototype.hit = function(x, y) {
    return (x <= this.position.x + this.r && x >= this.position.x - this.r) &&
           (y <= this.position.y + this.r && y >= this.position.y - this.r);
  };

  Circle.prototype.setPosition = function(position) {
    this.position = position;
  };


  return {
    setCanvas:setCanvas,
    redraw:redraw,
    isCanvasEnabled: function() { return isCanvasEnabled; }
  };
})();
