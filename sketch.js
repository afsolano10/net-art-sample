let started = false;
let terminalLogs = []; // Array to store the terminal logs
let maxLogs = 100; // The maximum number of log lines to show on screen
let startTime = 0;
let elapsedTime = 0;

let tranquility = 50; // 0 (Crazy) to 100 (Calm)
let maxTimerMs = 180000; // 3 minutes constraint for errors and craziness
let linesLayer;
let walkers = [];
let visualSegments = [];
let visualNodes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  
  linesLayer = createGraphics(windowWidth, windowHeight);
  linesLayer.clear();
  
  // Initialize some walkers on the right half of the screen
  for (let i = 0; i < 15; i++) {
    let startX = random(windowWidth * 0.5, windowWidth);
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
      exitButton.style.display = 'block'; // Show the exit button when sketch starts
    }, 500);
    
    // Start the art
    started = true;
    startTime = millis();
    // loop(); // Unpause the p5.js loop
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
  
  if (started) {
    // --- PROCEDURAL LINES VISUAL ---
    linesLayer.clear();
    
    // Draw completed segments
    for (let s of visualSegments) {
      linesLayer.stroke(s.color);
      linesLayer.strokeWeight(s.weight);
      linesLayer.line(s.x1, s.y1, s.x2, s.y2);
    }
    
    // Draw nodes
    for (let n of visualNodes) {
      linesLayer.stroke(n.color);
      linesLayer.strokeWeight(1.5);
      if (n.filled) linesLayer.fill(n.color);
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
        let startX = random(windowWidth * 0.5, windowWidth);
        walkers.push(new Walker(startX, windowHeight));
      }
    }
    image(linesLayer, 0, 0);

    elapsedTime = millis() - startTime;
    
    // Trace the cursor movement
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
  
  let chance = 0;
  if (elapsedTime >= 20000) {
    // Increase error chance from 10% to 100% over the max timer
    chance = map(elapsedTime, 0, maxTimerMs, 10, 100);
    chance = constrain(chance, 10, 100);
  }
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
  }
  
  update() {
    if (this.isDead) return;
    
    if (this.hasReached) {
      // Save node to global visual array
      let filled = random() <= 0.5;
      visualNodes.push({
        x: this.x, y: this.y, 
        size: this.nodeSize, color: this.color, filled: filled
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
      
      if (distToTarget <= this.speed) {
        nextX = this.targetX;
        nextY = this.targetY;
        this.hasReached = true;
        
        // Save completed segment
        visualSegments.push({
          x1: this.startX, y1: this.startY,
          x2: nextX, y2: nextY,
          color: this.color, weight: this.weight
        });
        if (visualSegments.length > 200) visualSegments.shift();
      } else {
        let ratio = this.speed / distToTarget;
        nextX += dx * ratio;
        nextY += dy * ratio;
      }
      
      // Draw the actively growing line directly to linesLayer
      linesLayer.stroke(this.color);
      linesLayer.strokeWeight(this.weight);
      linesLayer.line(this.startX, this.startY, nextX, nextY);
      
      this.x = nextX;
      this.y = nextY;
    }
    
    // If it goes off top or side, kill to spawn a new one later
    if (this.y < -50 || this.x < windowWidth * 0.4 || this.x > width + 50) {
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
    
    // Chance to go UP vs LEFT/RIGHT
    let upProb = map(craziness, 0, 1, 0.9, 0.33); 
    
    let r = random();
    let dir = "UP";
    if (r > upProb) {
      dir = random(["LEFT", "RIGHT"]);
    }
    // Bounce if it goes out of the right side zone
    if (this.x < windowWidth * 0.55 && dir === "LEFT") dir = "RIGHT";
    if (this.x > windowWidth - 50 && dir === "RIGHT") dir = "LEFT";
    
    let baseLength = map(craziness, 0, 1, 150, 20); // Length of segment
    let segLength = baseLength + random(-baseLength*0.4, baseLength*0.4);
    
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
    
    // Update the starting location so we can draw the live line
    this.startX = this.x;
    this.startY = this.y;
    this.pickNewColor();
    this.hasReached = false;
  }
  
  pickNewColor() {
    let chance = 0;
    if (elapsedTime >= 20000) {
      chance = map(elapsedTime, 0, maxTimerMs, 10, 100);
      chance = constrain(chance, 10, 100);
    }
    
    if (random(100) < chance) {
      this.color = color(255, 0, 0); // Red
    } else if (random() > 0.8) {
      this.color = color(0, 255, 0); // Code Green
    } else {
      let shade = random([100, 150, 200, 255]);
      this.color = color(shade);
    }
  }
}