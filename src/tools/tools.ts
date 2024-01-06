import { Position } from '../fretboard/Fretboard';

function transform({
  box = [] as Position[],
  from = { string: 6, fret: 0 },
  to = { string: 1, fret: 100 },
  action = (x: Position): Position => x
} = {}): Position[] {
  function inSelection({
    string,
    fret
  }: {
    string: number;
    fret: number;
  }): boolean {
    if (string > from.string || string < to.string) {
      return false;
    }
    if (string === from.string && fret < from.fret) {
      return false;
    }
    if (string === to.string && fret > to.fret) {
      return false;
    }
    return true;
  }
  return box.map((x) => (inSelection(x) ? action(x) : x));
}

export function disableStrings({
  box = [],
  strings = []
}: {
  box: Position[];
  strings: number[];
}): Position[] {
  return box.map(({ string, ...dot }) => ({
    string,
    disabled: strings.indexOf(string) > -1,
    ...dot
  }));
}

export function sliceBox({
  box = [] as Position[],
  from = { string: 6, fret: 0 },
  to = { string: 1, fret: 100 }
} = {}): Position[] {
  const sortedBox = box.slice().sort((a, b) => {
    if (a.string > b.string) {
      return -1;
    }
    if (a.fret > b.fret) {
      return 1;
    }
    return -1;
  });

  function findIndex(key: { string: number; fret: number }): number {
    return sortedBox.findIndex(
      ({ string, fret }) => string === key.string && fret === key.fret
    );
  }

  let fromIndex = findIndex(from);
  if (fromIndex === -1) {
    fromIndex = 0;
  }
  let toIndex = findIndex(to);
  if (toIndex === -1) {
    toIndex = sortedBox.length;
  }
  return sortedBox.slice(fromIndex, toIndex);
}

export function disableDots({
  box = [] as Position[],
  from = { string: 6, fret: 0 },
  to = { string: 1, fret: 100 }
} = {}): Position[] {
  const action = (dot: Position): Position => {
    return { disabled: true, ...dot };
  };
  return transform({ box, from, to, action });
}
