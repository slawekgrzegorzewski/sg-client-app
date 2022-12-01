import {Domain} from '../../general/model/domain';
import {IntellectualPropertyTask} from './intellectual-property-task';

export type IntellectualPropertyDTO = Partial<IntellectualProperty>;

export const NO_ID = 0;

export class IntellectualProperty {
  public id: number;
  public description: string;
  public tasks: IntellectualPropertyTask[];
  public domain: Domain;

  constructor(data?: IntellectualPropertyDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || NO_ID;
    this.description = data.description || '';
    this.tasks = (data.tasks || []).map(task => new IntellectualPropertyTask(task));
    this.domain = new Domain(data.domain);
  }
}
