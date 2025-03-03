test('Should create the correct number of particles specified by numberOfParticles variable', () => {
  // Mock document.getElementById
  document.getElementById = jest.fn(() => {
    return {
      getContext: jest.fn(() => ({
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        })),
        fillRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      }))
    };
  });
test('Should reverse particle direction when hitting canvas boundaries', () => {
  // Mock canvas element
  const mockCanvas = {
    width: 100,
    height: 100
  };
  
  // Create a particle at a position close to the boundary
  const particle = new Particle(99, 50, mockCanvas);
  
  // Set specific speed values for testing
  particle.speedX = 2;  // Moving right
  particle.speedY = -3; // Moving up
  
  // Store original speeds
  const originalSpeedX = particle.speedX;
  const originalSpeedY = particle.speedY;
  
  // Update particle position - this should hit the right boundary
  particle.update();
  
  // Verify X direction was reversed (speedX should be negative now)
  expect(particle.speedX).toBe(-originalSpeedX);
  // Y direction should remain the same
  expect(particle.speedY).toBe(originalSpeedY);
  
  // Reset particle position to test Y boundary
  particle.x = 50;
  particle.y = 1;
  particle.speedX = 2;  // Reset to original direction
  particle.speedY = -3; // Moving up (will hit top boundary)
  
  // Update again - this should hit the top boundary
  particle.update();
  
  // Y direction should be reversed now (speedY should be positive)
  expect(particle.speedY).toBe(-originalSpeedY);
  // X direction should remain the same
  expect(particle.speedX).toBe(2);
  
  // Test the lower bound
  particle.x = 50;
  particle.y = 99;
  particle.speedY = 3; // Moving down (will hit bottom boundary)
  
  // Update again
  particle.update();
  
  // Y direction should be reversed
  expect(particle.speedY).toBe(-3);
  
  // Test the left bound
  particle.x = 1;
  particle.y = 50;
  particle.speedX = -2; // Moving left (will hit left boundary)
  
  // Update again
  particle.update();
  
  // X direction should be reversed
  expect(particle.speedX).toBe(2);
});test('Should update particle position based on speedX and speedY values', () => {
  // Mock document.getElementById
  document.getElementById = jest.fn(() => {
    return {
      getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn()
      }))
    };
  });

  // Create a new particle with specific position and canvas
  const mockCanvas = { width: 1000, height: 800 };
  const initialX = 100;
  const initialY = 200;
  const particle = new Particle(initialX, initialY, mockCanvas);
  
  // Set specific speed values for testing
  const testSpeedX = 5;
  const testSpeedY = -3;
  particle.speedX = testSpeedX;
  particle.speedY = testSpeedY;
  
  // Record initial position
  const initialPosition = { x: particle.x, y: particle.y };
  
  // Call update method
  particle.update();
  
  // Verify position has been updated according to speed values
  expect(particle.x).toBe(initialPosition.x + testSpeedX);
  expect(particle.y).toBe(initialPosition.y + testSpeedY);
  
  // Update again and check cumulative position change
  particle.update();
  expect(particle.x).toBe(initialPosition.x + testSpeedX * 2);
  expect(particle.y).toBe(initialPosition.y + testSpeedY * 2);
});
  // Create a new instance of WallpaperAnimation
  const wallpaperAnimation = new WallpaperAnimation();
  
  // Clear any automatically created particles during initialization
  wallpaperAnimation.particles = [];
  
  // Set a specific number of particles to test
  const testParticleCount = 5;
  
  // Override the numberOfParticles value in the createParticles method
  const originalCreateParticles = wallpaperAnimation.createParticles;
  wallpaperAnimation.createParticles = function() {
    const numberOfParticles = testParticleCount;
    for (let i = 0; i < numberOfParticles; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.particles.push(new Particle(x, y, this.canvas));
    }
  };
  
  // Call the method
  wallpaperAnimation.createParticles();
  
  // Assert that the correct number of particles were created
  expect(wallpaperAnimation.particles.length).toBe(testParticleCount);
  
  // Verify each particle is correctly instantiated
  wallpaperAnimation.particles.forEach(particle => {
    expect(particle instanceof Particle).toBe(true);
    expect(particle.canvas).toBe(wallpaperAnimation.canvas);
  });
  
  // Restore original method
  wallpaperAnimation.createParticles = originalCreateParticles;
});








