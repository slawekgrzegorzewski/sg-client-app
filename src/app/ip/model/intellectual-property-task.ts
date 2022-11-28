import {TimeRecord} from './time-record';

export type IntellectualPropertyTaskDTO = Partial<IntellectualPropertyTask>;

export class IntellectualPropertyTask {
  public id: number;
  public description: string;
  public attachments: string[];
  public coAuthors: string;
  public timeRecords: TimeRecord[];

  constructor(data?: IntellectualPropertyTaskDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.description = data.description || '';
    this.attachments = data.attachments || [];
    this.coAuthors = data.coAuthors || '';
    this.timeRecords = (data.timeRecords || []).map(task => new TimeRecord(task));
  }
}
