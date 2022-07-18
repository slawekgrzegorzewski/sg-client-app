import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {PerformedService} from '../../../model/accountant/performed-service';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {DatePipe} from '@angular/common';
import {PaymentStatus} from '../../../model/accountant/payable';
import {PayableGroup} from '../../../model/accountant/payable-groupper';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';
import {NgEventBus} from 'ng-event-bus';
import {SizeService} from '../../../services/size.service';
import {APP_SIZE_EVENT} from '../../../utils/event-bus-events';

export type EditMode = 'edit' | 'create' | 'payment-selection' | ''
export type PerformedServicesDisplayType = 'desktop' | 'mobile';

export enum Grouping {
  LACK, BY_CLIENTS, BY_DATES, BY_SERVICES
}

@Component({
  selector: 'app-performed-services',
  templateUrl: './performed-services.component.html',
  styleUrls: ['./performed-services.component.css']
})
export class PerformedServicesComponent implements OnInit {

  private _performedServicesTableContainer: ElementRef | null | undefined = null;
  @ViewChild('performedServicesTableContainer') get performedServicesTableContainer(): ElementRef | null | undefined {
    return this._performedServicesTableContainer;
  }

  set performedServicesTableContainer(value: ElementRef | null | undefined) {
    this._performedServicesTableContainer = value;
    setTimeout(() => this.sizeLayout(), 1);
  }

  private _addPSButton: ElementRef | null | undefined = null;
  @ViewChild('addPSButton') get addPSButton(): ElementRef | null | undefined {
    return this._addPSButton;
  }

  set addPSButton(value: ElementRef | null | undefined) {
    this._addPSButton = value;
    setTimeout(() => this.sizeLayout(), 1);
  }

  private _availableHeight: number = 0;
  get availableHeight(): number {
    return this._availableHeight;
  }

  set availableHeight(value: number) {
    this._availableHeight = value;
    this.sizeLayout();
  }

  @Input() title: string | null = null;
  @Input() performedServicesDisplayType: PerformedServicesDisplayType = 'desktop';

  allPerformedServices: PerformedService[] = [];

  private _groupingMode = Grouping.LACK;
  get groupingMode(): Grouping {
    return this._groupingMode;
  }

  set groupingMode(value: Grouping) {
    const change = this._groupingMode !== value;
    this._groupingMode = value;
    if (change) {
      this.onGroupingModeChange.emit(value);
    }
  }

  _performedServices: PerformedService[] = [];
  @Input() get performedServices(): PerformedService[] {
    return this._performedServices;
  }

  set performedServices(value: PerformedService[]) {
    this.allPerformedServices = value;
    this._performedServices = (value || []).sort(PerformedService.compareByDateAndClientAndServiceAndId);
    this.onNewPerformedServicesData(value);
  }

  @Input() services: Service[] = [];

  @Input() clients: Client[] = [];
  @Input() clientPayments: ClientPayment[] = [];
  @Input() allCurrencies: Currency[] = [];

  @Output() onPerformedServiceCreate = new EventEmitter<PerformedService>();
  @Output() onPerformedServiceUpdate = new EventEmitter<PerformedService>();
  @Output() onPerformedServicePaymentCreate = new EventEmitter<PerformedServicePayment>();
  @Output() onGroupingModeChange = new EventEmitter<Grouping>();

  displayData: PayableGroup<PerformedService>[] = [];
  selectedGroup: PayableGroup<PerformedService> | null = null;

  selectedElement: PerformedService | null = null;
  editElement: PerformedService | null = null;
  editMode: EditMode = '';

  showDateColumn = true;
  showClientColumn = true;
  showServiceColumn = true;
  numberOfDisplayedColumns: number = 4;
  performedServicesTableHeight: number = 0;

  constructor(
    private datePipe: DatePipe,
    private eventBus: NgEventBus,
    private sizeService: SizeService) {
    this.availableHeight = sizeService.size.height;
  }

  ngOnInit(): void {
    this.eventBus.on(APP_SIZE_EVENT).subscribe((event) => {
      this.availableHeight = event.data.height;
    });
  }

  public noGrouping(): void {
    this.group(Grouping.LACK);
  }

