(function() {
  var resizeCanvas = function(canvas) {
    var w = window.innerWidth - 20,
    h = window.innerHeight - 20;

    if(!canvas) {
      canvas = document.querySelector('#bgCanvas');
    }

    canvas.height = h;
    canvas.width = w;
  };

  var selectCanvas = function() {
    canvas.click();
  };

  var createCanvas = function () {
    var w = window.innerWidth - 20,
    h = window.innerHeight - 20;
    canvas = document.createElement('canvas'),
    wrapper = document.querySelector('#wrapper');

    canvas.id="bgCanvas";
    resizeCanvas(canvas);
    canvas.classList.add('bg-canvas');
    wrapper.setAttribute('style', 'height: ' + h + 'px; width:  ' + w + 'px');
    wrapper.appendChild(canvas);

    var main = document.querySelector('.main');
    main.height = h;
    main.width = w;
  };

  createCanvas();

  var bgCanvas = document.querySelector('#bgCanvas');

  cnvs.setCanvas(bgCanvas);

  var start = function () {
    cnvs.redraw();
    document.removeEventListener('visibilitychange', start);
    setTimeout(selectCanvas, 5000);
  };

  if(cnvs.isCanvasEnabled()) {
    // window.onresize = resizeCanvas;
    var elements = document.querySelectorAll('.main *:not(a)');

    Array.prototype.slice.call(elements, 0).forEach(function(element) {
      element.addEventListener('click', selectCanvas, false);
    });

    if(document.visibilityState === 'hidden') {
      document.addEventListener('visibilitychange', start, false);
    } else {
      cnvs.redraw();
      // setTimeout(selectCanvas, 5000);
    }
  }
})();
