import {CurrencyCalculator} from "./currency-calculator";

function testRoundWithInput(testInput: number[][]) {
  testInput.forEach(([input, expected]) => {
    let result = CurrencyCalculator.round(input);
    expect(result).toEqual(expected);
  })
}

describe('round', function () {
  it('round down', function () {
    testRoundWithInput([
      [5, 5],
      [5.5, 5.5],
      [5.55, 5.55],
      [5.554, 5.55]
    ]);
  });
  it('round up', function () {
    testRoundWithInput([
      [5.555, 5.56],
      [5.5554, 5.56],
      [5.5556, 5.56]
    ]);
  });
});
