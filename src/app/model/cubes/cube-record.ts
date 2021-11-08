import {Domain} from '../domain';
import {ComparatorBuilder} from '../../utils/comparator-builder';

export type CubeType = 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'MEGAMINX';
export type CubeTypeSetting = { name: string, order: number };
export const cubeTypeSettings = new Map<CubeType, CubeTypeSetting>(
  [
    ['TWO', {name: '2x2', order: 0}],
    ['THREE', {name: '3x3', order: 1}],
    ['FOUR', {name: '4x4', order: 2}],
    ['FIVE', {name: '5x5', order: 3}],
    ['SIX', {name: '6x6', order: 4}],
    ['SEVEN', {name: '7x7', order: 5}],
    ['MEGAMINX', {name: 'megaminx', order: 6}]
  ]
);
export const orderOfCubeTypes = [...cubeTypeSettings.entries()]
  .sort(ComparatorBuilder.comparing<[string, CubeTypeSetting]>(v => v[1].order).build())
  .map(v => v[0]);

export type CubeRecordDTO = Omit<Partial<CubeRecord>, 'recordTime'> & { recordTime?: string };

export class CubeRecord {
  public id: number;
  public cubesType: CubeType;
  public time: number;
  public scramble: string;
  public recordTime: Date;
  public domain: Domain;

  constructor(data?: CubeRecordDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.cubesType = data.cubesType || 'THREE';
    this.time = data.time || 0;
    this.scramble = data.scramble || '';
    this.recordTime = data.recordTime && new Date(data.recordTime) || new Date();
    this.domain = new Domain(data.domain);
  }

  public static date(time: number): Date {
    return new Date(time * 1000);
  }

  public static dateToNumber(time: Date | null): number | null {
    if (time === null) {
      return null;
    }
    return time.getTime() / 1000;
  }

}

export class CubeStats {
  public time: number = 0;
  public averages: Map<number, Date | null> = new Map<number, Date>();
  public recordTime: Date = new Date(0);
}
