import {Component, EventEmitter, Input, Output} from '@angular/core';
import {EMPTY_TASK, IntellectualPropertyTask} from '../../model/intellectual-property-task';
import {TimeRecord} from '../../model/time-record';

@Component({
  selector: 'app-time-record-editor',
  templateUrl: './time-record-editor.component.html',
  styleUrls: ['./time-record-editor.component.css']
})
export class TimeRecordEditorComponent {

  @Input()
  task: IntellectualPropertyTask = EMPTY_TASK;

  @Input()
  timeRecord: TimeRecord = new TimeRecord();

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
  onAction: EventEmitter<{ timeRecord: TimeRecord, task: IntellectualPropertyTask }> = new EventEmitter<{ timeRecord: TimeRecord, task: IntellectualPropertyTask }>();

  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  tasksForTypeAhead(): () => IntellectualPropertyTask[] {
    const that = this;
    return () => that.tasks;
  }

  emitAction() {
    this.onAction.emit({timeRecord: this.timeRecord, task: this.task.id === EMPTY_TASK.id ? EMPTY_TASK : this.task});
  }
}
