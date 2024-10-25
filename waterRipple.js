/*
To do:
Control t variable based on a sine wave (rather than linear change)
- So that the animation will slow down before it starts reversing (smooth transition)
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = 800;
const height = 800;
canvas.width = width;
canvas.height = height;

var animationRequest;
var playAnimationToggle = false;

let t = 0;
const TAU = Math.PI * 2;
let frameCounter = 0;

let framesPerCycle = 600; //number of frames in each forward / reverse play cycle
let colorCycle = false;

//add gui
var obj = {
  animationSpeed: 3,
  complexity: 30,
  trailStrength: 90,
  xMovement: 8,
  yMovement: 12,
  radius: 2,
  baseHue: 250,
  hueRange: 20,
  colorCycle: false,
  spacing: 8,
  backgroundColor: '#0e0e22',
  colorMode: 'TBD',
};

var gui = new dat.gui.GUI( { autoPlace: false } );
//gui.close();
var guiOpenToggle = true;

gui.add(obj, "animationSpeed").min(1).max(30).step(1).name('Animation Speed');
gui.add(obj, "complexity").min(1).max(100).step(1).name('Complexity').listen();
gui.add(obj, "trailStrength").min(0).max(100).step(1).name('Trail Strength').listen();
gui.add(obj, "xMovement").min(0).max(100).step(1).name('X-Movement').listen();
gui.add(obj, "yMovement").min(0).max(100).step(1).name('Y-Movement').listen();
gui.add(obj, "radius").min(1).max(25).step(1).name('Radius').listen();
gui.add(obj, "baseHue").min(0).max(360).step(1).name('Base Hue').listen();
gui.add(obj, "hueRange").min(0).max(360).step(1).name('Hue Range').listen();
gui.add(obj, "colorCycle").name('Color Cycle?').onFinishChange(toggleColorCycle).listen();
gui.add(obj, "spacing").min(2).max(15).step(1).name('Spacing').listen();
gui.addColor(obj, "backgroundColor");
gui.add(obj, 'colorMode', ['TBD']);


obj['refresh'] = function () {
  refreshCanvas();
};
gui.add(obj, 'refresh').name("Restart Animation (r)");

obj['randomizeInputs'] = function () {
randomizeInputs();
};
gui.add(obj, 'randomizeInputs').name("Randomize Inputs");

obj['playAnimation'] = function () {
  pausePlayAnimation();
};
gui.add(obj, 'playAnimation').name("Play/Pause Animation (p)");

obj['saveImage'] = function () {
  saveImage();
};
gui.add(obj, 'saveImage').name("Save Image (s)");

obj['saveVideo'] = function () {
  refreshCanvas();
  toggleVideoRecord();
};
gui.add(obj, 'saveVideo').name("Video Export (v)");

customContainer = document.getElementById( 'gui' );
customContainer.appendChild(gui.domElement);

// Perlin noise implementation
const perlin = (() => {
    const permutation = new Array(256).fill(0).map(() => Math.floor(Math.random() * 256));
    const p = new Array(512).fill(0).map((_, i) => permutation[i % 256]);
    
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(t, a, b) { return a + t * (b - a); }
    function grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    return function(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        const u = fade(x);
        const v = fade(y);
        const w = fade(z);
        
        const A = p[X]+Y;
        const AA = p[A]+Z;
        const AB = p[A+1]+Z;
        const B = p[X+1]+Y;
        const BA = p[B]+Z;
        const BB = p[B+1]+Z;
        
        return lerp(w,
            lerp(v,
                lerp(u, grad(p[AA], x, y, z), grad(p[BA], x-1, y, z)),
                lerp(u, grad(p[AB], x, y-1, z), grad(p[BB], x-1, y-1, z))),
            lerp(v,
                lerp(u, grad(p[AA+1], x, y, z-1), grad(p[BA+1], x-1, y, z-1)),
                lerp(u, grad(p[AB+1], x, y-1, z-1), grad(p[BB+1], x-1, y-1, z-1))));
    };
})();

// Color palette generator
function getColor(x, y, alpha) {
    let noise = perlin(x/200, y/200, t);
    let hue;
    if(colorCycle){
      hue = (obj.baseHue + noise * obj.hueRange + frameCounter/3) % 360;
    } else {
      hue = (obj.baseHue + noise * obj.hueRange) % 360;
    }

    let saturation = 70 + noise * 30;
    let lightness = 50 + noise * 20;
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function animate() {
    // Create longer trails by using lower opacity in background fade
    let backgroundRGB = hexToRgb(obj.backgroundColor);
    ctx.fillStyle = 'rgba('+backgroundRGB.r+','+backgroundRGB.g+','+backgroundRGB.b+','+(1-obj.trailStrength/100)+')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    
    // Draw particles
    for(let y = -height/2; y < height/2; y += obj.spacing) {
        for(let x = -width/2; x < width/2; x += obj.spacing) {
            // Slower, gentler movement
            const r = TAU * perlin(x/10000*obj.complexity, y/10000*obj.complexity, t/3);
            let newX = x + t*(Math.sin(t)*obj.xMovement)*Math.sin(r);
            let newY = y + t*(Math.cos(t/3)*obj.yMovement)*Math.cos(r);
            
            // Calculate alpha for fade out effect
            //const distanceFromCenter = Math.sqrt(x*x + y*y);
            //const alpha = Math.max(0, 1 - distanceFromCenter/800);
            //const alpha = 1;

            ctx.fillStyle = getColor(x, y, 1);            
            ctx.beginPath();
            ctx.arc(newX, newY, obj.radius, 0, TAU);
            ctx.fill();
        }
    }
    
    ctx.restore();
    if(Math.floor(frameCounter/(framesPerCycle))%2==0){
      t += obj.animationSpeed/100;
      console.log("forward");
    } else {
      t -= obj.animationSpeed/100;
      console.log("reverse");
    }
    frameCounter++;
    animationRequest = requestAnimationFrame(animate);

}

playAnimationToggle = true;
animationRequest = requestAnimationFrame(animate);

//HELPER FUNCTIONS

function toggleColorCycle(){
  colorCycle = !colorCycle;
  console.log("toggle color cycle: "+colorCycle);
}

function refreshCanvas() {
  console.log("restart animation");
  t=0;
  frameCounter = 0;
  ctx.fillStyle = obj.backgroundColor;
  ctx.fillRect(0,0,width,height);
}

function randomizeInputs(){
  console.log("Randomize inputs");
  obj.xStretch = Math.random() * 100;
  obj.xSize = Math.random() * 100;
  obj.yStretch = Math.random() * 100;
  obj.ySize = Math.random() * 100;
  
  if(Math.random() < 0.5) {
  obj.movementType = "Wave";
  } else {
  obj.movementType = "Grid";
  }
  
  obj.colorPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)].name;
  changePalette();
}

function pausePlayAnimation(){
  console.log("pause/play animation");
  if(playAnimationToggle==true){
    playAnimationToggle = false;
    cancelAnimationFrame(animationRequest);
    console.log("cancel animation");
  } else {
    playAnimationToggle = true;
    animationRequest = requestAnimationFrame(animate);
  }
}

function toggleGUI(){
  if(guiOpenToggle == false){
      gui.open();
      guiOpenToggle = true;
  } else {
      gui.close();
      guiOpenToggle = false;
  }
  }
  
  //shortcut hotkey presses
  document.addEventListener('keydown', function(event) {
  
  if (event.key === 'r') {
      refreshCanvas();
  } else if (event.key === 's') {
      saveImage();
  } else if (event.key === 'v') {
      refreshCanvas();
      toggleVideoRecord();
  } else if (event.key === 'o') {
      toggleGUI();
  } else if(event.key === 'p'){
      pausePlayAnimation();
  }
  
});