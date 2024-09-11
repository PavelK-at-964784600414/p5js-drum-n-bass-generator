class ControlPanel {
  constructor({ guitar, bass, drums, precomputedBeats, countdownToStart, precompute, update, playLoop, update_partial, notation }) {
    // Assign passed properties
    Object.assign(this, { guitar, bass, drums, precomputedBeats, countdownToStart, precompute, update, playLoop, update_partial, notation });

    this.xOffsetButtonPanel = 110;

    this.createButtons();
  }

  // Button creation helper
  createButton(label, x, y, action) {
    return createButton(label)
      .position(x, y)
      .style('background-color', 'black')
      .style('color', beatMarkColor)
      .mousePressed(action);
  }

  // Drums buttons creation
  createDrumsButtons(xOffset, yOffset, cellSize, sounds) {
    buttonConfigs.forEach((config, index) => {
      this.createButton(config.label, xOffset, yOffset + cellSize * index, () => sounds[config.soundIndex].play());
    });
  }

  // Main button panel creation
  createButtons() {
    const controls = [
      { label: '&#10074;&#10074;', action: this.pauseLoop.bind(this) },
      { label: '▶', action: this.startLoop.bind(this) },
      { label: '■', action: this.stopLoop.bind(this) },
    ];

    controls.forEach((btn, i) => this.createButton(btn.label, width / 2 - 25 + i * 50, 10, btn.action));

    // BPM Slider and Label
    this.bpmSlider = createSlider(20, 150, state.bpm, 1)
      .position(120 + width / 2, 10)
      .input(() => this.updateBPM());

    this.bpmLabel = createDiv(`BPM: ${state.bpm}`)
      .position(270 + width / 2, 10)
      .style('color', beatMarkColor);

    // Create selectors and buttons
    this.createScaleSelect();
    this.createModeSelect();
    this.createStringsSelect();
    this.createDrumsButtons(this.drums.xOffset, this.drums.yOffset, this.drums.cellSize, this.drums.sounds);
    this.createChordSelectors();
    this.createPresetButtons();

    text('Chord Progression:', 65, 40);
  }

  // Preset buttons creation
  createPresetButtons() {
    const presetActions = [this.applyPreset1, this.applyPreset2, this.applyPreset3, this.applyPreset4].map(fn => fn.bind(this));

    presetActions.forEach((action, i) => this.createButton(`${i + 1}`, 10 + i * 30, instruments.drums.offset[1] - 40, action));

    this.createButton('Save Preset', 10, instruments.drums.offset[1] - 60, this.savePreset.bind(this));
    this.createButton('Load Preset', 100, instruments.drums.offset[1] - 60, this.loadPreset.bind(this));
  }

  // Generic select creation method
  createSelectWithOptions(options, x, y, selected, onChange) {
    const select = createSelect().position(x, y).style('background-color', 'black').style('color', beatMarkColor);
    options.forEach(option => select.option(option));
    select.selected(selected);
    select.changed(() => onChange(select));
    return select;
  }

  // Scale selector
  createScaleSelect() {
    this.createSelectWithOptions(
      this.notation.notes,
      this.xOffsetButtonPanel + 10,
      10,
      'E',
      (scaleSelect) => {
        state.scale_notes = this.notation.generateScale(scaleSelect.value(), state.mode);
        state.chord_list = this.notation.getChordList(state.scale_notes);
        this.update();
      }
    );
    text('Select Scale:', 50, 20);
  }

  // Mode selector
  createModeSelect() {
    this.createSelectWithOptions(
      Object.keys(this.notation.modes),
      this.xOffsetButtonPanel + 50,
      10,
      'Minor',
      (modeSelect) => {
        state.scale_notes = this.notation.generateScale(state.scale_notes[0], modeSelect.value());
        state.chord_list = this.notation.getChordList(state.scale_notes);
        this.createChordSelectors();
        this.update();
      }
    );
  }

  // Guitar strings selector
  createStringsSelect() {
    this.createSelectWithOptions(
      Object.keys(this.guitar.fretBoard.stringOptions),
      this.xOffsetButtonPanel + 167,
      10,
      8,
      (stringsSelect) => {
        this.guitar.fretBoard.numStrings = this.guitar.fretBoard.stringOptions[stringsSelect.value()];
        this.guitar.fretBoard.changeFretboardHeight();
        background(backGroundColor);
        this.guitar.fretBoard.drawFretboard();
        this.update();
      }
    );
  }

  // Chord selectors creation
  createChordSelectors() {
    state.chord_progression.forEach((_, i) => {
      this.createSelectWithOptions(
        state.scale_notes.slice(0, -1),
        this.xOffsetButtonPanel + 10 + i * 61,
        30,
        state.chord_progression[i],
        (chordSelect) => {
          const selectedNote = chordSelect.value();
          state.chord_progression[i] = selectedNote !== 'undefined' ? selectedNote : state.scale_notes[0];
          this.update();
        }
      );
    });
  }

  // Methods for loop control
  async startLoop() {
    if (!state.is_playing) {
      state.is_playing = true;
      this.bass.drumAndBassLine();
      this.precompute();
      this.update();
      await this.countdownToStart();
      this.interval = setInterval(() => this.playLoop(), (60 / state.bpm) * 50);
    }
  }

  pauseLoop() {
    if (state.is_playing) {
      state.is_playing = false;
      clearInterval(this.interval);
    }
  }

  stopLoop() {
    if (state.is_playing) {
      state.is_playing = false;
      clearInterval(this.interval);
      state.current_chord_index = 0;
      state.current_beat_part = 0;
      this.update();
    }
  }

  // BPM update method
  updateBPM() {
    state.bpm = this.bpmSlider.value();
    this.bpmLabel.html(`BPM: ${state.bpm}`);
    if (state.is_playing) {
      clearInterval(this.interval);
      this.interval = setInterval(() => this.playLoop(), (60 / state.bpm) * 1000 / 20);
    }
  }

  // Preset handling
  applyPreset(index) {
    preset[index].forEach((row, i) => row.forEach((active, j) => instruments.drums.grid[i][j].active = active));
  }

  applyPreset1() { this.applyPreset(0); }
  applyPreset2() { this.applyPreset(1); }
  applyPreset3() { this.applyPreset(2); }
  applyPreset4() { this.applyPreset(3); }

  savePreset() {
    localStorage.setItem('drumPreset', JSON.stringify(instruments.drums.grid.map(row => row.map(cell => cell.active))));
    console.log("Preset saved");
  }

  loadPreset() {
    const savedPreset = JSON.parse(localStorage.getItem('drumPreset'));
    if (savedPreset) {
      savedPreset.forEach((row, i) => row.forEach((active, j) => instruments.drums.grid[i][j].active = active));
      console.log("Preset loaded");
    } else {
      console.log("No preset found in local storage.");
    }
  }
}
