class Notation{
    // Scale modes
    notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    modes = {
        'Major':            [2, 2, 1, 2, 2, 2, 1],
        'Minor':            [2, 1, 2, 2, 1, 2, 2],
        'Harmonic Minor':   [2, 1, 2, 2, 1, 3, 1],
        'Phrygian':         [1, 2, 2, 2, 1, 2, 2],
        'Gypsy Major':      [1, 3, 1, 2, 1, 3, 1],
        'Chromatic':        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]     
    }


    noteFrequencies = {
    'C':    [261.63], // Frequency for C3
    'C#':   [261.63 * Math.pow(2, 1/12)], // C#3
    'D':    [261.63 * Math.pow(2, 2/12)], // D3
    'D#':   [261.63 * Math.pow(2, 3/12)], // D#3
    'E':    [261.63 * Math.pow(2, 4/12)], // E3
    'F':    [261.63 * Math.pow(2, 5/12)], // F3
    'F#':   [261.63 * Math.pow(2, 6/12)], // F#3
    'G':    [261.63 * Math.pow(2, 7/12)], // G3
    'G#':   [261.63 * Math.pow(2, 8/12)], // G#3
    'A':    [261.63/2 * Math.pow(2, 9/12)], // A3
    'A#':   [261.63/2 * Math.pow(2, 10/12)], // A#3
    'B':    [261.63/2 * Math.pow(2, 11/12)] // B3
};

    // Constructor
    constructor(scale = 'E', mode = 'minor'){
        this.scale = scale;
        this.mode = mode; 
        this.strings = this.strings;
        this.octaveNum = 4;
    }


    // Will generate scale given root note and mode
    generateScale(root, mode) {
        if (!this.notes.includes(root)) {
            throw new Error('Invalid root note');
        }
        if (!this.modes.hasOwnProperty(mode)) {
            throw new Error('Invalid mode');
        }
        const semitones = this.modes[mode];
        let scale = [];
        let rootIndex = this.notes.indexOf(root);
        scale.push(this.notes[rootIndex]); // Start with the root note
        for (let interval of semitones) {
            rootIndex = (rootIndex + interval) % this.notes.length;
            scale.push(this.notes[rootIndex]);
        }
        return scale;
    }


    getChordList(scale){
        let chords = [];
        for (let i = 0; i <= scale.length - 2; i++) {
            const chordRoot = scale[i];
            const third = scale[(i + 2) % (scale.length-1)];
            const fifth = scale[(i + 4) % (scale.length-1)];
            const seventh = scale[(i + 6) % (scale.length-1)];        
            chords.push([chordRoot, third, fifth, seventh]);
        }
        return chords;
    }

    
    getNoteFromKey(key) {
    // Map keys to notes and octaves (example)
    const keyNoteMap = {
      'A': { note: 'C',     octave: this.octaveNum },
      'W': { note: 'C#',    octave: this.octaveNum },
      'S': { note: 'D',     octave: this.octaveNum },
      'E': { note: 'D#',    octave: this.octaveNum },
      'D': { note: 'E',     octave: this.octaveNum },
      'F': { note: 'F',     octave: this.octaveNum },
      'T': { note: 'F#',    octave: this.octaveNum },
      'G': { note: 'G',     octave: this.octaveNum },
      'Y': { note: 'G#',    octave: this.octaveNum },
      'H': { note: 'A',     octave: this.octaveNum },
      'U': { note: 'A#',    octave: this.octaveNum },
      'J': { note: 'B',     octave: this.octaveNum },
      'K': { note: 'C',     octave: this.octaveNum + 1 },
    };
    return keyNoteMap[key.toUpperCase()];
  }

  findChordListIndex(root){
    for (let i = 0; i < state['chord_list'].length; i++){
       if (state['chord_list'][i][0] === root){
            return i;
       } 
    }
}
    
}