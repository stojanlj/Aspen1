let song;
let base = 0;
let buttonJump;
let amp;
let len;
let fft;
let loudestFreq;
let vol = 0;
let s_0 = 0;
let intervals = 0;
let vol_0 = 0;
let avg_vol = 0;
let y = 0;
let mic;
let micOn = false;
let counter = 0;
let colorSlider;
let textColor, bkgdColor;
let volRecord = [];
let volIndex = 0;

function setup() {
  Splitting();
  
  buttonJump = createButton("Skip ahead");
  buttonJump.mousePressed(jumpSong);
  
  buttonStart = createButton("Start over");
  buttonStart.mousePressed(startOver);
  
  buttonVivaldi = createButton("Song I / Vivaldi");
  buttonVivaldi.mousePressed(playVivaldi);

  buttonMozart = createButton("Song II / Mozart");
  buttonMozart.mousePressed(playMozart);
  
  buttonMic = createButton("Microphone");
  buttonMic.mousePressed(toggleMic);
  
  colorSlider = createSlider(0, 3, 0, 1);
  colorLabel = createSpan("COLOR /");
  colorLabel.style('font-family', '"arsenica-variable", sans-serif');
  colorLabel.style('font-variation-settings', '"opsz" 100, "wght" 475');
  colorLabel.style('font-size', '0.75em');
  colorLabel.style('letter-spacing', '0.055rem');
    
  vivaldi = loadSound("Vivaldi.mp3");
  mozart = loadSound("Mozart.mp3");
  
  song = vivaldi;
  
  amp = new p5.Amplitude();
  mic = new p5.AudioIn();
  len = song.duration();
  fft = new p5.FFT(0.2, 1024);
}


function playVivaldi() {
  if (micOn == true) {
    mic.stop();
  }
  micOn = false;
  
  fft = new p5.FFT(0.2, 1024);
  amp = new p5.Amplitude();
  song = vivaldi;

  if (!vivaldi.isPlaying()) {
    vivaldi.play();
    mozart.pause();
  } else {
    vivaldi.pause();
  }
}

function playMozart() {
  if (micOn == true) {
    mic.stop();
  }
  micOn = false;
  
  fft = new p5.FFT(0.2, 1024);
  amp = new p5.Amplitude();
  song = mozart;

  if (!mozart.isPlaying()) {
    mozart.play();
    vivaldi.pause();
  } else {
    mozart.pause();
  }
}


function toggleMic() {
  if (micOn == false) {
    micOn = true;
    useMic();
  } else {
    micOn = false;
    mic.stop();
  }
}

function useMic() {
  mic.start();
  fft.setInput(mic);
  mozart.pause();
  vivaldi.pause();
}

function jumpSong() {
  let len = song.duration();
  let t;
  if (mozart.isPlaying()) {
    t = (75/120)*len;
  } else {
    t = (150/176)*len;
  }
  song.jump(t);
}

function startOver() {
  let len = song.duration();
  song.jump(0);
}



function getLoudestFrequency() {
    var nyquist = sampleRate() / 2; 
    var spectrum = fft.analyze(); 
    var numberOfBins = spectrum.length;
    var maxAmp = 0;
    var largestBin;

    for (var i = 0; i < numberOfBins; i++) {
        var thisAmp = spectrum[i]; 
        if (thisAmp > maxAmp) {
            maxAmp = thisAmp;
            largestBin = i;
        }
    }

    loudestFreq = largestBin * (nyquist / numberOfBins);
    return loudestFreq;
}


// function recordVol(x) {
//   if (vol > 0.003) {
//     volRecord[volIndex] = vol;
//     volIndex++;
//   } else {
//     volIndex = volIndex;
//   }
  
//   console.log(min(volRecord), max(volRecord));
// }


function draw() {
  let box = select(".box");
  
  buttonVivaldi.position(
    10,
    box.size().height + 10
  );
  
  buttonMozart.position(
    buttonVivaldi.size().width + 20,
    buttonVivaldi.position().y
  );
  
  buttonStart.position(
    buttonMozart.size().width + buttonVivaldi.size().width + 30,
    buttonVivaldi.position().y
  );
  
  buttonJump.position(
    buttonMozart.size().width + buttonVivaldi.size().width + buttonStart.size().width + 40,
    buttonVivaldi.position().y
  );
  
  buttonMic.position(
    buttonMozart.size().width + buttonVivaldi.size().width + buttonStart.size().width + buttonJump.size().width + 50,
    buttonVivaldi.position().y
  );
  
  colorLabel.position(
    buttonMozart.size().width + buttonVivaldi.size().width + buttonStart.size().width + buttonJump.size().width + buttonMic.size().width + 80,
    buttonVivaldi.position().y + 7
  );
  
  colorSlider.position(
    buttonMozart.size().width + buttonVivaldi.size().width + buttonStart.size().width + buttonJump.size().width + buttonMic.size().width + colorLabel.size().width + 85,
    buttonVivaldi.position().y + 9
  );
  
  smooth();
  if (micOn == false) {
      vol = amp.getLevel();
    } else {
      vol = mic.getLevel();
      if (vol < 0.03) {
        vol = vol / 4;
      } else {
        vol = vol / 1.4;
      }
    }
  let interval;

  vol_1 = vol;

  interval = abs(vol_1 - vol_0);

  vol_0 = vol_1;
  intervals += interval;
  
  avg_vol = intervals / frameCount;  
  
  let chars = selectAll(".char");  
  
  for (let i = 0; i < chars.length; i++) {
    let char = chars[i];
    
    getLoudestFrequency();
      
    let x = map(avg_vol, 0.001, 0.00675, 0, 5);
    if (vol > 0) {
      y = map(loudestFreq, 50, 6000, 1, -1);
    }
    
    base = map(vol*y*sin(0.02*x*frameCount + i), -0.1, 0.1, -100, 100);
    if (i == 4) {
      base = -base;
    } else if (!song.isPlaying() && micOn == false){
      base = 0;
    } else {
      base = base;
    }
    
    
    char.style("font-variation-settings", "'base' " + base);
    char.style("color", textColor);
    
    box.style("background-color", bkgdColor);
    box.style("height", "92vh");
  }
  
  if (colorSlider.value() == 0) {
    textColor = '#ffffff';
    bkgdColor = '#000000';
  } else if (colorSlider.value() == 1) {
    textColor = '#FFC145';
    bkgdColor = '#06360c';
  } else if (colorSlider.value() == 3) {
    textColor = '#86c3d1';
    bkgdColor = '#073507';
  } else {
    textColor = '#074908';
    bkgdColor = '#87C0C9';
  }
  
}