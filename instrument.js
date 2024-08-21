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