export class Dates {
  public static compareDates(a: Date, b: Date): number {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }
}
