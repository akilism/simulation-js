var perlinNoise = (function() {
    var vals = [];
    var vals2d = [];

    var monteCarlo = function() {
      var num = Math.random();
      var probability = num;
      var num2 = Math.random();

      if(num2 < probability) {
        return num;
      } else {
        return monteCarlo();
      }
    };

    //linear interpolation between a and b
    //x in between 0.0 and 1.0
    var lerp = function(a, b, x) {
      return a * (1 - x) + b * x;
    };

    //cosine interpolation between a and b
    var cerp = function(a, b, x) {
      ft = x * Math.PI;
      f = (1 - Math.cos(ft)) * 0.5;
      return a * (1 - f) + b * f;
    };

    // 1D Perlin Noise Functions
    var noiseVal = function(x) {
      if(!vals[x]) {
        vals[x] = monteCarlo();
      }
      return vals[x];
    };

    var smoothNoise = function(x) {
      return noiseVal(x)/2 + noiseVal(x-1)/4 + noiseVal(x + 1)/4;
    };

    var interpolatedNoise = function(x) {
      var xInt = Math.floor(x);
      var a = smoothNoise(xInt);
      var b = smoothNoise(xInt + 1);
      return lerp(a, b, x - xInt);
    };

    var perlin1d = function(x) {
      var total = 0;
      var freq = 2 * i;
      var persistence = 0.5;
      var numOctaves = 8;

      for(var i = 0; i < numOctaves; i++) {
        var freq = Math.pow(2, i);
        var amp = Math.pow(persistence, i);
        total = total + interpolatedNoise(x * freq) * amp;
      }

      return Math.abs(total - 1);
    };
    //End 1D

    // 2D Perlin Noise Functions.
    var noiseVal2d = function(x, y) {
      if(!vals2d[x]) { vals2d[x] = []; }
      if(!vals2d[x][y]) {
        vals2d[x][y] = monteCarlo();
      }
      return vals2d[x][y];
    };

    var smoothNoise2d = function(x, y) {
      var corners = (noiseVal2d(x - 1, y - 1) + noiseVal2d(x + 1, y - 1) + noiseVal2d(x - 1, y - 1) + noiseVal2d(x + 1, y + 1)) / 16;
      var sides = (noiseVal2d(x - 1, y) + noiseVal2d(x + 1, y) + noiseVal2d(x, y - 1) + noiseVal2d(x, y + 1)) / 8;
      var center = noiseVal2d(x, y) / 4;
      return corners + sides + center;
    };

    var interpolatedNoise2d = function(x, y) {
      var xInt = Math.floor(x);
      var yInt = Math.floor(y);
      var a = smoothNoise2d(xInt, yInt);
      var b = smoothNoise2d(xInt + 1, yInt);
      var c = smoothNoise2d(xInt, yInt + 1);
      var d = smoothNoise2d(xInt + 1, yInt + 1);
      var interp1 = lerp(a, b, x - xInt);
      var interp2 = lerp(c, d, x - xInt);
      return lerp(interp1, interp2, y - yInt);
    };

    var perlin2d = function(x, y) {
      var total = 0;
      var freq = 2 * i;
      var persistence = 0.5;
      var numOctaves = 8;

      for(var i = 0; i < numOctaves; i++) {
        var freq = Math.pow(2, i);
        var amp = Math.pow(persistence, i);
        total = total + interpolatedNoise2d(x * freq, y * freq) * amp;
      }

      return Math.abs(total - 1);
    };
    //End 2D

    return {
      perlin1d:perlin1d,
      perlin2d:perlin2d
    };
})();
