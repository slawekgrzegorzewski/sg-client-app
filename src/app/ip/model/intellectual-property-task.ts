import {TimeRecord} from './time-record';
import {ForTypeahead} from '../../accountant/model/for-typeahead';
import {
  Task as GQTask
} from '../../../../types';

export type IntellectualPropertyTaskDTO = Partial<IntellectualPropertyTask>;
export const EMPTY_TASK_ID = 0;

export class IntellectualPropertyTask implements ForTypeahead {
  public id: number;
  public description: string;
  public attachments: string[];
  public coAuthors: string;
  public timeRecords: TimeRecord[];

  constructor(data?: IntellectualPropertyTaskDTO | GQTask) {
    if (!data) {
      data = {};
    }
    this.id = data.id || EMPTY_TASK_ID;
    this.description = data.description || '';
    this.attachments = data.attachments || [];
    this.coAuthors = data.coAuthors || '';
    this.timeRecords = (data.timeRecords || []).map(timeRecord => new TimeRecord(timeRecord));
  }

  getTypeaheadId(): string {
    return this.id.toString();
  }

  getTypeaheadDescription(): string {
    return this.description;
  }
}

export const EMPTY_TASK = new IntellectualPropertyTask({description: '---'});
