

// TODO 1: Add seventh chord option
// TODO 2: Add option to add another drum beat with the same length but different sounds
// TODO 3: Add option to click the next chord without playing it

class Maestor {
  constructor(w, h) {
    this.rootNotes = null;
    this.precomputedBeats = [];
    this.notation = new Notation();
    this.bass = new Bass(this.notation);
    this.guitar = new Guitar(this.notation);
    this.drums = new Drums(this.control);
    this.control = new ControlPanel(this);
    
    state['chord_list'] = this.notation.getChordList(state['scale_notes']);
    this.interval = null;
    textStyle(BOLD);
    this.update();
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

  async countdownToStart() {
    const interval = (60 / state.bpm) * 50;
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => {
        this.drums.sounds[1].play();
        setTimeout(resolve, interval * 10);
      });
    }
  }

  precompute() {
    this.precomputedBeats = instruments.bass.grid.map((_, chord) =>
      Array.from({ length: state.beats_parts }, (_, i) => ({
        drums: instruments.drums.grid.filter(drumRow => drumRow[i].active).map(drumRow => drumRow[i].sound),
        bass: instruments.bass.grid[chord][i].active ? instruments.bass.grid[chord][i].sound : null,
      }))
    );
  }

  playLoop() {
    const beatData = this.precomputedBeats[state.current_chord_index][state.current_beat_part];
    beatData.drums.forEach(sound => sound.play());
    if (beatData.bass) this.bass.playPitch(beatData.bass);
    state.current_beat_part = (state.current_beat_part + 1) % state.beats_parts;
    if (state.current_beat_part === 0) {
      state.current_chord_index = (state.current_chord_index + 1) % state.chord_progression.length;
      state.current_chord = state.chord_list[this.notation.findChordListIndex(state.chord_progression[state.current_chord_index])];
      this.update();
    } else {
      this.update_partial();
    }
  }


  
}