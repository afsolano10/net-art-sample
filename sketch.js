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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (started) {
    background(0);
  } else {
    background(255);
  }
}