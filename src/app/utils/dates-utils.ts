import {ComparatorBuilder, TBasicComparable} from './comparator-builder';

type SortOrder = 'ASC' | 'DESC';

export class DatesUtils {

  public static sortMapByKeys<T extends TBasicComparable>(resultUnsorted: Map<T, any>, order: SortOrder = 'ASC'): Map<T, any> {
    const resultSorted = new Map<T, any>();
    if (resultUnsorted) {
      DatesUtils.getMapKeysSorted(resultUnsorted, order).forEach(d => resultSorted.set(d, resultUnsorted.get(d)));
    }
    return resultSorted;
  }

  public static getMapKeysSorted<T extends TBasicComparable>(resultUnsorted: Map<T, any>, order: SortOrder = 'ASC'): T[] {
    let keys: T[] = [];
    if (resultUnsorted) {
      for (const date of resultUnsorted.keys()) {
        keys.push(date);
      }
    }
    const keysComparatorBuilder = ComparatorBuilder.comparing<T>(key => key);
    if (order === 'ASC') {
      keys = keys.sort(keysComparatorBuilder.build());
    } else {
      keys = keys.sort(keysComparatorBuilder.desc().build());
    }
    return keys;
  }

  public static sortMapWithDatesKeys(resultUnsorted: Map<Date, any>, order: SortOrder = 'ASC'): Map<Date, any> {
    const resultSorted = new Map<Date, any>();
    if (resultUnsorted) {
      DatesUtils.getMapWithDatesKeysSorted(resultUnsorted, order)
        .forEach(d => resultSorted.set(d, resultUnsorted.get(d)));
    }
    return resultSorted;
  }

  public static getMapWithDatesKeysSorted(resultUnsorted: Map<Date, any>, order: SortOrder = 'ASC'): Date[] {
    let dates: Date[] = [];
    if (resultUnsorted) {
      for (const date of resultUnsorted.keys()) {
        dates.push(date);
      }
    }
    const dateComparatorBuilder = ComparatorBuilder.comparingByDateDays<Date>(date => date);
    if (order === 'ASC') {
      dates = dates.sort(dateComparatorBuilder.build());
    } else {
      dates = dates.sort(dateComparatorBuilder.desc().build());
    }
    return dates;
  }

  public static getDateMidnight(date: Date): Date {
    const newDate = new Date(date.getTime());
    newDate.setUTCHours(0, 0, 0, 0);
    return newDate;
  }

  public static compareDatesOnly(date: Date, other: Date): number {
    return ComparatorBuilder.comparingByDateDays<Date>(d => d).build()(date, other);
  }
}
