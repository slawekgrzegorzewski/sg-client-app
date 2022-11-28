import {Domain} from '../../general/model/domain';

export type TimeRecordDTO = Partial<TimeRecord>;

export class TimeRecord {
  public id: number;
  public date: Date;
  public numberOfHours: number;
  public description: string;
  public domain: Domain;

  constructor(data?: TimeRecordDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.date = data.date && new Date(data.date) || new Date();
    this.description = data.description || '';
    this.numberOfHours = data.numberOfHours || 0;
    this.description = data.description || '';
    this.domain = new Domain(data.domain);
  }
}
