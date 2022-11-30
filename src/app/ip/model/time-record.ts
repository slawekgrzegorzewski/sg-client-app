import {Domain} from '../../general/model/domain';
import Decimal from 'decimal.js';
import {IntellectualPropertyTask} from './intellectual-property-task';

export type TimeRecordDTO = Partial<TimeRecord>;

export class TimeRecord {
  public id: number;
  public date: Date;
  public numberOfHours: Decimal;
  public description: string;
  public domain: Domain;

  constructor(data?: TimeRecordDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.date = data.date && new Date(data.date) || new Date();
    this.description = data.description || '';
    this.numberOfHours = new Decimal(data.numberOfHours || '0.0');
    this.description = data.description || '';
    this.domain = new Domain(data.domain);
  }
}

export type TimeRecordWithTask = TimeRecord & {
  task: IntellectualPropertyTask | null;
}