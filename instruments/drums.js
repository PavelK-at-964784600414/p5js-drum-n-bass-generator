class Drums extends Instrument{
    constructor() {
        super(state['beats_parts'], instruments['drums']['sounds'], instruments['drums']['offset'], 'drums');
        super.createGrid();
        this.setVolume();
    }

    // Sets volume of the drum rack
    setVolume(level = 0.5){
        for (let i = 0; i < this.sounds.length; i++)
        {
            this.sounds[i].setVolume(level);
        }
        this.sounds[2].setVolume(1);
        this.sounds[1].setVolume(0.1);
    }

    // Create the drum sample bottons 
    drawGrid() {
        strokeWeight(1);
        stroke(backGroundColor);
        this.drawMartix();
        this.drawBeatRythmSignature();
        if (state['is_playing']){
            this.markCurrentBeatPosition();
        }
    }

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

    // toggle value of the cell
    toggleCell(row, col) {
        this.grid[row][col].active = !this.grid[row][col].active;
    }
}

