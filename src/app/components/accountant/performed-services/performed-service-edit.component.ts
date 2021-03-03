import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PerformedService} from '../../../model/accountant/performed-service';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';

@Component({
  selector: 'app-performed-service-edit',
  templateUrl: './performed-service-edit.component.html',
  styleUrls: ['./performed-service-edit.component.css']
})
export class PerformedServiceEditComponent implements OnInit {

  @Input() performedService: PerformedService;
  @Input() editMode: boolean;
  @Input() createMode: boolean;

  @Input() services: Service[];
  @Input() clients: Client[];
  @Input() allCurrencies: Currency[];

  @Output() updateEvent = new EventEmitter<PerformedService>();
  @Output() createEvent = new EventEmitter<PerformedService>();
  @Output() cancelEvent = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }


  resetEditForm(): void {
    this.cancelEvent.emit();
  }

  create(): void {
    this.createEvent.emit(this.performedService);
  }

  update(): void {
    this.updateEditElement();
  }

  private updateEditElement(): void {
    this.updateEvent.emit(this.performedService);
  }

  canCreate(): boolean {
    return true; // this.isCreateEditMode() && this.allRequiredFieldsSet();
  }

  canEdit(): boolean {
    return true; // this.isGeneralEditMode() && this.allRequiredFieldsSet();
  }

  private allRequiredFieldsSet(): boolean {
    return this.performedService != null
      && this.performedService.service
      && this.performedService.client
      && this.performedService.price
      && this.performedService.currency
      && this.performedService.date != null;
  }

  servicesForTypeAhead(): () => Observable<Service[]> {
    const that = this;
    return () => of(that.services);
  }

  clientsForTypeAhead(): () => Observable<Client[]> {
    const that = this;
    return () => of(that.clients);
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => of(that.allCurrencies);
  }
}