  public byClients(): void {
    this.group(Grouping.BY_CLIENTS);
  }

  public byDates(): void {
    this.group(Grouping.BY_DATES);
  }

  public byServices(): void {
    this.group(Grouping.BY_SERVICES);
  }

  private onNewPerformedServicesData(value: PerformedService[]) {
    const editElement = this.editElement;
    const selectedElement = this.selectedElement;

    if (editElement) {
      this.editElement = this.performedServices.find(ps => ps.id === editElement.id) || null;
    }
    if (selectedElement) {
      this.selectedElement = this.performedServices.find(ps => ps.id === selectedElement.id) || null;
    }
    this.group();
  }

  private group(groupingMode: Grouping = this.groupingMode): void {
    this.groupingMode = groupingMode;
    switch (this.groupingMode) {
      case Grouping.LACK:
        this.disableGrouping();
        break;
      case Grouping.BY_CLIENTS:
        this.groupByClientsOrServices(Grouping.BY_CLIENTS);
        break;
      case Grouping.BY_DATES:
        this.groupByDates();
        break;
      case Grouping.BY_SERVICES:
        this.groupByClientsOrServices(Grouping.BY_SERVICES);
        break;
    }
    if (this.groupingMode === Grouping.LACK) {
      this.selectedGroup = this.displayData.length > 0 ? this.displayData[0] : null;
    } else {
      this.selectGroup();
    }
    this.adjustTableColumns();
  }

