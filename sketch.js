let started = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  
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
      background(0);
    }, 500);
    
    // Start the art
    started = true;
    loop(); // Unpause the p5.js loop
  });
}

function draw() {
  if (!started) return; 
  
  // A slightly transparent background creates the trailing fade effect
  background(0, 40);
  
  // Trace the cursor movement
  stroke(255);
  strokeWeight(2);
  line(pmouseX, pmouseY, mouseX, mouseY);

  // --- TERMINAL EFFECT ---
  
  // Add a new log every 4 frames (so it doesn't move too fast to read)
  if (frameCount % 4 === 0) {
    terminalLogs.push(generateFakeLog()); // Add new line to the end
    
    // If we have more lines than fit on screen, remove the oldest one (the first one)
    if (terminalLogs.length > maxLogs) {
      terminalLogs.shift(); 
    }
  }

  // Draw the text
  textAlign(LEFT, TOP);
  fill(0, 255, 0, 200); // Classic hacker green, slightly transparent
  noStroke(); // Make sure the text doesn't have outlines
  
  // Loop through our list and draw each line slightly lower than the last
  for (let i = 0; i < terminalLogs.length; i++) {
    // text(string, x, y)
    text(terminalLogs[i], 20, 20 + (i * 18)); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (started) {
    background(0);
  } else {
    background(255);
  }
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
  
  // 10% chance it says ERR instead of OK to look glitchy
  let status = random(100) < 10 ? 'ERROR_FATAL' : 'OK'; 
  
  return `[${hexCode}] ${action} ... ${status}`;
}