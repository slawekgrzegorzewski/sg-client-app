import {Component, EventEmitter, Input, Output} from '@angular/core';
import Decimal from 'decimal.js';
import {EMPTY_TASK, IntellectualPropertyTask} from '../../model/intellectual-property-task';

export type TimeRecordData = { taskId: number | null, date: Date, numberOfHours: Decimal, description: string };

@Component({
  selector: 'app-time-record-editor',
  templateUrl: './time-record-editor.component.html',
  styleUrls: ['./time-record-editor.component.css']
})
export class TimeRecordEditorComponent {

  @Input()
  timeRecordData: TimeRecordData = {
    taskId: null,
    date: new Date(),
    numberOfHours: new Decimal(0),
    description: ''
  } as TimeRecordData;

  get taskIdValue(): string {
    return (this.timeRecordData.taskId || EMPTY_TASK.id).toString();
  }

  set taskIdValue(value: string) {
    this.timeRecordData.taskId = value === EMPTY_TASK.id.toString() ? null : Number(value);
  }

  @Input()
  tasks: IntellectualPropertyTask[] = [];

  @Output()
  onAction: EventEmitter<TimeRecordData> = new EventEmitter<TimeRecordData>();
  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }
}
