import {Domain} from '../domain';

export type CubeType = 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'MEGAMINX';
export const cubeTypeDescriptions = new Map<CubeType, string>(
  [
    ['TWO', '2x2'],
    ['THREE', '3x3'],
    ['FOUR', '4x4'],
    ['FIVE', '5x5'],
    ['SIX', '6x6'],
    ['SEVEN', '7x7'],
    ['MEGAMINX', 'megaminx']
  ]
);

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

}
export class CubeStats {
  public time: Date = new Date(0);
  public averages: Map<number, Date | null> = new Map<number, Date>();
  public recordTime: Date = new Date(0);
}
