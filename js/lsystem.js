var LSystem = function(ruleSet, alphabet, axiom, ctx) {
  this.ruleSet = ruleSet;
  this.current = axiom;
  this.alphabet = alphabet;
  this.count = 0;
  this.ctx = ctx;
  this.len = 150;
  this.theta = utils.radians(25);
  this.key = {
    'F': function(ctx) { ctx.moveTo(0, 0); ctx.lineTo(0, len); translate(0, len); },
    'G': function(ctx) { ctx.translate(0, len); },
    '+': function(ctx) { ctx.rotate(this.theta); },
    '-': function(ctx) { ctx.rotate(-this.theta); },
    '[': function(ctx) { ctx.save(); },
    ']': function(ctx) { ctx.restore(); }
  };
};


LSystem.prototype.getSentence = function() {
  return this.current.join('');
};

LSystem.prototype.generate = function() {
  var next = this.current.map(function(c) {
    return (this.ruleSet[c]) ? this.ruleSet[c] : '';
  })
  .filter(function (r) { return r !== ''; })
  .reduce(function(curr, r, i) {
    return curr.concat(r);
  }, []);
  this.current = next;
  this.len *= 0.66;
};

LSystem.prototype.render = function() {
  this.current.forEach(function(c) {
    var f = this.key[c];
    f(this.ctx);
  });
};
