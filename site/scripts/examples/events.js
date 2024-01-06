import { Fretboard } from '../../../dist/fretboard.esm.js';
import { get as getScale } from '@tonaljs/scale';

import { fretboardConfiguration, colors } from '../config.js';

export default function events() {
  const fretboardNotes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
    .reverse()
    .map((note) => {
      const [noteName, octave] = note.split('');
      return [
        ...getScale(`${note} chromatic`).notes,
        ...getScale(`${noteName}${+octave + 1} chromatic`).notes
      ];
    });

  const fretboard = new Fretboard({
    ...fretboardConfiguration,
    dotText: ({ note }) => note,
    dotStrokeColor: ({ moving }) =>
      moving ? colors.defaultActiveStroke : colors.defaultStroke
  });

  const $wrapper = document.querySelector('.fretboard-events');

  let dots = [];
  fretboard.render([]);

  fretboard.on('mousemove', ({ fret, string }) => {
    const note = fretboardNotes[string - 1][fret];
    const dot = {
      fret,
      string,
      note: note.substring(0, note.length - 1),
      moving: true
    };

    const dotsToRender = [...dots];

    if (!dotsToRender.find((x) => x.fret === fret && x.string === string)) {
      dotsToRender.push(dot);
    }

    fretboard.setDots(dotsToRender).render();
  });

  fretboard.on('mouseleave', () => {
    $wrapper.classList.remove('show-moving-dot');
    fretboard.setDots(dots).render();
  });

  fretboard.on('mouseenter', () => {
    $wrapper.classList.add('show-moving-dot');
    fretboard.setDots(dots).render();
  });

  fretboard.on('click', ({ fret, string }) => {
    const note = fretboardNotes[string - 1][fret];
    const dot = {
      fret,
      string,
      note: note.substring(0, note.length - 1)
    };

    if (!dots.find((x) => x.fret === fret && x.string === string)) {
      dots.push(dot);
    }

    fretboard.setDots(dots).render();
  });

  document.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', ({ currentTarget }) => {
      switch (currentTarget.dataset.action) {
        case 'clear-fretboard':
          dots = [];
          fretboard.clear();
          break;
        default:
          break;
      }
    });
  });
}
