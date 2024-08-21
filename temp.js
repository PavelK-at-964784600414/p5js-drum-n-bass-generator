//sketch.js
let maestor;

function setup() {
  createCanvas(1000, 607);
  maestor = new Maestor(width, height);
  startAudioContext();
}

function draw() {
  noLoop();
}

//bass.js
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
    playPitch(note, octave = 1 ) {
        if (octave < 0 || octave > 7) {
            console.error(`Octave "${octave}" is out of range. Please use an octave between 0 and 7.`);
            return;
        }
        let frequencies = this.noteFrequencies[note];

        if (frequencies) {
            let frequency = frequencies[octave];
            this.osc.freq(frequency); // Set the oscillator frequency to the note's frequency
            this.osc.amp(this.env); // Connect the envelope to the oscillator amplitude
            this.env.play(); // Play the envelope
            frequency = frequencies[octave+1];
            this.osc.freq(frequency); // Set the oscillator frequency to the note's frequency
            this.osc.amp(this.env); // Connect the envelope to the oscillator amplitude
            this.env.play(); // Pl
            // Automate the cutoff change to 80% over 0.2 seconds
            //this.filter.freq(22050, 0, 0.2, 200); // Reduce to 20% (80% cutoff)
        } else {
            console.error(`Note "${note}" is not defined.`);
        }
    }
}


//drums.js
class Drums extends Instrument{
    constructor(cellSize) {
        super(cellSize, state['beats_parts'], instruments['drums']['sounds'], instruments['drums']['offset'], 'drums');
        super.createGrid();
        super.drawGrid();
        this.setVolume();
        this.createButtons();
    }

    // Sets volume of the drum rack
    setVolume(level = 0.02){
        for (let i = 0; i < this.sounds.length; i++)
        {
            this.sounds[i].setVolume(level);
        }
        this.sounds[0].setVolume(0.2)
    }

    // Create the drum sample bottons
    createButtons() {
        const buttonConfigs = [
            { label: 'Kick', soundIndex: 0 },
            { label: 'Snare', soundIndex: 1 },
            { label: 'Hi-Hat closed', soundIndex: 2 },
            { label: 'Ride', soundIndex: 3 },
            { label: 'Crash', soundIndex: 4 }
        ];
    
        buttonConfigs.forEach((config, index) => {
            const button = createButton(config.label);
            button.position(this.xOffset, this.yOffset + this.cellSize * index);
            button.style('background-color', 'black');
            button.style('color', beatMarkColor); 
            button.mousePressed(() => this.sounds[config.soundIndex].play());
            this[`button${index + 1}`] = button; // Optionally store buttons in an array or object
        });
    }

}

//fretboard.js
class FreatBoard{
    // Constuctor
    constructor(width = 1200, height = 280, numStrings = 8, numFrets = 24, drop = true){
        this.standartNoteNames = [
            ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'],
            ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#'],
            ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#'],
            ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'],
            ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
            ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'],
            ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#'],
            ['F#','G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F']
        ];
        this.notation = new Notation();
        this.numFrets = numFrets;
        this.numStrings = numStrings;
        this.fretboardWidth = width - 100;  // Reduce width by 100 pixels
        this.fretboardHeight = height - 50; // Reduce height by 50 pixels
        this.stringSpacing = this.fretboardHeight / (this.numStrings + 1); // Spacing between strings
        this.offsetX = (width - this.fretboardWidth) / 2 + 10; // Calculate x offset to center the fretboard
        this.offsetY = (height - this.fretboardHeight) / 2 + 70; // Calculate y offset to center the fretboard
        this.markerFrets = [2, 4, 6, 8, 11, 14, 16, 18, 20, 23]; // Common positions for fret markers
        this.stringOptions = {'8 strings: ': 8, '7 strings': 7, '6 strings': 6};
        this.fretBaordNoteNames = this.generateNoteNames(drop);     
        this.r = 5 
        this.adaptedFretboardHeight = this.fretboardHeight * this.numStrings / 8
        this.fretMarkerSize = 20;

        //TODO: make nice pattern to fill the background of the fretboard  
        /* 
        this.pattern = createGraphics(100, 100); // Adjust size as needed
        this.createPattern(this.pattern);
        // Set pattern mode
        this.pattern.noFill();
        this.pattern.noStroke();
       // this.pattern.patternMode(REPEAT);
        */

    }

    //for the patter fill if the fretboard background usage
    createPattern(pg) {
        pg.background(255, 255, 255, 0); // Transparent background
        pg.stroke(0);
        pg.strokeWeight(2);
    
        // Draw your custom pattern here
        for (let x = 0; x < pg.width; x += 20) {
            for (let y = 0; y < pg.height; y += 20) {
                pg.line(x, y, x + 10, y + 10);
                pg.line(x + 10, y, x, y + 10);
            }
        }
    }
  
    changeFretboardHeight(){
        this.adaptedFretboardHeight = this.fretboardHeight * this.numStrings / 8
    }

