class Instrument{
    constructor(beats, sounds, offset, instrumentName){
        console.log(beats, sounds, offset, instrumentName);
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
        console.log(this.instrumentName, this.grid);
    }
}