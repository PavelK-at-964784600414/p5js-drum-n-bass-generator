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
  bass808 = new Sample('recorcess/sounds/808_Bass_C3_tuned.wav');

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