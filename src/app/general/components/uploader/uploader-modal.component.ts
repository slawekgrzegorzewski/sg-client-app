import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UploaderComponent} from './uploader.component';

@Component({
  selector: 'app-intellectual-property-task-details-modal',
  template: `
      <div class="modal-header">
          <h4 class="modal-title" id="modal-basic-title">Dodaj plik</h4>
          <button type="button" class="btn-close" aria-label="Close"
                  (click)="uploadSub?.unsubscribe();activeModal.dismiss('Cross click')"></button>
      </div>
      <div class="modal-body">
          <div class="sg-flex-row sg-flex-justify-space-between">
              <input type="file" class="file-input" (change)="selected($event)" #fileUpload>
              <div *ngIf="!fileName">Wybierz plik</div>
              <div *ngIf="fileName">Wysyłam plik {{fileName}}</div>
              <button class="btn btn-sm btn-link" (click)="fileUpload.click()">
                  wybierz
              </button>
          </div>
          <ngb-progressbar *ngIf="fileName" type="secondary" [value]="uploadProgress"></ngb-progressbar>

      </div>
      <div class="modal-footer">
          <button class="btn btn-sm btn-link" (click)="uploadSub?.unsubscribe();activeModal.dismiss()">
              anuluj
          </button>
      </div>`,
  styleUrls: ['uploader.component.css']
})
export class UploaderModalComponent extends UploaderComponent {

  constructor(public activeModal: NgbActiveModal) {
    super();
    this.uploadFinished.subscribe(
      () => this.activeModal.close()
    );
    this.uploadCancelled.subscribe(
      () => this.activeModal.close()
    );
  }
}


