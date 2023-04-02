import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {EMPTY_TIME_RECORD_CATEGORY, TimeRecordCategory} from "../../model/time-record-category";

@Component({
  selector: 'app-time-record-category-editor',
  templateUrl: './time-record-category-editor.component.html',
  styleUrls: ['./time-record-category-editor.component.css']
})
export class TimeRecordCategoryEditorComponent {

  @Input()
  timeRecordCategory: TimeRecordCategory = EMPTY_TIME_RECORD_CATEGORY;

  constructor(public activeModal: NgbActiveModal) {
  }

  emitAction() {
    this.activeModal.close({timeRecordCategory: this.timeRecordCategory});
  }
}
