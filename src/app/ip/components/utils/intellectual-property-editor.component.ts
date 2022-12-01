import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IntellectualProperty} from '../../model/intellectual-property';

@Component({
  selector: 'app-intellectual-property-editor',
  templateUrl: './intellectual-property-editor.component.html',
  styleUrls: ['./intellectual-property-editor.component.css']
})
export class IntellectualPropertyEditorComponent {
  @Input()
  intellectualPropertyData: IntellectualProperty | null = null;

  @Input()
  style: any;

  @Output()
  onAction: EventEmitter<IntellectualProperty> = new EventEmitter<IntellectualProperty>();

  @Output()
  onCancel: EventEmitter<string> = new EventEmitter<string>();
}
