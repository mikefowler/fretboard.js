import { getChord } from '@tonaljs/chord';

import {
  Fretboard,
  CAGED
} from '../dist/fretboard.esm.js';

const fretboardConfiguration = {
  height: 200,
  stringsWidth: 1.5,
  dotSize: 25,
  fretCount: 16,
  fretsWidth: 1.2,
  font: 'Futura'
};

const colors = {
  defaultFill: 'white',
  defaultStroke: 'black',
  disabled: '#aaa',
  intervals: {
    '1P': '#F25116',
    '3M': '#F29727',
    '5P': '#F2E96B'
  },
  octaves: ['blue', 'magenta', 'red', 'orange', 'yellow', 'green']
};

document.addEventListener('DOMContentLoaded', () => {
  const fretboard = new Fretboard({
    ...fretboardConfiguration,
    el: '#fretboard'
  }).render(CAGED({
    root: 'C3',
    box: 'E'
  }));

	const music = `
X: 1
M: 4/4
Q: 1/4=70
L: 1/8
K: C
K: transpose=-12
"_Cmaj7"(CEGB) "_Dm7"(DFAc) | "_Em7"(EGBd) "_Fmaj7"(FAce) | "_G7"(GBdf) "_Am7"(Aceg) |
"_Bm7b5"(Bdfa) "_Cmaj7"(cegb) | "_Dm7"(dfac') "_Em7"(egbd') ||
  `;

  const visualObj = ABCJS.renderAbc('notation', music, {
    responsive: 'resize',
    add_classes: true,
    clickListener: (element) => {
      if (!element.chord) {
        return;
      }
      const octave = element.minpitch < 7 ? 3 : 4;
      const [root, chordType] = [element.chord[0].name[0], element.chord[0].name.substring(1)];
      const chord = getChord(chordType, `${root}${octave}`);
      fretboard.dots({
        stroke: ({ noteWithOctave }) => chord.notes.indexOf(noteWithOctave) > -1 ? colors.intervals['1P'] : 'black',
        ['stroke-width']: ({ noteWithOctave }) => chord.notes.indexOf(noteWithOctave) > -1 ? 4 : 1
      });
    }
  })[0];
  const synthControl = new ABCJS.synth.SynthController();

  synthControl.load("#audio", {
    onEvent: ({ midiPitches, elements, ...rest }) => {
      const note = ABCJS.synth.pitchToNoteName[midiPitches[0].pitch];
      const chordElement = elements[0].find(({ tagName }) => tagName === 'text');
      if (chordElement) {
        const chordType = chordElement.querySelector('tspan').innerHTML.substring(1);
        const chord = getChord(chordType, note);
        fretboard.dots({
          text: ({ noteWithOctave, note }) => chord.notes.indexOf(noteWithOctave) > -1 ? note : '',
          fill: ({ noteWithOctave }) => noteWithOctave === note ? colors.intervals['1P'] : 'white',
          stroke: ({ noteWithOctave }) => chord.notes.indexOf(noteWithOctave) > -1 ? colors.intervals['1P'] : 'black',
          ['stroke-width']: ({ noteWithOctave }) => chord.notes.indexOf(noteWithOctave) > -1 ? 4 : 1
        });
      } else {
        fretboard.dots({
          fill: ({ noteWithOctave }) => noteWithOctave === note ? colors.intervals['1P'] : 'white',
        });
      }
    }
  }, {
    displayLoop: true,
    displayRestart: true,
    displayPlay: true,
    displayProgress: true
  });
  synthControl.setTune(visualObj, false);
});
