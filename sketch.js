let started = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20, 20, 20);
  
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
      background(20, 20, 20);
    }, 500);
    
    // Start the art
    started = true;
    loop(); // Unpause the p5.js loop
  });
}

function draw() {
  if (!started) return; 
  
  // Trace the cursor movement
  stroke(255);
  strokeWeight(2);
  line(pmouseX, pmouseY, mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(20, 20, 20);
}