var random = (function() {
  var getMean = function(arr) {
    return arr.reduce(function(curr, v, i) {
      return curr + v;
    }, 0) / arr.length;
  };

  var getStandardDeviation = function(arr) {
    var mean = getMean(arr);

    var variances = arr.map(function(v) {
      return Math.pow(v - mean, 2);
    });

    return Math.sqrt(variances.reduce(function(curr, v, i) {
      return curr + v;
    }, 0) / variances.length);
  };

  var lastGauss = null;
  var randomGauss = function() {
    var mean = 0;
    var stddev = 1;

    if(lastGauss) {
      var val = lastGauss;
      lastGauss = null;
      return (mean + val * stddev);
    }

    var x1 = 2.0 * Math.random() - 1.0;
    var x2 = 2.0 * Math.random() - 1.0;
    var w = x1 * x1 + x2 * x2;

    if(w >= 1.0) { return randomGauss(); }
    w = (Math.sqrt((-2.0 * Math.log(w))/w));
    var y1 = x1 * w;
    var y2 = x2 * w;
    lastGauss = y2;

    return (mean + y1 * stddev);
  };

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

  return {
    monteCarlo:monteCarlo,
    randomGauss:randomGauss
  }
})();