    // Create fretboard note names
    generateNoteNames(drop){
        // all the standart notation to 8 string guitar, will be as tamplte for 7, 6 string
        let noteNames = [];
        for (let string = 0; string < this.numStrings; string++) {
            noteNames[string] = [];
            for (let note = 0; note < 12; note++){
                noteNames[string][note] = this.standartNoteNames[string][note];
            }
        }
        // In case drop tuning, last string shift 2 steps down
        if (drop === true)
            noteNames[noteNames.length - 1] = noteNames[noteNames.length - 1].slice(10).concat(noteNames[noteNames.length - 1].slice(0, 10));
        return noteNames;
    }

    
    // Draw teh fretboard
    drawFretboard() {
        noStroke();
        fill('#d4a853');
        rect(0, this.offsetY +10,this.fretboardWidth, this.adaptedFretboardHeight - 20);
        this.drawMarkers();
        this.drawFrets();
        this.drawStrings();
        return this.drawNotes();
    }


    // Draw strings
    drawStrings(){
        for (let i = 1; i <= this.numStrings; i++) {
            strokeWeight(i);
            line(0, this.offsetY + i * this.stringSpacing, this.offsetX + this.fretboardWidth, this.offsetY + i * this.stringSpacing);
            fill(beatMarkColor);
            text(this.fretBaordNoteNames[i-1][0], 5, this.offsetY + i * this.stringSpacing);
        }
    }


    // Draw frets with progressive width reduction
    drawFrets(){
        stroke(backGroundColor);
        strokeWeight(3);
        let currentX = this.offsetX;
        for (let j = 0; j <= this.numFrets; j++) {
            let fretWidth = (this.fretboardWidth / (this.numFrets + 1)) * (1 - (j / (this.numFrets * 4))); // Progressive reduction
            line(currentX, this.offsetY +10, currentX, this.offsetY + this.adaptedFretboardHeight - 10);
            currentX += fretWidth;
        } 
    }

    fillColorText(c, mode = false) {
        let r = lerp(250, 242, c); // Interpolates red from 255 to 0
        let g = lerp(127, 68, c);               // Green stays 0
        let b = lerp(8, 5, c); // Interpolates blue from 0 to 255
        fill(r, g, b);
      }

    fillColor(c) {
        let r = lerp(242, 0, c); // Interpolates red from 255 to 0
        let g = lerp(68, 0, c);               // Green stays 0
        let b = lerp(5, 0, c); // Interpolates blue from 0 to 255
        fill(r, g, b);
    }
       
    // TODO: to add feature of eneble and disalbe the 7th chords need to edit this line:
    // TODO2: add here the rest of notes in the scale when the chord play but rest of the notes are transparent
    enumerateNote(note, currentX, fretWidth, string){
        strokeWeight(1);
        noStroke();
        let musicStructure = state['is_playing'] ? state['seventh'] ? state['current_chord']: state['current_chord'].slice(0, 3) : state['scale_notes']; 
        if (state['is_playing'] && state['scale_notes'].includes(note)){
            fill(0, 100);
            square(currentX - fretWidth / 2 - 10, this.offsetY + (string + 1) * this.stringSpacing - 10, 20, this.r);
        }
        if (musicStructure.includes(note)) {
            let c = map(musicStructure.indexOf(note), 0, musicStructure.length - 1, 0, 1);
            this.fillColor(c);
            if(note === musicStructure[0]){
                var rootNote = {}
                //fill(beatPositionColor);
                rootNote['xPos'] =  currentX - fretWidth / 2 - 15;
                rootNote['yPos'] =  this.offsetY + (string + 1) * this.stringSpacing - 15;
                rootNote['size'] =  30;
                rootNote['edgeRadius'] =  this.r;

                square(rootNote['xPos'], rootNote['yPos'], rootNote['size'], rootNote['edgeRadius']);
                //square(currentX - fretWidth / 2 - 12.5, this.offsetY + (string + 1) * this.stringSpacing - 12.5, 25, this.r);
            }
            square(currentX - fretWidth / 2 - 10, this.offsetY + (string + 1) * this.stringSpacing - 10, 20, this.r);
            this.fillColorText(c); // Example color using the variable 'c'
            //fill(additionalColor);
            stroke(0);
            text(note, currentX - fretWidth / 2, this.offsetY + (string + 1) * this.stringSpacing);
            text(musicStructure.indexOf(note) + 1, currentX - fretWidth / 2 -17, this.offsetY + (string + 1) * this.stringSpacing);
        }

        return rootNote;
    } 
 

