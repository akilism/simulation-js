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

  var randRangeFloat = function(min, max)  {
    return Math.random() * (max - min) + min;
  };

  var randRangeInt = function(min, max)  {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  var getRandomChar = function() {
    var n = randRangeInt(65, 91);
    return (Math.random() < 1/27) ? ' ' : String.fromCharCode(n).toLowerCase();
  };

  var randInt = function(i) {
    i = i || 1;
    return Math.floor(Math.random() * i);
  };

  var range = function*(min, max) {
    var i = min;
    while(i < max) {
      yield i++;
    }
  };


  for(var i = 0; i < 360; i++) {
    sinVals.push(Math.sin(radians(i)));
    cosVals.push(Math.cos(radians(i)));
  }

  return {
    getSin: function(degrees) { return sinVals[degrees]; },
    getCos: function(degrees) { return cosVals[degrees]; },
    interpolater: interpolater,
    radians:radians,
    randRangeFloat:randRangeFloat,
    randRangeInt:randRangeInt,
    getRandomChar:getRandomChar,
    randInt:randInt,
    range:range
  };
})();
