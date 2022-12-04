import {Component, Input} from '@angular/core';
import {IntellectualPropertyTask} from '../../model/intellectual-property-task';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intellectual-property-task-details-modal',
  template: `
      <ng-container *ngIf="task">
          <div class="modal-header">
              <h4 class="modal-title" id="modal-basic-title">Szczegóły zadania</h4>
              <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.close('Cross click')"></button>
          </div>
          <div class="modal-body">
              <b>{{task.description}}</b>
              <div *ngFor="let timeRecord of task.timeRecords">
                  {{timeRecord.date | localizedDate}}: {{timeRecord.numberOfHours}} godzin
                  {{timeRecord.description}}
              </div>
          </div>
          <div class="modal-footer">
              <button class="btn btn-sm btn-link" (click)="activeModal.close('OK')">
                  OK
              </button>
          </div>
      </ng-container>`
})
export class IntellectualPropertyTaskDetailsModalComponent {
  @Input()
  task: IntellectualPropertyTask | null = null;

  constructor(public activeModal: NgbActiveModal) {
  }
}