    drawRootNotes(rootNotes) {
        stroke(beatPositionColor);
        stroke(0);

        for (let i = 0; i < rootNotes.length; i++) {
            if (rootNotes[i] === undefined)
                continue;
            noFill()
            strokeWeight(5);
            if(state['current_beat_part'] % 8 < 4)
                stroke(beatPositionColor);
            else
                stroke(additionalColor);
            square(rootNotes[i]['xPos'] + 3, rootNotes[i]['yPos'] + 3, rootNotes[i]['size'] - 6, rootNotes[i]['edgeRadius']);
        }
      }


    // Draw notes
    drawNotes(){
        var rootNotes = [];
        //strokeWeight(0.2);
        textAlign(CENTER, CENTER);
        textSize(17);
        //stroke(255);
        let currentX = this.offsetX; // Reset currentX for note placement
        //let chords = this.notation.getChordList(scaleNotes);
        //let scaleNotes = this.scales[selectedScale];
        // Draw the fret number
        for (let fret = 0; fret <= this.numFrets; fret++) {
            let fretWidth = (this.fretboardWidth / (this.numFrets + 1)) * (1 - (fret / (this.numFrets * 4))); // Progressive reduction
            fill(drumCellColor);
            text(fret, currentX - fretWidth / 2, this.offsetY + 1);
            text(fret, currentX - fretWidth / 2, this.offsetY + this.adaptedFretboardHeight + 3);
            // Draw the notes
            for (let string = 0; string < this.numStrings; string++) {
                
                let note = this.fretBaordNoteNames[string][fret % 12];
                let fretWidth = (this.fretboardWidth / (this.numFrets + 1)) * (1 - (fret / (this.numFrets * 4))); // Progressive reduction
                
                append(rootNotes, this.enumerateNote(note, currentX, fretWidth, string));
            }
            currentX += fretWidth;
        }
        stroke(0);
        return rootNotes;
    }


    // *** TODO: need to combain this funcion with drawNotes() together to the sameme loop ***
    // Draw fret markers for better visualization
    drawMarkers(){
        noStroke();
        fill(beatMarkColor);
        let currentX = this.offsetX; // Reset currentX for marker placement
        for (let j = 0; j <= this.numFrets; j++) {
            let fretWidth = (this.fretboardWidth / (this.numFrets + 1)) * (1 - (j / (this.numFrets * 4))); // Progressive reduction
            if (this.markerFrets.includes(j)) {
                ellipse(currentX + fretWidth / 2, this.offsetY + (this.fretboardHeight / 2) * (this.numStrings / 8), this.fretMarkerSize, this.fretMarkerSize);
                ellipse(currentX + fretWidth / 2, this.offsetY - 1, this.fretMarkerSize, this.fretMarkerSize);
                ellipse(currentX + fretWidth / 2, this.offsetY + 1 + this.adaptedFretboardHeight, this.fretMarkerSize, this.fretMarkerSize);
            }
            if ((j === 11) || (j === 23)){ // Double dot on the 12th fret (often marked specially)
                ellipse(currentX + fretWidth / 2, this.offsetY + (this.fretboardHeight / 3) * (this.numStrings / 8), this.fretMarkerSize, this.fretMarkerSize);
                ellipse(currentX + fretWidth / 2, this.offsetY + 2 * (this.fretboardHeight / 3) * (this.numStrings / 8), this.fretMarkerSize, this.fretMarkerSize);
                ellipse(currentX + fretWidth / 2, this.offsetY - 15, 11, 11);
                ellipse(currentX + fretWidth / 2, this.offsetY + 13 + this.adaptedFretboardHeight, 11, 11);

            }
            currentX += fretWidth;
        } 
    }

}  

//guitar.js
class Guitar extends Instrument{
    constructor(cellSize, notation) {
        super(cellSize, state['beats_parts'], instruments['guitar']['sounds'], instruments['guitar']['offset'], 'guitar');
        super.createGrid();
        // Create FreatBoard Object
        this.notation = notation
        this.fretBoard = new FreatBoard();
        // Draw fretboard
        this.fretBoard.drawFretboard();
    }

}


//instrument.js
class Instrument{
    constructor(cellSize, beats, sounds, offset, instrumentName){
        // will be standat size for the grid of the instrumetn
        this.cellSize = cellSize;
        // Number of beats per loop 
        this.beats = beats;
        // Number of beats per loop 
        this.sounds = sounds;
        // y offset position
        this.xOffset = offset[0];
        // x offset position
        this.yOffset = offset[1];
        // Instrument name
        this.instrumentName = instrumentName;
        this.gridXOffset = 170;
        this.grid = instruments[this.instrumentName].grid;
    }





