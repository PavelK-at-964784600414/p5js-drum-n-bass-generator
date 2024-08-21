class Sample {
  constructor(path) {
    this.path = path;
    this.volume = 1;
    this.playbackRate = 1; // Default playback rate
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.source = null;
    this.gainNode = this.audioContext.createGain(); // For controlling volume
    this.gainNode.gain.value = this.volume;
    this.isPlaying = false;
    this.buffer = null;
    this.load();
  }

  // Load audio data from the local file
  load() {
    const request = new XMLHttpRequest();
    request.open('GET', this.path, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      this.audioContext.decodeAudioData(request.response, (buffer) => {
        this.buffer = buffer;
      }, (error) => {
        console.error('Error decoding audio data:', error);
      });
    };

    request.send();
  }

  play() {
    if (this.isPlaying) {
      this.stop(); // Stop the previous playback if it's still running
    }

    if (!this.buffer) {
      console.error('Audio buffer is not loaded yet.');
      return;
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.playbackRate.value = this.playbackRate; // Set playback rate
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.source.start();
    this.isPlaying = true;
  }

  stop() {
    if (this.isPlaying && this.source) {
      this.source.stop();
      this.isPlaying = false;
    }
  }

  setVolume(level) {
    this.volume = level;
    this.gainNode.gain.value = this.volume;
  }

  getVolume() {
    console.log(this.volume);
  }

  rate(playbackRate) {
    this.playbackRate = playbackRate;
    if (this.isPlaying && this.source) {
      this.source.playbackRate.value = this.playbackRate; // Adjust playback rate while playing
    }
  }
}

// Usage example:
const sample = new Sample('recorcess/sounds/808_Bass_C3_tuned.wav');

// After ensuring that the audio is loaded, play the sample
setTimeout(() => {
  sample.rate(1.5); // Set playback rate to 1.5x
  sample.play();
}, 1000); // Wait 1 second to ensure audio is loaded
