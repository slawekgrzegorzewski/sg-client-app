import {Component, EventEmitter, Input, Output} from '@angular/core';

export type IntellectualPropertyTaskData = { intellectualPropertyId: number, taskId: number | null, coAuthors: string, description: string };

@Component({
  selector: 'app-intellectual-property-task-editor',
  templateUrl: './intellectual-property-task-editor.component.html',
  styleUrls: ['./intellectual-property-task-editor.component.css']
})
export class IntellectualPropertyTaskEditorComponent {
  @Input()
  taskData: IntellectualPropertyTaskData | null = null;

  @Input()
  style: any;

  @Output()
  onAction: EventEmitter<IntellectualPropertyTaskData> = new EventEmitter<IntellectualPropertyTaskData>();

  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();
}
