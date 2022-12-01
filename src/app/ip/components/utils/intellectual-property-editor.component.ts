import {Component, EventEmitter, Input, Output} from '@angular/core';

export type IntellectualPropertyData = { id: number | null, description: string };

@Component({
  selector: 'app-intellectual-property-editor',
  templateUrl: './intellectual-property-editor.component.html',
  styleUrls: ['./intellectual-property-editor.component.css']
})
export class IntellectualPropertyEditorComponent {
  @Input()
  intellectualPropertyData: IntellectualPropertyData | null = null;

  @Input()
  style: any;

  @Output()
  onAction: EventEmitter<IntellectualPropertyData> = new EventEmitter<IntellectualPropertyData>();

  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();
}
