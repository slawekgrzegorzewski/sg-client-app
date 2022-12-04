import {Component, Input} from '@angular/core';
import {IntellectualProperty} from '../../model/intellectual-property';
import {IntellectualPropertyTask} from '../../model/intellectual-property-task';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intellectual-property-task-editor-modal',
  templateUrl: './intellectual-property-task-editor-modal.component.html',
  styleUrls: ['./intellectual-property-task-editor-modal.component.css']
})
export class IntellectualPropertyTaskEditorModalComponent {
  @Input()
  intellectualProperty: IntellectualProperty | null = null;

  @Input()
  taskData: IntellectualPropertyTask | null = null;

  constructor(public activeModal: NgbActiveModal) {
  }

  acceptModal() {
    this.activeModal.close({intellectualProperty: this.intellectualProperty, task: this.taskData});
    this.intellectualProperty = null;
    this.taskData = null;
  }
}
