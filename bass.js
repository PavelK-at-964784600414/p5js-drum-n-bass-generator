class Bass extends Instrument {
    constructor(cellSize, notation) {
        super(cellSize, state['beats_parts'], instruments['bass']['sounds'], instruments['bass']['offset'], 'bass');
        this.notation = notation;
        this.xOffsetButtonPanel = 110;
        this.noteFrequencies = this.notation.noteFrequencies;

        // Create an oscillator
        this.osc = new p5.Oscillator('sine');
        
        // Create an envelope
        this.env = new p5.Envelope();
        this.env.setADSR(0.03, 0.3, 0.4, 0.2); // Attack, Decay, Sustain, Release
        this.env.setRange(10, 0); // Attack level, Release level

        // Create a filter
        this.reverb = new p5.Reverb();
        // Connect the oscillator to the filter, and the filter to the output
        this.osc.disconnect();
        this.reverb.process(this.osc, 0.3, 1);


        this.osc.start();
        this.osc.amp(0); // Start with zero amplitude
        super.createGrid();
        this.drawGrid();
    }
    

    processPattern(pattern) {
        let newList = [...pattern]; // Create a copy of the pattern
        // Helper function to generate a random number between 0 and 1
        function randomChance() {
            return Math.random();
        }
    
        // Rule 1: Process each index where i % 4 != 0
        for (let i = 0; i < pattern.length; i++) {
            if (i !== 0 && pattern[i] === 0) {
                let chance = randomChance();
                if (chance < 0.2) {
                    newList[i] = 2;
                } else if (chance < 0.4) {
                    newList[i] = 1;
                } else if(chance < 0.6){
                    newList[i] = 3;
                }
                else{
                    newList[i] = 0;
                }
                
            }

        }
        return newList;
    }
    
    createBassBeatChordPattern(){
        let chordComponents = [];
        for (let i = 0; i < state['beats_parts']; i++) {
            if(instruments['drums']['grid'][0][i].active){
                append(chordComponents, 0);
            } else {
                append(chordComponents);
            }
        }
        return chordComponents;
    }

    drumAndBassLine(){
        let pattern = this.processPattern(this.createBassBeatChordPattern());
        for (let i = 0; i < this.sounds.length; i++) {
            for (let j = 0; j < this.beats; j ++)
            {
                instruments['bass']['grid'][i][j].active = instruments['drums']['grid'][0][j].active;
                if (pattern[j] !== undefined){
                    let chordIndex = this.notation.findChordListIndex(state['chord_progression'][i]);
                    instruments['bass']['grid'][i][j].sound = state['chord_list'][chordIndex][pattern[j]];
                }
            }
        }
    }

 

    drawGrid() {
        const gridStartX = this.xOffset + this.xOffsetButtonPanel;
        const gridStartY = this.yOffset;
        const boxSize = 61; 
        const gap = 0;

        for (let i = 0; i < this.sounds.length; i++) {
            const x = gridStartX + i * (boxSize + gap);
            const y = gridStartY;

            // Highlight the current chord
            if (i === state['current_chord_index']) {
                fill(beatMarkColor); // Highlight color
            } else {
                fill(drumCellColor); // Regular color
            }

            // Draw the square
            rect(x, y, boxSize, boxSize/3);

            // Draw the chord name
            textSize(15);
            textAlign(CENTER, CENTER);
            if (i === state['current_chord_index'] && state['is_playing']) {
                fill(beatPositionColor); // Text color
                text(this.sounds[i] ? this.sounds[i] : 'None', x + boxSize / 2, y + boxSize/5);
            } else {
                fill(backGroundColor); // Text color
                text(this.sounds[i] ? this.sounds[i] : 'None', x + boxSize / 2, y + boxSize/5);  
            }
        }
    }

    // Set volume of the bass
    setVolume(level) {
        this.osc.amp(level); // Set the global amplitude (volume) of the oscillator
    }
  
    // Play note
    playPitch(note, octave = 0 ) {
        if (octave != 0) {
            console.error(`Octave "${octave}" is out of range. Please use an octave between 0 and 7.`);
            return;
        }
        let frequency = this.noteFrequencies[note][0];
       
        if (frequency) {
            let playbackRate = frequency / 261.63; // C3 reference note
            bass808.rate(playbackRate); // Set the sample playback rate
            bass808.play(); // Play the sample
        } else {
            console.error(`Note "${note}" is not defined.`);
        }
    }
}
