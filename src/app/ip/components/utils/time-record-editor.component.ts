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

  get taskValue(): IntellectualPropertyTask {
    return this.tasks.find(t => this.timeRecordData.taskId && t.id === this.timeRecordData.taskId) || EMPTY_TASK;
  }

  set taskValue(value: IntellectualPropertyTask) {
    this.timeRecordData.taskId = value.id === EMPTY_TASK.id ? null : value.id;
  }

  $tasks: IntellectualPropertyTask[] = [];

  get tasks(): IntellectualPropertyTask[] {
    return this.$tasks;
  };

  @Input()
  set tasks(value: IntellectualPropertyTask[]) {
    if (!value.find(t => t.id === EMPTY_TASK.id)) {
      this.$tasks = [EMPTY_TASK, ...value];
    } else {
      this.$tasks = value;
    }
  }

  @Output()
  onAction: EventEmitter<TimeRecordData> = new EventEmitter<TimeRecordData>();
  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  tasksForTypeAhead(): () => IntellectualPropertyTask[] {
    const that = this;
    return () => that.tasks;
  }
}
