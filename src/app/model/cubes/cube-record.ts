import {Domain} from '../domain';

export type CubeType = 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'MEGAMINX';
export const cubeTypeDescriptions = new Map(
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

export class CubeRecord {
  public id: number;
  public cubesType: CubeType;
  public time: number;
  public scramble: string;
  public recordTime: Date;
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.cubesType = data && data.cubesType || '';
    this.time = data && data.time || 0;
    this.scramble = data && data.scramble || '';
    this.recordTime = data && new Date(data.recordTime) || null;
    this.domain = data && new Domain(data.domain) || null;
  }

}
