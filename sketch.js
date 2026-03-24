let started = false;
let terminalLogs = []; // Array to store the terminal logs
let maxLogs = 100; // The maximum number of log lines to show on screen
let startTime = 0;
let elapsedTime = 0;

let tranquility = 50; // 0 (Crazy) to 100 (Calm)
let maxTimerMs = 150000; // 2.5 minutes constraint for errors and craziness
let chaosStartMs = 3000; // 10s variable for chaos start
let chaos = 0; // chaos parameter from 0 to 1
let globalAccentColor; // global primary color for accent lines
let globalDarkAccentColor; // global secondary dark color for accent lines
let linesLayer;
let walkers = [];
let visualSegments = [];
let visualNodes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  
  linesLayer = createGraphics(windowWidth, windowHeight);
  linesLayer.clear();
  
  // Initialize some walkers strictly on the right 30% of the screen early on
  for (let i = 0; i < 15; i++) {
    let startX = random(windowWidth * 0.7, windowWidth);
    walkers.push(new Walker(startX, windowHeight));
  }
  
  // Pause the draw loop until the button is clicked
  // noLoop(); // Removed so background terminal animates
  
  // Link the HTML button and screen
  let enterButton = document.getElementById('enter-btn');
  let introScreen = document.getElementById('intro-screen');
  let exitButton = document.getElementById('exit-btn');
  
  enterButton.addEventListener('click', function() {
    // Fade out the intro screen
    introScreen.style.opacity = '0';
    setTimeout(() => {
      introScreen.style.display = 'none';
      background(0);
    }, 500);
    
    // Resume interactive cursor trace
    started = true;
    startTime = millis(); // REQUIRED: Resets timer so chaosStartMs delay begins exactly now and scales linearly from 0
  });
  
  // Set up the Exit Button logic
  exitButton.addEventListener('click', function() {
    started = false;
    // noLoop(); // Halt p5 sketch
    exitButton.style.display = 'none';
    background(0); // clear the screen of trails
    
    // Bring the intro screen back
    introScreen.style.display = 'flex';
    setTimeout(() => {
      introScreen.style.opacity = '1';
    }, 50);
  });
}

