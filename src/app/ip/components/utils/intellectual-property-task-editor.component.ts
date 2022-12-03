import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IntellectualProperty} from '../../model/intellectual-property';
import {IntellectualPropertyTask} from '../../model/intellectual-property-task';

@Component({
  selector: 'app-intellectual-property-task-editor',
  templateUrl: './intellectual-property-task-editor.component.html',
  styleUrls: ['./intellectual-property-task-editor.component.css']
})
export class IntellectualPropertyTaskEditorComponent {
  @Input()
  intellectualProperty: IntellectualProperty | null = null;

  @Input()
  taskData: IntellectualPropertyTask | null = null;

  @Input()
  style: any;

  @Output()
  onAction: EventEmitter<{ intellectualProperty: IntellectualProperty, task: IntellectualPropertyTask }> = new EventEmitter<{ intellectualProperty: IntellectualProperty, task: IntellectualPropertyTask }>();

  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();

}
