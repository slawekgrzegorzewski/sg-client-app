import {Domain} from '../domain';

export class CubeRecord {
  public id: number;
  public cubesType: 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'MEGAMINX';
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