    // Will create the instument beat loop grid
    createGrid() {
        for (let i = 0; i < instruments[this.instrumentName]['sounds'].length; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.beats; j++) {
                this.grid[i][j] = { 
                    x: j * this.cellSize + this.gridXOffset, 
                    y: i * this.cellSize + this.yOffset, 
                    active: false, 
                    sound: this.sounds[i] 
                };
            }
        }
    }


    // set value of set to the opisite when clicked
    toggleCell(row, col) {
        this.grid[row][col].active = !this.grid[row][col].active;
    }

    // Draw the drum machine
    drawGrid() {
        strokeWeight(1);
        stroke(backGroundColor);
        this.drawMartix();
        this.drawBeatRythmSignature();
        if (state['is_playing']){
            this.markCurrentBeatPosition();
        }
    }

    /*  Update loop beat grid
    updateGrid() {
        if (!state['is_playing']){
            for (let i = 0; i < this.sounds.length; i++) {
                for (let j = 0; j < this.beats; j++) {
                    if (mouseX > this.grid[i][j].x && mouseX < this.grid[i][j].x + this.cellSize && mouseY > this.grid[i][j].y && mouseY < this.grid[i][j].y + this.cellSize) {
                        this.toggleCell(i, j);
                    }
                }
            }
        }
    }
*/
    updateGrid() {
        if (!state['is_playing']) {
        // Create a 2D array to store the active states
        let activeStates = [];
        for (let i = 0; i < this.sounds.length; i++) {
            let row = [];
            for (let j = 0; j < this.beats; j++) {
            if (
                mouseX > this.grid[i][j].x &&
                mouseX < this.grid[i][j].x + this.cellSize &&
                mouseY > this.grid[i][j].y &&
                mouseY < this.grid[i][j].y + this.cellSize
            ) {
                this.toggleCell(i, j);
            }
            // Store the active state of the cell
            row.push(this.grid[i][j].active);
            }
            activeStates.push(row);
        }
        // Return the 2D array of active states
        }
        return null;
    }
    

    loadPreset(preset) {
        if (!state['is_playing']){
            for (let i = 0; i < this.sounds.length; i++) {
                for (let j = 0; j < this.beats; j++) {
                    if (preset[i][j] === true) {
                        this.toggleCell(i, j);
                    }
                }
            }
        }
    }


    // Draw all the squares in teh grid
    drawMartix(){
        for (let i = 0; i < this.sounds.length; i++) {
            for (let j = 0; j < this.beats; j++) {
                if (this.grid[i][j].active) {
                    fill(additionalColor); // Active cell color
                } else {
                    fill(drumCellColor); // Inactive cell color
                }
                
                rect(this.grid[i][j].x, this.grid[i][j].y, this.cellSize, this.cellSize);
            }
        }
    }

    // mark every 4 beats
    drawBeatRythmSignature(){
        for (let j = 0; j < this.beats; j = j + 4){
            fill(beatMarkColor);
            rect(this.grid[0][j].x + this.cellSize * 0.25, this.grid[0][j].y - this.cellSize, this.cellSize/2, this.cellSize/2);
            for (let i = 0; i < this.sounds.length; i++){
                if (this.grid[i][j].active) {
                    fill(additionalColor); // Active cell color
                } else {
                    fill(beatMarkColor); // Inactive cell color
                }
                
                rect(this.grid[i][j].x, this.grid[i][j].y, this.cellSize, this.cellSize);
            }
        }
    }

    // mark current position in the beat
    markCurrentBeatPosition(){
        noStroke();
        fill(beatPositionColor);
        rect(this.grid[0][state['current_beat_part']].x + this.cellSize * 0.25, this.grid[0][state['current_beat_part']].y - this.cellSize, this.cellSize/2, this.cellSize * 6);
        if (state['current_beat_part'] == 0){
            fill(backGroundColor);
            rect(this.grid[0][this.grid[0].length - 1].x + this.cellSize * 0.25, this.grid[0][this.grid[0].length - 1].y - this.cellSize, this.cellSize/2, this.cellSize );
        } else if (state['current_beat_part'] % 4 == 1){
            fill(backGroundColor);
            rect(this.grid[0][state['current_beat_part'] - 1].x + this.cellSize * 0.25, this.grid[0][state['current_beat_part'] - 1].y - this.cellSize, this.cellSize/2, this.cellSize );
            fill(beatMarkColor);
            rect(this.grid[0][state['current_beat_part'] - 1].x + this.cellSize * 0.25, this.grid[0][state['current_beat_part'] - 1].y - this.cellSize, this.cellSize/2, this.cellSize / 2);
        } else {
            fill(backGroundColor);
            rect(this.grid[0][state['current_beat_part'] - 1].x + this.cellSize * 0.25, this.grid[0][state['current_beat_part'] - 1].y - this.cellSize, this.cellSize/2, this.cellSize );
        }   
    }

}