  private disableGrouping(): void {
    this.displayData = PayableGroup.groupData(this.performedServices,
      ps => -1,
      ps => '',
      ComparatorBuilder.comparingByDateDays<PerformedService>(ps => ps?.date || new Date(0)).desc()
        .thenComparing(ps => ps.client?.name || '')
        .thenComparing(ps => ps.service?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
  }

  private groupByClientsOrServices(grouping: Grouping.BY_CLIENTS | Grouping.BY_SERVICES): void {

    const entityGetter = (ps: PerformedService) => grouping === Grouping.BY_CLIENTS ? ps.client : ps.service;
    const secondEntityGetter = (ps: PerformedService) => grouping === Grouping.BY_CLIENTS ? ps.service : ps.client;

    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && entityGetter(ps) && entityGetter(ps).id || -1,
      ps => ps && entityGetter(ps) && entityGetter(ps).name || '',
      ComparatorBuilder.comparingByDateDays<PerformedService>(ps => ps?.date || new Date(0)).desc()
        .thenComparing(ps => secondEntityGetter(ps)?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
  }

  private groupByDates(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.date && ps.date.getTime() || -1,
      ps => ps && ps.date && this.datePipe.transform(ps.date, 'dd MMMM yyyy') || '',
      ComparatorBuilder.comparing<PerformedService>(ps => ps.client?.name || '')
        .thenComparing(ps => ps.service?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
  }

  private selectGroup(): void {
    const selectedGroup = this.selectedGroup;
    if (selectedGroup !== null) {
      this.selectedGroup = (this.displayData || []).find(g => g.title === selectedGroup.title) || null;
    }
  }

  private adjustTableColumns(): void {
    this.showDateColumn = true;
    this.showClientColumn = true;
    this.showServiceColumn = true;
    switch (this.groupingMode) {
      case Grouping.LACK:
        if (this.performedServicesDisplayType === 'mobile') {
          this.showDateColumn = false;
        }
        break;
      case Grouping.BY_CLIENTS:
        this.showClientColumn = false;
        break;
      case Grouping.BY_DATES:
        this.showDateColumn = false;
        break;
      case Grouping.BY_SERVICES:
        this.showServiceColumn = false;
        break;
    }
    this.numberOfDisplayedColumns = 1 + [this.showDateColumn, this.showClientColumn, this.showServiceColumn].filter(Boolean).length;
  }

  public prepareToCreate(): void {
    const performedService = new PerformedService();
    performedService.currency = 'PLN';
    performedService.date = new Date();
    this.prepareEdit(performedService, 'create');
  }

  public prepareToEdit(): void {
    if (this.selectedElement) {
      this.prepareEdit(this.selectedElement, 'edit');
    }
  }

  public prepareToPaymentSelectionEdit(): void {
    if (this.selectedElement) {
      this.prepareEdit(this.selectedElement, 'payment-selection');
    }
  }

  private prepareEdit(editElement: PerformedService, editMode: EditMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  public resetEditForm(): void {
    this.editElement = null;
    this.editMode = '';
  }

  public create(toCreate: PerformedService): void {
    this.onPerformedServiceCreate.emit(toCreate);
    this.resetEditForm();
  }

  public update(toUpdate: PerformedService): void {
    this.onPerformedServiceUpdate.emit(toUpdate);
    this.resetEditForm();
  }

  public setGroupToDisplay(payableGroup: PayableGroup<PerformedService>): void {
    if (this.isEqualToSelectedGroup(payableGroup)) {
      this.selectedGroup = null;
    } else {
      this.selectedGroup = payableGroup;
    }
  }

  public setPerformedService(ps: PerformedService): void {
    if (this.isEqualToSelectedElement(ps)) {
      this.selectedElement = null;
    } else {
      this.selectedElement = ps;
    }
  }

  public getPaymentStatusClass(paymentStatus: PaymentStatus): string {
    if (paymentStatus === PaymentStatus.PAID) {
      return 'paid-ps';
    }
    if (paymentStatus === PaymentStatus.NOT_PAID) {
      return 'not-paid-ps';
    }
    return 'underpaid-ps';
  }

  public getGroupClass(payableGroup: PayableGroup<PerformedService>): string {
    if (this.isEqualToSelectedGroup(payableGroup)) {
      return '';
    }
    return this.getPaymentStatusClass(payableGroup.status);
  }

  public isGrouped(): boolean {
    return this.groupingMode !== Grouping.LACK;
  }

  public serviceNeedsPayment(): boolean {
    if (!this.selectedElement) {
      return false;
    }
    const paymentStatus = this.selectedElement.getPaymentStatus();
    return paymentStatus === PaymentStatus.UNDERPAID || paymentStatus === PaymentStatus.NOT_PAID;
  }

  public getLackingAmount(): number {
    if (!this.selectedElement) {
      return 0;
    }
    return this.selectedElement.price - this.selectedElement.getPaidAmountForNow();
  }

  public createPerformedServicePayment(performedServicePayment: PerformedServicePayment): void {
    this.onPerformedServicePaymentCreate.emit(performedServicePayment);
    this.resetEditForm();
  }

  public getClientPaymentsRelations(performedService: PerformedService): SimplePerformedServicePayment[] {
    return performedService.clientPaymentsRelations.sort(
      ComparatorBuilder.comparingByDateDays<SimplePerformedServicePayment>(p => p?.date || new Date(0))
        .thenComparing(p => p.price)
        .build()
    );
  }

  //region Just utils - simple getters and setters and more trivial yet useful stuff

  isNonEditMode(): boolean {
    return this.editMode === '';
  }

  isGeneralEditMode(): boolean {
    return this.editMode === 'edit';
  }

  isCreateEditMode(): boolean {
    return this.editMode === 'create';
  }

  isPaymentSelectionEditMode(): boolean {
    return this.editMode === 'payment-selection';
  }

  public isEqualToSelectedGroup(payableGroup: PayableGroup<PerformedService>): boolean {
    return this.selectedGroup !== null && this.selectedGroup.isEqual(payableGroup);
  }

  public isEqualToSelectedElement(performedService: PerformedService): boolean {
    return this.selectedElement !== null && this.selectedElement.id === performedService.id;
  }

  isNoGrouping(): boolean {
    return this.groupingMode === Grouping.LACK;
  }

  isGroupingByClients(): boolean {
    return this.groupingMode === Grouping.BY_CLIENTS;
  }

  //endregion

  private sizeLayout(): void {
    if (this.performedServicesTableContainer) {
      const newHeight = this.availableHeight
        - this.performedServicesTableContainer.nativeElement.getBoundingClientRect().top
        - (this.addPSButton ? this.addPSButton?.nativeElement.offsetHeight : 0);
      if (newHeight !== this.performedServicesTableHeight) {
        this.performedServicesTableHeight = newHeight;
      }
    }
  }
}
