import {TimeRecord} from './time-record';
import {ForTypeahead} from '../../accountant/model/for-typeahead';

export type IntellectualPropertyTaskDTO = Partial<IntellectualPropertyTask>;

export class IntellectualPropertyTask implements ForTypeahead {
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

  getTypeaheadId(): string {
    return this.id.toString();
  }

  getTypeaheadDescription(): string {
    return this.description;
  }
}

export const EMPTY_TASK = new IntellectualPropertyTask({description: '---'});
