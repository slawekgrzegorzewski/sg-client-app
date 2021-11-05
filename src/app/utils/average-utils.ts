export class AverageUtils {
  public static movingAverageOf(records: number[], numberOfElements: number): (number | null)[] {
    const movingAverage = [];
    const lastNRecords = [];
    for (const d of records) {
      lastNRecords.push(d);
      if (lastNRecords.length > numberOfElements) {
        lastNRecords.shift();
        movingAverage.push(lastNRecords.reduce((a, b) => a + b, 0) / lastNRecords.length);
      } else {
        movingAverage.push(null);
      }
    }
    return movingAverage;
  }
}
