interface ScrambleOptions {
  turns: number;
}

export default function scramble(options: Partial<ScrambleOptions> = {turns: 20}): string[] {
  const moves: string[][] = [
    ['U', 'U\'', 'U2'],
    ['D', 'D\'', 'D2'],
    ['R', 'R\'', 'R2'],
    ['L', 'L\'', 'L2'],
    ['F', 'F\'', 'F2'],
    ['B', 'B\'', 'B2']
  ];

  const result: string[] = [];
  let lastMoveType: number | null = null;

  for (let i = 0; i < options.turns; i++) {
    let moveType = Math.floor(Math.random() * 6);
    moveType = moveType === lastMoveType ? (moveType + 1) % 6 : moveType;
    const move = Math.floor(Math.random() * 3);
    result.push(moves[moveType][move]);
    lastMoveType = moveType;
  }
  return result;
}