test('Should apply glow effects with proper shadow settings during particle rendering', () => {
  // Mock canvas and context
  const mockCanvas = {
    width: 800,
    height: 600
  };
  
  const mockContext = {
    shadowBlur: 0,
    shadowColor: '',
    fillStyle: '',
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn()
  };
  
  // Create a particle with predetermined properties
  const particle = new Particle(100, 200, mockCanvas);
  particle.color = 'hsl(200, 100%, 50%)';
  particle.alpha = 0.8;
  particle.glowSize = 150;
  
  // Draw the particle
  particle.draw(mockContext);
  
  // Verify that shadow properties were set correctly for glow effect
  expect(mockContext.shadowBlur).toBe(100); // Final value after reset
  expect(mockContext.shadowColor).toBe('hsl(200, 100%, 50%)');
  
  // Verify the fillStyle was set with proper alpha
  expect(mockContext.fillStyle).toBe('hsla(200, 100%, 50%, 0.8)');
  
  // Verify drawing methods were called
  expect(mockContext.beginPath).toHaveBeenCalled();
  expect(mockContext.arc).toHaveBeenCalledWith(100, 200, expect.any(Number), 0, Math.PI * 2);
  expect(mockContext.fill).toHaveBeenCalled();
});







test('Should apply mouse influence to particles within the mouseRadius', () => {
  // Mock document.getElementById
  document.getElementById = jest.fn(() => {
    return {
      getContext: jest.fn(() => ({
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        })),
        fillRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      }))
    };
  });

  // Create a new instance of WallpaperAnimation
  const wallpaperAnimation = new WallpaperAnimation();
  
  // Clear any automatically created particles and set up test particles
  wallpaperAnimation.particles = [];
  wallpaperAnimation.mouseRadius = 100;
  
  // Create test particle at a specific position
  const testParticle1 = new Particle(200, 200, wallpaperAnimation.canvas);
  const testParticle2 = new Particle(500, 500, wallpaperAnimation.canvas);
  
  wallpaperAnimation.particles.push(testParticle1, testParticle2);
  
  // Record original positions
  const particle1OriginalX = testParticle1.x;
  const particle1OriginalY = testParticle1.y;
  const particle2OriginalX = testParticle2.x;
  const particle2OriginalY = testParticle2.y;
  
  // Position mouse within radius of first particle but not the second
  wallpaperAnimation.mouseX = 250;
  wallpaperAnimation.mouseY = 250;
  
  // Apply mouse influence
  wallpaperAnimation.applyMouseInfluence();
  
  // Particle within radius should have moved (position changed)
  expect(testParticle1.x).not.toBe(particle1OriginalX);
  expect(testParticle1.y).not.toBe(particle1OriginalY);
  
  // Particle outside radius should not have moved
  expect(testParticle2.x).toBe(particle2OriginalX);
  expect(testParticle2.y).toBe(particle2OriginalY);
  
  // Verify the particle moved away from the mouse (force direction)
  const dx = testParticle1.x - wallpaperAnimation.mouseX;
  const dy = testParticle1.y - wallpaperAnimation.mouseY;
  
  // The sign of the displacement should match the sign of the original difference
  // This verifies the particle is pushed away from the mouse
  expect(Math.sign(dx)).toBe(Math.sign(particle1OriginalX - wallpaperAnimation.mouseX));
  expect(Math.sign(dy)).toBe(Math.sign(particle1OriginalY - wallpaperAnimation.mouseY));
});