//maestor.js



  // ###################################################################################################
  // ############################ ! #TODO 1: add seventh choose ! ######################################
  // ###################################################################################################
  // ############################ ! #TODO 2: add add option to add another drum beat with the same #####
  // ############################ lenght but different sounds   ! ######################################
  // ###################################################################################################
  // ############################ ! #TODO 3: pause option need to stop and not redraw the fretboard ####
  // ###################################################################################################
  // ############################ ! #TODO 4: add option to click the next chord without need to play ! #
  // ###################################################################################################
  // ###################################################################################################
  // ############################ ! #TODO 5: multithreading ! ##########################################
  // ################################################################################################### 

  class Maestor {
    constructor(w, h) {
      this.rootNotes = null;
      this.cellSize = 20;
      this.xOffsetButtonPanel = 110;
      this.precomputedBeats = [];
      background(backGroundColor);
      this.notation = new Notation();
      this.drums = new Drums(this.cellSize);
      this.bass = new Bass(this.cellSize, this.notation);
      this.guitar = new Guitar(this.cellSize, this.notation);
      state['chord_list']  = this.notation.getChordList(state['scale_notes']);
      this.createButtons();
      textStyle(BOLD);
      this.update();
    }
  
  
    createButtons() {
      let pausetButton = createButton('&#10074', '&#10074');
      pausetButton.position(width / 2 - 25, 10);
      pausetButton.mousePressed(() => this.pausetLoop());
      pausetButton.style('background-color', 'black');
      pausetButton.style('color', beatMarkColor); 
  
      let startButton = createButton('▶');
      startButton.position(width / 2, 10);
      startButton.mousePressed(() => this.startLoop());
      startButton.style('background-color', 'black');
      startButton.style('color', beatMarkColor); 
  
      let stopButton = createButton('■');
      stopButton.position(25 + width / 2, 10);
      stopButton.mousePressed(() => this.stopLoop());
      stopButton.style('background-color', 'black');
      stopButton.style('color', beatMarkColor); 
  
      this.bpmSlider = createSlider(20, 150, state['bpm'], 1);
      this.bpmSlider.position(120 + width / 2, 10);
      this.bpmSlider.input(() => this.updateBPM());
      this.bpmLabel = createDiv(`BPM: ${state['bpm']}`);
      this.bpmLabel.position(270 + width / 2, 10);
      this.bpmLabel.style('color', beatMarkColor); 
  
      this.createScaleSelect();
      this.createModeSelect();
      this.createStringsSelect();
      text('Chord Progression: ', 65, 40);
  
      this.createChordSelectors();
  
      let presetButton1 = createButton('1');
      presetButton1.position(10, instruments['drums']['offset'][1]-40);
      presetButton1.mousePressed(this.applyPreset1); // Bind the applyPreset function to the button
      presetButton1.style('background-color', 'black');
      presetButton1.style('color', beatMarkColor); 
  
      let presetButton2 = createButton('2');
      presetButton2.position(10 + 30, instruments['drums']['offset'][1]-40);
      presetButton2.mousePressed(this.applyPreset2); // Bind the applyPreset function to the button
      presetButton2.style('background-color', 'black');
      presetButton2.style('color', beatMarkColor); 
      
      let presetButton3 = createButton('3');
      presetButton3.position(10 + 60, instruments['drums']['offset'][1]-40);
      presetButton3.mousePressed(this.applyPreset3); // Bind the applyPreset function to the button
      presetButton3.style('background-color', 'black');
      presetButton3.style('color', beatMarkColor); 
  
      let presetButton4 = createButton('4');
      presetButton4.position(10 + 90, instruments['drums']['offset'][1]-40);
      presetButton4.mousePressed(this.applyPreset4); // Bind the applyPreset function to the button
      presetButton4.style('background-color', 'black');
      presetButton4.style('color', beatMarkColor); 
  
      // Add a button to save the preset
      let savePresetButton = createButton('Save Preset');
      savePresetButton.position(10, instruments['drums']['offset'][1] - 60);
      savePresetButton.mousePressed(this.savePreset); // Bind the savePreset function to the button
      savePresetButton.style('background-color', 'black');
      savePresetButton.style('color', beatMarkColor); 
  
      let loadPresetButton = createButton('Load Preset');
      loadPresetButton.position(100, instruments['drums']['offset'][1] - 60);
      loadPresetButton.mousePressed(this.loadPreset); // Bind the savePreset function to the button
      loadPresetButton.style('background-color', 'black');
      loadPresetButton.style('color', beatMarkColor); 
    }
  
  
    createScaleSelect() {
      noStroke();
      fill(beatMarkColor);
      textSize(13);
      text('Select Scale: ', 50, 20);
      let scaleSelect = createSelect();
      scaleSelect.position(this.xOffsetButtonPanel + 10, 10);
      scaleSelect.style('background-color', 'black');
      scaleSelect.style('color', beatMarkColor); 
  
      // Populate the select options
      this.notation.notes.forEach(note => scaleSelect.option(note));
      
      // Set the default selected option to 'E'
      scaleSelect.selected('E');
    
      // Set the change handler
      scaleSelect.changed(() => {
        state['scale_notes'] = this.notation.generateScale(scaleSelect.value(), state['mode']);
        state['chord_list'] = this.notation.getChordList(state['scale_notes']);
        this.update();
        this.createChordSelectors();
      });
    }
  
    createModeSelect() {
      let modeSelect = createSelect();
      modeSelect.position(this.xOffsetButtonPanel + 50, 10);
      Object.keys(this.notation.modes).forEach(mode => modeSelect.option(mode));
      modeSelect.selected('Minor');
      modeSelect.style('background-color', 'black');
      modeSelect.style('color', beatMarkColor); 
  
      modeSelect.changed(() => {
        state['scale_notes'] = this.notation.generateScale(state['scale_notes'][0], modeSelect.value());
        state['chord_list'] = this.notation.getChordList(state['scale_notes']);
        this.update();
        this.createChordSelectors()
      });
    }
  
    createStringsSelect() {
      let stringsSelect = createSelect();
      stringsSelect.position(this.xOffsetButtonPanel + 167, 10);
      stringsSelect.style('background-color', 'black');
      stringsSelect.style('color', beatMarkColor); 
      Object.keys(this.guitar.fretBoard.stringOptions).forEach(option => stringsSelect.option(option));
      stringsSelect.changed(() => {
        this.guitar.fretBoard.numStrings = this.guitar.fretBoard.stringOptions[stringsSelect.value()];
        this.guitar.fretBoard.changeFretboardHeight();
        background(backGroundColor);
        this.guitar.fretBoard.drawFretboard();
        this.update();
      });
  
    }
    
  
  
    createChordSelectors() {
      const noteNames = this.notation.notes;
      const chordContainer = createDiv().id('noteSelectors');
      chordContainer.position(this.xOffsetButtonPanel + 10, 30);
      state['chord_progression'].forEach((chord, i) => {
        const chordSelect = createSelect();
        chordSelect.parent(chordContainer);
        chordSelect.option('Chord', i);
        chordSelect.style('background-color', 'black');
        chordSelect.style('color', beatMarkColor); 
        state['scale_notes'].forEach(note => chordSelect.option(note));
        chordSelect.changed(() => {
          const selectedNote = chordSelect.value();
            state['chord_progression'][i] = selectedNote;
            if (state['chord_progression'][i] === 'undefined') {
              state['chord_progression'][i] = state['scale_notes'][0];
          }
        });
      });
    }
  
    updateBPM() {
      state['bpm'] = this.bpmSlider.value();
      this.bpmLabel.html(`BPM: ${state['bpm']}`);
      if (state['is_playing']) {
        clearInterval(this.interval);
        this.interval = setInterval(() => this.playLoop(), (60 / state['bpm']) * 1000 / 20);
      }
    }
  
    async startLoop() {
      var preset = []
      for (let i = 0; i < instruments.drums.grid.length; i++) {
        preset[i] = []
        for (let j = 0; j < instruments.drums.grid[0].length; j++) {
          append(preset[i], instruments.drums.grid[i][j].active);
        }
      }
      if (!state['is_playing']) {
        state['is_playing'] = true;
        this.bass.drumAndBassLine();
        this.precompute();
        this.update();
        await this.coundowntToStart();
        this.interval = setInterval(() => this.playLoop(), (60 / state['bpm']) * 1000 / 20);
      }
    }
  
    pausetLoop(){
      print('pause');
      if (state['is_playing']) {
        state['is_playing'] = false;
        clearInterval(this.interval);
        //background(backGroundColor);
        //this.update();
      }
    }
  
    stopLoop() {
      print('stop');
      if (state['is_playing']) {
        state['is_playing'] = false;
        clearInterval(this.interval);
        state['current_chord_index'] = 0;
        state['current_beat_part'] = 0;
        //background(backGroundColor);
        this.update();
      }
    }
  
  
    async coundowntToStart() {
      // Calculate the interval in milliseconds
      let interval = (60 / state['bpm']) * 1000 / 20;
      // Function to play the hi-hat sound
      let playHiHat = () => {
        return new Promise(resolve => {
            this.drums.sounds[2].play();
            setTimeout(resolve, interval * 10 );
        });
    };
      // Trigger the hi-hat sound 3 times at the calculated interval
      await playHiHat();
      await playHiHat();
      await playHiHat(); // Play after the second interval
  }
  
  
    // Prcumpute to make run faster and reduce repetative processes
    // need to run this after each change to bass grid
    precompute() {
      this.precomputedBeats = [];
      for (let chord = 0; chord < instruments['bass']['grid'].length; chord++) {
        this.precomputedBeats[chord] = [];
        for (let i = 0; i < state['beats_parts']; i++) {
          let beatData = { drums: [], bass: null };
          instruments['drums']['grid'].forEach(drumRow => {
            if (drumRow[i].active) {
              beatData.drums.push(drumRow[i].sound);
            }
          });
          if (instruments['bass']['grid'][chord][i].active) {
            beatData.bass = instruments['bass']['grid'][chord][i].sound;
          }
          this.precomputedBeats[chord].push(beatData);
        }
      }
    }
  
    playLoop() {
      if (state['current_beat_part'] < this.precomputedBeats[state['current_chord_index']].length) {
        let beatData = this.precomputedBeats[state['current_chord_index']][state['current_beat_part']];
        beatData.drums.forEach(sound => sound.play());
        if (beatData.bass) {
          this.bass.playPitch(beatData.bass);
        }
      }
      state['current_beat_part'] = (state['current_beat_part'] + 1) % state['beats_parts'];
      if (state['current_beat_part'] === 0) {
        state['current_chord_index'] = (state['current_chord_index'] + 1) % state['chord_progression'].length;
        state['current_chord'] = state['chord_list'][this.notation.findChordListIndex(state['chord_progression'][state['current_chord_index']])];
        this.update();
      }else{
        this.update_partial();
      }
    }
  
    
    applyPreset1() {
      for (let i = 0; i < preset[0].length; i++) {
        for (let j = 0; j < preset[0][i].length; j++) {
          instruments['drums']['grid'][i][j].active = preset[0][i][j];
        }
      }
      console.log("Preset applied:", instruments['drums']['grid']);
  }
  
  
  
  applyPreset2() {
    for (let i = 0; i < preset[1].length; i++) {
      for (let j = 0; j < preset[1][i].length; j++) {
        instruments['drums']['grid'][i][j].active = preset[1][i][j];
      }
    }
    console.log("Preset applied:", instruments['drums']['grid']);
  }
  
  applyPreset3() {
    for (let i = 0; i < preset[1].length; i++) {
      for (let j = 0; j < preset[2][i].length; j++) {
        instruments['drums']['grid'][i][j].active = preset[2][i][j];
      }
    }
    console.log("Preset applied:", instruments['drums']['grid']);
  }
  
  applyPreset4() {
    for (let i = 0; i < preset[1].length; i++) {
      for (let j = 0; j < preset[2][i].length; j++) {
        instruments['drums']['grid'][i][j].active = preset[3][i][j];
      }
    }
    console.log("Preset applied:", instruments['drums']['grid']);
  }
  
  savePreset() {
    // Get the current state of the drum grid
    let currentPreset = instruments['drums']['grid'].map(row => row.map(cell => cell.active));
    
    // Save the preset to localStorage
    localStorage.setItem('drumPreset', JSON.stringify(currentPreset));
    
    console.log("Preset saved:", currentPreset);
  }
  
  loadPreset() {
    // Load the preset from localStorage
    let savedPreset = JSON.parse(localStorage.getItem('drumPreset'));
    
    // If there is a saved preset, apply it to the drum grid
    if (savedPreset) {
      for (let i = 0; i < savedPreset.length; i++) {
        for (let j = 0; j < savedPreset[i].length; j++) {
          instruments['drums']['grid'][i][j].active = savedPreset[i][j];
        }
      }
      console.log("Preset loaded:", instruments['drums']['grid']);
    } else {
      console.log("No preset found.");
    }
  }
  
  
    update() {
      background(backGroundColor);  
      this.drums.updateGrid();
      this.drums.drawGrid();
      this.rootNotes = this.guitar.fretBoard.drawFretboard();
      strokeWeight(1);
      this.bass.drawGrid();
      noStroke()
      fill(beatMarkColor);
      textSize(13);
      text('Chord Progression: ', 65, 40);
      text('Select Scale: ', 50, 20);
    }
  
    update_partial(){
      this.guitar.fretBoard.drawRootNotes(this.rootNotes);
  
      this.drums.updateGrid();
      this.drums.drawGrid();
    }
  }

