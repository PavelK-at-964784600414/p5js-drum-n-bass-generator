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