class Drums extends Instrument{
    constructor(cellSize) {
        super(cellSize, state['beats_parts'], instruments['drums']['sounds'], instruments['drums']['offset'], 'drums');
        super.createGrid();
        super.drawGrid();
        this.setVolume();
        this.createButtons();
    }

    // Sets volume of the drum rack
    setVolume(level = 0.5){
        for (let i = 0; i < this.sounds.length; i++)
        {
            this.sounds[i].setVolume(level);
        }
        this.sounds[2].setVolume(1)
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

