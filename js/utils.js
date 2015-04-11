var utils = (function() {

  var sinVals = [];
  var cosVals = [];

  var radians = function(degrees) {
    return 2 * Math.PI * (degrees / 360);
  };

  var interpolater = (function(currMin, currMax, otherMin, otherMax) {
    var left = currMax - currMin;
    var right = otherMax - otherMin;

    var scale = right / left;

    var getVal = function(val) {
      return otherMin + (val - currMin) * scale;
    };

    return getVal;
  });


  for(var i = 0; i < 360; i++) {
    sinVals.push(Math.sin(radians(i)));
    cosVals.push(Math.cos(radians(i)));
  }

  return {
    getSin: function(degrees) { return sinVals[degrees]; },
    getCos: function(degrees) { return cosvals[degrees]; },
    interpolater: interpolater
  };
})();
