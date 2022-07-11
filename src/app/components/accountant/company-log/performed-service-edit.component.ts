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

  @Input() performedService: PerformedService | null = null;
  @Input() performedServices: PerformedService[] = [];
  @Input() editMode: boolean = false;
  @Input() createMode: boolean = false;

  @Input() services: Service[] = [];
  @Input() clients: Client[] = [];
  @Input() allCurrencies: Currency[] = [];

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
    if (this.performedService) {
      this.createEvent.emit(this.performedService);
    }
  }

  update(): void {
    this.updateEditElement();
  }

  private updateEditElement(): void {
    if (this.performedService) {
      this.updateEvent.emit(this.performedService);
    }
  }

  canCreate(): boolean {
    return true; // this.isCreateEditMode() && this.allRequiredFieldsSet();
  }

  canEdit(): boolean {
    return true; // this.isGeneralEditMode() && this.allRequiredFieldsSet();
  }

  private allRequiredFieldsSet(): boolean {
    return this.performedService !== null
      && this.performedService.service !== null
      && this.performedService.client !== null
      && this.performedService.price !== null
      && this.performedService.currency !== null
      && this.performedService.date !== null;
  }

  servicesForTypeAhead(): () => Service[] {
    const that = this;
    return () => that.services;
  }

  clientsForTypeAhead(): () => Client[] {
    const that = this;
    const clientsOccurrences: Map<number, number> = new Map<number, number>();
    that.performedServices.filter(ps => ps.date.getMonth() >= new Date().getMonth() - 1).forEach(ps => {
      clientsOccurrences.set(ps.client.id, (clientsOccurrences.get(ps.client.id) || 0) + 1);
    });
    const clientsToShow = that.clients.sort((a, b) => {
      const order = (clientsOccurrences.get(b.id) || 0) - (clientsOccurrences.get(a.id) || 0);
      if (order !== 0) {
        return order;
      }
      return a.name.localeCompare(b.name);
    });
    return () => clientsToShow;
  }

  currenciesForTypeAhead(): () => Currency[] {
    const that = this;
    return () => that.allCurrencies;
  }
}
