var ParticleSystem = function(position, canvasWidth, canvasHeight) {
  this.origin = position.get();
  this.particles = [];
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
};

ParticleSystem.prototype.getColor = function() {
    var r = Math.floor(Math.random() * 256),
    g = Math.floor(Math.random() * 256),
    b = Math.floor(Math.random() * 256),
    a = 1;
    // r = 140; g = 140; b = 0;
    // a = Math.random();
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};

ParticleSystem.prototype.addParticle = function() {
    var mass = Math.random();
    if(Math.random () > 0.25) {
      this.particles.push(new Particle(Circle,
        {r: 5 , color: this.getColor()},
        this.origin, mass));
    } else {
      this.particles.push(new Particle(Confetti,
        {w: 5, h: 5, canvasWidth: this.canvasWidth, color: this.getColor()},
        this.origin, mass));
    }
};

ParticleSystem.prototype.addParticles = function(numParticles) {
  for(var i = 0; i < numParticles; i++) {
    this.addParticle();
  }
};

ParticleSystem.prototype.applyAttractors = function(attractors) {
  var ps = this;
  attractors.forEach(function(attractor) {
    ps.particles.forEach(function(particle) {
      var force = attractor.comeToMe(particle);
      particle.applyForce(force);
    });
  });
};

ParticleSystem.prototype.applyRepellers = function(repellers) {
  var ps = this;
  repellers.forEach(function(repeller) {
    ps.particles.forEach(function(particle) {
      var force = repeller.goAway(particle);
      particle.applyForce(force);
    });
  });
};

ParticleSystem.prototype.update = function() {
  var ps = this;
  this.particles.forEach(function(particle, i) {
    var gravity = new Vector(0, 0.05);
    particle.applyForce(gravity.multiply(particle.mass));
    // particle.applyForce(new Vector(0.001, 0));
    particle.update();
    if(particle.isDead()) {
      ps.particles.splice(i, 1);
    }
  });
};
