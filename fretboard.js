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
                rootNote['xPos'] =  currentX - fretWidth / 2 - 15;
                rootNote['yPos'] =  this.offsetY + (string + 1) * this.stringSpacing - 15;
                rootNote['size'] =  30;
                rootNote['edgeRadius'] =  this.r;
                square(rootNote['xPos'], rootNote['yPos'], rootNote['size'], rootNote['edgeRadius']);
            }
            square(currentX - fretWidth / 2 - 10, this.offsetY + (string + 1) * this.stringSpacing - 10, 20, this.r);
            this.fillColorText(c); // Example color using the variable 'c'
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
        textAlign(CENTER, CENTER);
        textSize(17);
        let currentX = this.offsetX; // Reset currentX for note placement
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


    // TODO: need to combain this funcion with drawNotes() together to the sameme loop 
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