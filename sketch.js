let mySound;
let started = false;
let flyingLines = []; // This array will hold all our active lines

function preload() {
  // Load your audio file
  // mySound = loadSound('assets/your-audio.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Pause the draw loop until the button is clicked
  noLoop(); 
  
  // Link the HTML button and screen
  let enterButton = document.getElementById('enter-btn');
  let introScreen = document.getElementById('intro-screen');
  
  enterButton.addEventListener('click', function() {
    // Fade out the intro screen
    introScreen.style.opacity = '0';
    setTimeout(() => {
      introScreen.style.display = 'none';
    }, 500);
    
    // Start the art and sound
    started = true;
    mySound.loop(); 
    loop(); // Unpause the p5.js loop
  });
}

function draw() {
  if (!started) return; 
  
  // Using a slightly transparent background (the '40' at the end) 
  // leaves a faint trail behind the moving lines, looking like motion blur.
  background(20, 20, 20, 40); 
  
  // 1. Spawn new lines at the cursor every single frame
  // Change the '3' to spawn more or fewer lines at a time
  for (let i = 0; i < 3; i++) {
    flyingLines.push(new Ray(mouseX, mouseY));
  }
  
  // 2. Update and draw all existing lines
  // We loop backwards through the array so we can safely delete faded lines
  for (let i = flyingLines.length - 1; i >= 0; i--) {
    flyingLines[i].update();
    flyingLines[i].display();
    
    // 3. Delete lines that are invisible so your browser doesn't crash
    if (flyingLines[i].alpha <= 0) {
      flyingLines.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- THE BLUEPRINT FOR A SINGLE LINE ---
class Ray {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    
    // Pick a random direction (angle) and random speed
    let angle = random(TWO_PI);
    let speed = random(4, 15);
    
    // Calculate how fast it moves on the X and Y axis based on the angle
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    
    this.alpha = 255; // Starts fully visible (solid white)
  }
  
  update() {
    // Move the line
    this.x += this.vx;
    this.y += this.vy;
    
    // Make it fade out slightly every frame
    this.alpha -= 5; 
  }
  
  display() {
    stroke(255, this.alpha); // Set color to white, and apply current fade level
    strokeWeight(2);
    
    // Draw the line. We draw from its current position stretching back 
    // along its path to give it a dynamic "shooting star" look.
    line(this.x, this.y, this.x - this.vx * 3, this.y - this.vy * 3);
  }
}