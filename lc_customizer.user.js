// ==UserScript==
// @name         LC customizer
// @version      0.0.4
// @description  Add nifty stuff to lofi.chat website
// @author       Iron-Wolf (https://github.com/Iron-Wolf)
// @include      http*://lofi.chat/*
// @icon         https://lofi.chat/favicon.ico
// @icon         https://www.google.com/s2/favicons?domain=lofi.chat
// @updateUrl    https://github.com/Iron-Wolf/Userscripts/raw/master/lc_customizer.user.js
// @grant        none
// @license      MIT
// ==/UserScript==

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContext();
const compressor = audio.createDynamicsCompressor();


/* ~~~ MAIN ~~~ */
(function() {
    compressor.connect(audio.destination);
    // wait page load...
    setTimeout(function(){ main(); }, 3000);
})();

function main() {
    // div containing messages
    var targetDiv = document.querySelector('div.gradient')

    // add style only to the last messages (already in chat)
    var length = targetDiv.childNodes.length;
    for (var i = length-20; i < targetDiv.childNodes.length; i++) {
        var node = targetDiv.childNodes[i];
         if (node.innerHTML.includes('**')) {
             node.style.color = 'gray';
         }
    }

    // setup the observer
    var configObs = { childList: true }
    var observer = new MutationObserver(mCallback)
    observer.observe(targetDiv, configObs)
}


/* ~~~ METHODS ~~~ */
function mCallback(mutations) {
    mutations.forEach(function(mutation) {
        // callback for each mutation
        if (mutation.type === 'childList') {
            // a child node has been added or removed
            var node = mutation.addedNodes[0];
            if (typeof node === typeof undefined) {
                return;
            }

            var today = new Date();
            var options = {hour: 'numeric', minute: '2-digit', second: '2-digit'};
            // set "undefined" to use the default browser locale
            var formatTime = new Intl.DateTimeFormat(undefined, options).format(today);
            //var formatTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
            node.innerHTML = formatTime + ' ' + node.innerHTML;

            // test if it's a technical comment
            if (node.innerHTML.includes('**')) {
                node.style.color = 'gray';
            }
            else {
                // play a beep for other messages
                //beep(0.20, 440, 100);
                // "blip" sound
                //(new SoundPlayer(audio)).play(440, 0.08, "square").setFrequency(880, 0.1).stop(0.2);
                // gradient sound
                (new SoundPlayer(audio,compressor)).play(440, 0.8, "sine", 0.1).setVolume(0.001,0.55).stop(0.6);
            }
        }
    })
}

/* Beep Boop */
function beep(volume, freq, duration) {
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    // wave form to reduce volume (scaled with the input volume)
    let waveArray = new Float32Array(4);
    waveArray[0] = volume;
    waveArray[1] = volume/2;
    waveArray[2] = 0;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = volume;
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';

    oscillator.start();

    setTimeout(
        function() {
            // remove 'click' sound by reducing the volume (effect applied for 0.1 second)
            gainNode.gain.setValueCurveAtTime(waveArray, audioCtx.currentTime, 0.1);
            //oscillator.stop();
        },
        duration
    );
}


// Original JavaScript code by Chirp Internet:
// https://www.the-art-of-web.com/javascript/creating-sounds/
function SoundPlayer(audioContext, filterNode) {
  this.audioCtx = audioContext;
  this.gainNode = this.audioCtx.createGain();
  if(filterNode) {
    // run output through extra filter (already connected to audioContext)
    this.gainNode.connect(filterNode);
  } else {
    this.gainNode.connect(this.audioCtx.destination);
  }
  this.oscillator = null;
}

SoundPlayer.prototype.setFrequency = function(val, when) {
  if(this.oscillator !== null) {
    if(when) {
      this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime + when);
    } else {
      this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime);
    }
  }
  return this;
};

SoundPlayer.prototype.setVolume = function(val, when) {
  if(when) {
    this.gainNode.gain.exponentialRampToValueAtTime(val, this.audioCtx.currentTime + when);
  } else {
    this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
  }
  return this;
};

SoundPlayer.prototype.setWaveType = function(waveType) {
  this.oscillator.type = waveType;
  return this;
};

SoundPlayer.prototype.play = function(freq, vol, wave, when) {
  this.oscillator = this.audioCtx.createOscillator();
  this.oscillator.connect(this.gainNode);
  this.setFrequency(freq);
  if(wave) {
    this.setWaveType(wave);
  }
  this.setVolume(1/1000);
  if(when) {
    this.setVolume(1/1000, when - 0.02);
    this.oscillator.start(when - 0.02);
    this.setVolume(vol, when);
  } else {
    this.oscillator.start();
    this.setVolume(vol, 0.02);
  }
  return this;
};

SoundPlayer.prototype.stop = function(when) {
  if(when) {
    this.gainNode.gain.setTargetAtTime(1/1000, this.audioCtx.currentTime + when - 0.05, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + when);
  } else {
    this.gainNode.gain.setTargetAtTime(1/1000, this.audioCtx.currentTime, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + 0.05);
  }
  return this;
};