function draw() {
  // A slightly transparent background creates the trailing fade effect
  background(0, 90);
  
  // --- PROCEDURAL LINES VISUAL ---
  linesLayer.clear();
    
    // Draw completed segments
    for (let s of visualSegments) {
      let col;
      if (s.accentType === 1) col = globalAccentColor;
      else if (s.accentType === 2) col = globalDarkAccentColor;
      else col = s.baseColor;
      
      linesLayer.stroke(col);
      linesLayer.strokeWeight(s.weight);
      linesLayer.line(s.x1, s.y1, s.x2, s.y2);
    }
    
    // Draw nodes
    for (let n of visualNodes) {
      let col;
      if (n.accentType === 1) col = globalAccentColor;
      else if (n.accentType === 2) col = globalDarkAccentColor;
      else col = n.baseColor;
      
      linesLayer.stroke(col);
      linesLayer.strokeWeight(1.5);
      if (n.filled) linesLayer.fill(col);
      else linesLayer.fill(0);
      linesLayer.circle(n.x, n.y, n.size);
    }
    
    for (let w of walkers) {
      w.update();
    }
    // Replace dead walkers to keep the visual going
    for (let i = walkers.length - 1; i >= 0; i--) {
      if (walkers[i].isDead) {
        walkers.splice(i, 1);
        let leftSpawn = started ? windowWidth * 0.5 : windowWidth * 0.7;
        let startX = random(leftSpawn, windowWidth);
        walkers.push(new Walker(startX, windowHeight));
      }
    }
    
    // Apply 70% transparency before the initial click
    if (!started) tint(255, 76);
    else noTint();
    
    image(linesLayer, 0, 0);
    noTint();

    if (!started) {
      chaos = 0;
      elapsedTime = 0;
    } else {
      elapsedTime = millis() - startTime;
      
      if (elapsedTime > chaosStartMs) {
        chaos = map(elapsedTime, chaosStartMs, maxTimerMs, 0, 1);
        chaos = constrain(chaos, 0, 1);
      } else {
        chaos = 0;
      }
    }
    
    // Show the exit button only when chaos reaches 0.8
    if (chaos >= 0.8) {
      document.getElementById('exit-btn').style.display = 'block';
    } else {
      document.getElementById('exit-btn').style.display = 'none';
    }
    
    // Define global accent color based on chaos threshold
    if (chaos < 0.5) {
      globalAccentColor = color(0, 255, 0); // Green phase
      globalDarkAccentColor = color(0, 100, 0); // Dark green
    } else {
      globalAccentColor = color(255, 0, 0); // Red phase
      globalDarkAccentColor = color(150, 0, 0); // Dark red
    }
    
    // Trace the cursor movement
    if (started) {
      stroke(255);
      strokeWeight(2);
      line(pmouseX, pmouseY, mouseX, mouseY);
    }

  // --- TERMINAL EFFECT ---
  
  // Add a new log every 4 frames (so it doesn't move too fast to read)
  if (frameCount % 10 === 0) {
    terminalLogs.push(generateFakeLog()); // Add new line to the end
    
    // If we have more lines than fit on screen, remove the oldest one (the first one)
    if (terminalLogs.length > maxLogs) {
      terminalLogs.shift(); 
    }
  }

  // Draw the text
  textAlign(LEFT, TOP);
  noStroke(); // Make sure the text doesn't have outlines
  
  // Loop through our list and draw each line slightly lower than the last
  for (let i = 0; i < terminalLogs.length; i++) {
    if (!started) {
      fill(0, 200); // Black before start
    } else if (terminalLogs[i].includes('ERROR_FATAL')) {
      fill(255, 0, 0, 200); // Red for error
    } else {
      fill(0, 255, 0, 200); // Classic hacker green, slightly transparent
    }
    // text(string, x, y)
    text(terminalLogs[i], 20, 20 + (i * 18)); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Re-create lines layer and clear it
  linesLayer = createGraphics(windowWidth, windowHeight);
  linesLayer.clear();
  
  // Restart walkers
  walkers = [];
  visualSegments = [];
  visualNodes = [];
  for (let i = 0; i < 15; i++) {
    let startX = random(windowWidth * 0.5, windowWidth);
    walkers.push(new Walker(startX, windowHeight));
  }
  
  background(0);
}

function generateFakeLog() {
  // A mix of technical-sounding actions
  const actions = [
    "SFTP_CONNECT_INIT", 
    "GPG_DECRYPT_PAYLOAD", 
    "SNOWFLAKE_QUERY_EXEC", 
    "AWAITING_XLSX_PARSE", 
    "DATA_OVERRIDE_AUTH", 
    "MEM_ALLOC_ROOT"
  ];
  
  // Generate a random 6-character hex code (like 0A4F9B)
  let hexCode = hex(floor(random(0, 16777215)), 6); 
  let action = random(actions);
  
  let chance = chaos * 100;
  let status = random(100) < chance ? 'ERROR_FATAL' : 'OK'; 
  
  return `[${hexCode}] ${action} ... ${status}`;
}

// --- PROCEDURAL LINES CLASS --- //
class Walker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.targetX = x;
    this.targetY = y;
    
    // Pick visual style
    this.weight = random(1.5, 4); // some thin, some thick
    
    this.pickNewColor();
    
    // Growth speed
    this.speed = random(2, 6);
    this.hasReached = true;
    
    // Random sizes for the circle at joints
    this.nodeSize = this.weight * 2 + random(1, 3);
    this.isDead = false;
    this.lastDir = "UP";
  }
  
  update() {
    if (this.isDead) return;
    
    if (this.hasReached) {
      // Save node to global visual array
      let filled = random() <= 0.5;
      visualNodes.push({
        x: this.x, y: this.y, 
        size: this.nodeSize, accentType: this.accentType, baseColor: this.baseColor, filled: filled
      });
      if (visualNodes.length > 200) visualNodes.shift();
      
      // Determine new target
      this.pickNewTarget();
    } else {
      // Move towards target
      let dx = this.targetX - this.x;
      let dy = this.targetY - this.y;
      let distToTarget = dist(this.x, this.y, this.targetX, this.targetY);
      
      let nextX = this.x, nextY = this.y;
      
      // Speed scales up to 5x based on the global chaos parameter
      let currentSpeed = this.speed * map(chaos, 0, 1, 1, 5);
      
      if (distToTarget <= currentSpeed) {
        nextX = this.targetX;
        nextY = this.targetY;
        this.hasReached = true;
        
        // Save completed segment
        visualSegments.push({
          x1: this.startX, y1: this.startY,
          x2: nextX, y2: nextY,
          accentType: this.accentType, baseColor: this.baseColor, weight: this.weight
        });
        if (visualSegments.length > 200) visualSegments.shift();
      } else {
        let ratio = currentSpeed / distToTarget;
        nextX += dx * ratio;
        nextY += dy * ratio;
      }
      
      // Draw the actively growing line directly to linesLayer
      let col;
      if (this.accentType === 1) col = globalAccentColor;
      else if (this.accentType === 2) col = globalDarkAccentColor;
      else col = this.baseColor;
      
      linesLayer.stroke(col);
      linesLayer.strokeWeight(this.weight);
      linesLayer.line(this.startX, this.startY, nextX, nextY);
      
      this.x = nextX;
      this.y = nextY;
    }
    
    // If it goes off top or side, kill to spawn a new one later
    let deathLeftBound = started ? windowWidth * 0.4 : windowWidth * 0.65;
    if (this.y < -50 || this.x < deathLeftBound || this.x > width + 50) {
      this.isDead = true;
    }
  }
  
  pickNewTarget() {
    let currentTranquility = tranquility;
    if (elapsedTime > 0) {
      let timeFactor = constrain(elapsedTime / maxTimerMs, 0, 1);
      // As timeFactor goes from 0 to 1, currentTranquility goes from tranquility to 0 (erratic)
      currentTranquility = lerp(tranquility, 0, timeFactor);
    }
    
    // tranquility ranges from 0 (crazy) to 100 (calm)
    let craziness = map(currentTranquility, 0, 100, 1, 0); 
    
    let dir;
    if (this.lastDir === "UP") {
      dir = random(["LEFT", "RIGHT"]);
    } else {
      dir = "UP";
    }
    
    // Bounce if it goes out of the right side zone
    let leftBounceBound = started ? windowWidth * 0.55 : windowWidth * 0.7;
    if (this.x < leftBounceBound && dir === "LEFT") dir = "RIGHT";
    if (this.x > windowWidth - 50 && dir === "RIGHT") dir = "LEFT";
    
    // Lengths are purely random and not affected by chaos
    let segLength;
    if (dir === "UP") {
      segLength = random(50, 150); // Sustains upward stream structure
    } else {
      segLength = random(30, 40);  // Quick horizontal cornering
    }
    
    if (dir === "UP") {
      this.targetX = this.x;
      this.targetY = this.y - segLength;
    } else if (dir === "LEFT") {
      this.targetX = this.x - segLength;
      this.targetY = this.y;
    } else {
      this.targetX = this.x + segLength;
      this.targetY = this.y;
    }
    
    this.lastDir = dir;
    
    // Update the starting location so we can draw the live line
    this.startX = this.x;
    this.startY = this.y;
    this.pickNewColor();
    this.hasReached = false;
  }
  
  pickNewColor() {
    let accentChance = 0;
    if (chaos < 0.35) {
      accentChance = map(chaos, 0, 0.25, 50, 0); // Green decreasing
    } else if (chaos > 0.65) {
      accentChance = map(chaos, 0.35, 1, 0, 90); // Red capped at exactly 90% max
    }
    
    if (random(100) < accentChance) {
      this.accentType = random() < 0.5 ? 1 : 2; // 50/50 split between bright and dark accent
    } else {
      this.accentType = 0; // Gray/white
    }
    
    let shade = random([100, 150, 200, 255]);
    this.baseColor = color(shade);
  }
}