import {Component, Input} from '@angular/core';
import {IntellectualProperty} from '../../model/intellectual-property';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intellectual-property-editor-modal',
  templateUrl: './intellectual-property-editor-modal.component.html',
  styleUrls: ['./intellectual-property-editor-modal.component.css']
})
export class IntellectualPropertyEditorModalComponent {

  @Input()
  intellectualProperty: IntellectualProperty | null = null;

  @Input()
  modal: any;


  constructor(public activeModal: NgbActiveModal) {
  }

  acceptModal() {
    this.activeModal.close(this.intellectualProperty);
    this.intellectualProperty = null;
  }
}