//notation.js
class Notation{
    // Scale modes
    notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    modes = {
        'Major':            [2, 2, 1, 2, 2, 2, 1],
        'Minor':            [2, 1, 2, 2, 1, 2, 2],
        'Harmonic Minor':   [2, 1, 2, 2, 1, 3, 1],
        'Phrygian':         [1, 2, 2, 2, 1, 2, 2],
        'Phrygian':         [1, 2, 2, 2, 1, 2, 2],
        'Gypsy Major':      [1, 3, 1, 2, 1, 3, 1],
        'Chromatic':        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]     
    }
    noteFrequencies = {
        'A':    [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
        'A#':   [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
        'B':    [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
        'C':    [16.35, 32.70, 65.41,  130.81, 261.63, 523.25, 1046.50, 2093.00],
        'C#':   [17.32, 34.65, 69.30,  138.59, 277.18, 554.37, 1108.73, 2217.46],
        'D':    [18.35, 36.71, 73.42,  146.83, 293.66, 587.33, 1174.66, 2349.32],
        'D#':   [19.45, 38.89, 77.78,  155.56, 311.13, 622.25, 1244.51, 2489.02],
        'E':    [20.60, 41.20, 82.41,  164.81, 329.63, 659.25, 1318.51, 2637.02],
        'F':    [21.83, 43.65, 87.31,  174.61, 349.23, 698.46, 1396.91, 2793.83],
        'F#':   [23.12, 46.25, 92.50,  185.00, 369.99, 739.99, 1479.98, 2959.96],
        'G':    [24.50, 49.00, 98.00,  196.00, 392.00, 783.99, 1567.98, 3135.96],
        'G#':   [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44]
      }
    

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

//sample.js
class Sample {
    constructor(path) {//, pitch = 1) {
      //this.pitch = pitch;
      this.path = path;
      this.volume = 1;
      //this.path = path;
    }
    play() {
     // s.mozPreservesPitch = false;
     // s.preservesPitch = false;
     // s.playbackRate = this.pitch
     this.s = new Audio(this.path);
     this.s.volume = this.volume;
     this.s.play();
    }

    setVolume(level){
      this.volume = level;    // Reduced volume to avoid clipping
    }
  
  }

  //settings.js
  //let guitar, drums, bass;
// colors to use: '#5B038A', '#0E0336' ,'#290E54' 'D4AF37' is gold
let backGroundColor = '#348888', drumCellColor = '#22BABB', beatMarkColor = '#9EF8EE', stringColor = 0, beatPositionColor = '#F24405', additionalColor = '#FA7F08';
let instrumentNameDrums = 'drums', instrumentNameBass = 'bass', instrumentNameGuitar = 'guitar';
let currentChord = 0, currentColumn = 0;
const preset = [
  [
    [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ],[
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ],[
    [true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]

  ],[
    [true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false, false, false, true, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false]
  ] 
];



function preload() {
  snare = new Sample('recorcess/sounds/snare.wav');
  hihat_closed = new Sample('recorcess/sounds/hi_hat_closed.wav');
  kick = new Sample('recorcess/sounds/kick.wav');
  ride = new Sample('recorcess/sounds/ride.wav');
  crash = new Sample('recorcess/sounds/crash.wav');

  state = {
    'current_chord_index':0,
    'current_chord': ['E', 'G', 'B', 'D'],
    'current_beat_part':  0,
    'chord_progression':  ['E', 'E', 'C', 'C', 'A', 'A', 'B', 'B'],
    'amount_of_chords':   8,
    'scale':              'A',
    'mode':               'Major',
    'scale_notes':        ['E', 'F#', 'G', 'A', 'B', 'C', 'D', 'E'],
    'chord_list':         [],
    'is_playing':         false,
    'seventh':            true,
    'bpm':                40,
    'beats_parts':        32
  };

  instruments = {
    'drums':  {'sounds': [kick, snare, hihat_closed, ride, crash],
               'offset': [10, 400],
               'grid':   []
    }, 
    'bass':   {'sounds': state['chord_progression'],
               'offset': [10, 50],
               'grid':   []
    }, 
    'guitar': {'sounds': state['chord_progression'],
               'offset': [10, 0],
               'grid':   []
    }
  };


}

//settings.js
//let guitar, drums, bass;
// colors to use: '#5B038A', '#0E0336' ,'#290E54' 'D4AF37' is gold
let backGroundColor = '#348888', drumCellColor = '#22BABB', beatMarkColor = '#9EF8EE', stringColor = 0, beatPositionColor = '#F24405', additionalColor = '#FA7F08';
let instrumentNameDrums = 'drums', instrumentNameBass = 'bass', instrumentNameGuitar = 'guitar';
let currentChord = 0, currentColumn = 0;
const preset = [
  [
    [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ],[
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ],[
    [true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]

  ],[
    [true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false, false, false, true, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false]
  ] 
];



function preload() {
  snare = new Sample('recorcess/sounds/snare.wav');
  hihat_closed = new Sample('recorcess/sounds/hi_hat_closed.wav');
  kick = new Sample('recorcess/sounds/kick.wav');
  ride = new Sample('recorcess/sounds/ride.wav');
  crash = new Sample('recorcess/sounds/crash.wav');

  state = {
    'current_chord_index':0,
    'current_chord': ['E', 'G', 'B', 'D'],
    'current_beat_part':  0,
    'chord_progression':  ['E', 'E', 'C', 'C', 'A', 'A', 'B', 'B'],
    'amount_of_chords':   8,
    'scale':              'A',
    'mode':               'Major',
    'scale_notes':        ['E', 'F#', 'G', 'A', 'B', 'C', 'D', 'E'],
    'chord_list':         [],
    'is_playing':         false,
    'seventh':            true,
    'bpm':                40,
    'beats_parts':        32
  };

  instruments = {
    'drums':  {'sounds': [kick, snare, hihat_closed, ride, crash],
               'offset': [10, 400],
               'grid':   []
    }, 
    'bass':   {'sounds': state['chord_progression'],
               'offset': [10, 50],
               'grid':   []
    }, 
    'guitar': {'sounds': state['chord_progression'],
               'offset': [10, 0],
               'grid':   []
    }
  };


}