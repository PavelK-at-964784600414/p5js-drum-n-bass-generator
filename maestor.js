

// TODO 1: Add seventh chord option
// TODO 2: Add option to add another drum beat with the same length but different sounds
// TODO 3: Ensure pause option stops without redrawing the fretboard
// TODO 4: Add option to click the next chord without playing it
// TODO 5: Implement multithreading

class Maestor {
  constructor(w, h) {
    this.rootNotes = null;
    this.cellSize = 20;
    this.xOffsetButtonPanel = 110;
    this.precomputedBeats = [];
    this.notation = new Notation();
    this.drums = new Drums(this.cellSize);
    this.bass = new Bass(this.cellSize, this.notation);
    this.guitar = new Guitar(this.cellSize, this.notation);
    state['chord_list'] = this.notation.getChordList(state['scale_notes']);
    this.interval = null;
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
    this.interval = (60 / state['bpm']) * 1000 / 20;
    // Function to play the hi-hat sound
    let playHiHat = () => {
      return new Promise(resolve => {
          console.log('debug: ', this.drums.sounds[2]);
          console.log('debug2: ', this.interval);
          this.drums.sounds[1].play();
          console.log('debug3: ');

          setTimeout(resolve, this.interval * 10 );
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
      beatData.drums.forEach(sound => {
        sound.play();
      });
      if (beatData.bass) {
        console.log('bass debug: ', beatData.bass);
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