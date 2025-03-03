class Particle {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.size = Math.random() * 2 + 1.5; // Larger particles for more impact
        this.baseSize = this.size;
        this.speedX = Math.random() * 4 - 2; // Faster movement
        this.speedY = Math.random() * 4 - 2;
        this.pulseSpeed = Math.random() * 0.05 + 0.01;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.05 - 0.025;
        this.orbitRadius = Math.random() * 30 + 10;
        
        // More vibrant color palette
        const colorPalettes = [
            // Intense neon palette
            [`hsl(${Math.random() * 60 + 180}, 100%, 60%)`], // Bright Cyan/Blue
            [`hsl(${Math.random() * 60 + 270}, 100%, 60%)`], // Vibrant Purple/Pink
            [`hsl(${Math.random() * 60 + 0}, 100%, 60%)`],   // Intense Red/Orange
            [`hsl(${Math.random() * 60 + 90}, 100%, 60%)`],  // Bright Green/Yellow
        ];
        const selectedPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
        this.color = selectedPalette[0];
        this.alpha = Math.random() * 0.7 + 0.3; // Higher base opacity
        this.glowSize = Math.random() * 40 + 10; // Larger glow for more impact
        this.lastUpdate = performance.now();
        
        // Add particle trail
        this.trail = [];
        this.trailLength = Math.floor(Math.random() * 10) + 5;
    }

    update(deltaTime) {
        const timeScale = deltaTime / 16.67; // Normalize to 60fps
        
        // Store current position in trail
        if (this.trail.length >= this.trailLength) {
            this.trail.pop();
        }
        this.trail.unshift({x: this.x, y: this.y, size: this.size * 0.8});
        
        // Update angle for orbital movement
        this.angle += this.angleSpeed * timeScale;
        
        // Combine linear and orbital movement
        this.x += this.speedX * timeScale;
        this.y += this.speedY * timeScale;
        
        // Add some orbital/wave motion
        this.x += Math.cos(this.angle) * this.orbitRadius * 0.05 * timeScale;
        this.y += Math.sin(this.angle) * this.orbitRadius * 0.05 * timeScale;

        // Bounce off edges
        if (this.x > this.canvas.width || this.x < 0) {
            this.speedX *= -1;
            this.glowSize = Math.random() * 40 + 20; // Change glow on bounce
        }
        if (this.y > this.canvas.height || this.y < 0) {
            this.speedY *= -1;
            this.glowSize = Math.random() * 40 + 20;
        }
        
        // Dynamic size pulsation
        this.size = this.baseSize + Math.sin(performance.now() * this.pulseSpeed) * (this.baseSize * 0.5);
    }

    draw(ctx) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const trailOpacity = this.alpha * (1 - i / this.trail.length);
            
            ctx.shadowBlur = this.glowSize * (1 - i / this.trail.length * 0.8);
            ctx.shadowColor = this.color;
            
            ctx.fillStyle = this.color.replace(')', `, ${trailOpacity})`).replace('hsl', 'hsla');
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * (1 - i / this.trail.length * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw main particle with intense glow
        ctx.shadowBlur = this.glowSize;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color.replace(')', `, ${this.alpha})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class WallpaperAnimation {
    constructor() {
        this.canvas = document.getElementById('wallpaper');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseRadius = 150; // Larger mouse influence
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
        this.showFps = false;
        this.maxDistance = 300; // Longer connection distance
        this.safetyOverlayOpacity = 0.15; // Safety overlay opacity (0-1)
        this.safetyOverlayColor = 'rgba(0, 0, 0, 0.15)'; // Default safety overlay
        this.intensityLevel = 0.8; // Visual intensity level (0-1)
        this.pulseEffects = true; // Enable pulsing effects
        this.pulseSpeed = 0.0005;
        this.pulseTime = 0;
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.setupSafetyControls();
        this.lastFrameTime = performance.now();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.backgroundGradient = this.createBackgroundGradient();
    }

    createBackgroundGradient() {
        // Create a more dynamic background gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 1.2
        );
        
        // More intense colors
        gradient.addColorStop(0, 'rgba(20, 0, 40, 0.7)');
        gradient.addColorStop(0.5, 'rgba(10, 0, 20, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 10, 0.9)');
        return gradient;
    }

    createParticles() {
        // Adjust particle count based on intensity and screen size
        const area = this.canvas.width * this.canvas.height;
        const baseCount = Math.min(Math.floor(area / 30000), 80); // More particles
        const numberOfParticles = Math.floor(baseCount * this.intensityLevel);
        
        this.particles = [];
        for (let i = 0; i < numberOfParticles; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.particles.push(new Particle(x, y, this.canvas));
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
                e.preventDefault();
            }
        });
        
        // Double click to toggle safety overlay
        window.addEventListener('dblclick', () => {
            this.safetyOverlayOpacity = this.safetyOverlayOpacity > 0.1 ? 0.05 : 0.15;
        });
    }

    setupSafetyControls() {
        // Create a simple control panel for safety settings
        const controlPanel = document.createElement('div');
        controlPanel.style.position = 'fixed';
        controlPanel.style.bottom = '10px';
        controlPanel.style.right = '10px';
        controlPanel.style.background = 'rgba(0,0,0,0.5)';
        controlPanel.style.padding = '10px';
        controlPanel.style.borderRadius = '5px';
        controlPanel.style.color = 'white';
        controlPanel.style.fontFamily = 'Arial, sans-serif';
        controlPanel.style.zIndex = '1000';
        controlPanel.style.display = 'none'; // Hidden by default
        
        controlPanel.innerHTML = `
            <div style="margin-bottom:10px">Safety Controls</div>
            <div style="display:flex;align-items:center;margin-bottom:5px">
                <label for="overlay-opacity" style="margin-right:10px">Overlay:</label>
                <input type="range" id="overlay-opacity" min="0" max="0.5" step="0.01" value="${this.safetyOverlayOpacity}">
            </div>
            <div style="display:flex;align-items:center;margin-bottom:5px">
                <label for="intensity-level" style="margin-right:10px">Intensity:</label>
                <input type="range" id="intensity-level" min="0.2" max="1" step="0.01" value="${this.intensityLevel}">
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        
        // Toggle control panel visibility with 'c' key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'c') {
                controlPanel.style.display = controlPanel.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        // Set up event listeners for controls
        document.getElementById('overlay-opacity').addEventListener('input', (e) => {
            this.safetyOverlayOpacity = parseFloat(e.target.value);
        });
        
        document.getElementById('intensity-level').addEventListener('input', (e) => {
            this.intensityLevel = parseFloat(e.target.value);
            this.createParticles(); // Recreate particles with new intensity
        });
    }

    drawConnections(deltaTime) {
        // Update pulse time
        this.pulseTime += deltaTime * this.pulseSpeed;
        const pulseFactor = this.pulseEffects ? (Math.sin(this.pulseTime) * 0.2 + 0.8) : 1
