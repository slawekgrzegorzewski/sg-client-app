import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Currency} from '../../model/currency';
import {ClientPayment} from '../../model/client-payment';
import {Client} from '../../model/client';
import {SimplePerformedServicePayment} from '../../model/simple-performed-service-payment';
import {PerformedService} from '../../model/performed-service';
import {PaymentStatus} from '../../model/payable';
import {PayableGroup} from '../../model/payable-groupper';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';
import {NgEventBus} from 'ng-event-bus';
import {AppSize, SizeService} from '../../../general/services/size.service';
import {APP_SIZE_EVENT} from '../../../general/utils/event-bus-events';
import {MetaData} from 'ng-event-bus/lib/meta-data';

export type EditMode = 'edit' | 'create' | '';
export type GroupingButtonsPosition = 'head' | 'bottom';
export type ClientPaymentsDisplayType = 'desktop' | 'mobile';

enum Grouping {
  LACK, BY_CLIENTS, BY_RECEIPT_TYPE
}

@Component({
  selector: 'app-client-payments',
  templateUrl: './client-payments.component.html',
  styleUrls: ['./client-payments.component.css']
})
export class ClientPaymentComponent implements OnInit {

  @Input() clientPaymentsDisplayType: ClientPaymentsDisplayType = 'desktop';
  @Input() title: string | null = null;
  @Input() editable = true;
  @Input() groupingButtonsPosition: GroupingButtonsPosition = 'head';

  groupingMode = Grouping.LACK;

  clientPaymentsInternal: ClientPayment[] = [];

  @Input() get clientPayments(): ClientPayment[] {
    return this.clientPaymentsInternal;
  }

  set clientPayments(value: ClientPayment[]) {
    this.clientPaymentsInternal = (value || []).sort(ClientPayment.compareByDateAndCurrencyAndId);
    this.totalIncomes.clear();
    this.clientPaymentsInternal.forEach(cp => this.totalIncomes.set(cp.currency, (this.totalIncomes.get(cp.currency) || 0) + cp.price));
    this.group();
  }

  displayData: PayableGroup<ClientPayment>[] = [];
  totalIncomes = new Map<string, number>();

  @Input() allCurrencies: Currency[] = [];
  @Input() clients: Client[] = [];
  @Input() performedServices: PerformedService[] = [];

  @Output() updateEvent = new EventEmitter<ClientPayment>();
  @Output() createEvent = new EventEmitter<ClientPayment>();

  editMode: EditMode = '';
  editElement: ClientPayment | null = null;

  selectedGroup: PayableGroup<ClientPayment> | null = null;
  private selectedElement: ClientPayment | null = null;

  showClientColumn = true;
  showReceiptTypeColumns = true;
  numberOfColumns = 8;
  clientPaymentsTableContainerHeight: number = 0;

  private _clientPaymentsTableContainer: ElementRef | null | undefined = null;
  @ViewChild('clientPaymentsTableContainer') get clientPaymentsTableContainer(): ElementRef | null | undefined {
    return this._clientPaymentsTableContainer;
  }

  set clientPaymentsTableContainer(value: ElementRef | null | undefined) {
    this._clientPaymentsTableContainer = value;
    setTimeout(() => this.sizeLayout(), 1);
  }

  private _addCPButton: ElementRef | null | undefined = null;
  @ViewChild('addCPButton') get addCPButton(): ElementRef | null | undefined {
    return this._addCPButton;
  }

  set addCPButton(value: ElementRef | null | undefined) {
    this._addCPButton = value;
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

  constructor(
    private eventBus: NgEventBus,
    private sizeService: SizeService) {
    this.eventBus.on<AppSize>(APP_SIZE_EVENT).subscribe((event: MetaData) => {
      this.availableHeight = (event.data as AppSize).height;
    });
    this.availableHeight = sizeService.size.height;
  }

  ngOnInit(): void {
    this.resetColumnsVisibility();
  }

  //region Grouping data
  public isGrouped(): boolean {
    return this.groupingMode !== Grouping.LACK;
  }

  public noGrouping(): void {
    this.group(Grouping.LACK);
  }

  public byClients(): void {
    this.group(Grouping.BY_CLIENTS);
  }

  public byReceiptType(): void {
    this.group(Grouping.BY_RECEIPT_TYPE);
  }

  private group(groupingMode: Grouping = this.groupingMode): void {
    this.groupingMode = groupingMode;
    switch (this.groupingMode) {
      case Grouping.LACK:
        this.disableGrouping();
        break;
      case Grouping.BY_CLIENTS:
        this.groupByClients();
        break;
      case Grouping.BY_RECEIPT_TYPE:
        this.groupByReceiptType();
        break;
    }
    if (this.groupingMode === Grouping.LACK) {
      this.selectedGroup = this.displayData.length > 0 ? this.displayData[0] : null;
    } else {
      this.reselectGroup();
    }
    this.adjustTableColumns();
  }

  private disableGrouping(): void {
    this.displayData = PayableGroup.groupData(
      this.clientPayments,
      ps => -1,
      ps => '',
      ComparatorBuilder.comparingByDateDays<ClientPayment>(cp => cp?.date || new Date(0)).desc()
        .thenComparing(cp => cp?.client?.name || '')
        .thenComparing(cp => cp?.price || 0)
        .build()
    );
  }

  private groupByClients(): void {
    this.displayData = PayableGroup.groupData(
      this.clientPayments,
      cp => cp && cp.client && cp.client.id || -1,
      cp => cp && cp.client && cp.client.name || '',
      ComparatorBuilder.comparingByDateDays<ClientPayment>(cp => cp?.date || new Date(0))
        .thenComparing(cp => cp?.price || 0)
        .build()
    );
  }

  private groupByReceiptType(): void {

    function convertReceiptTypeToId(cp: ClientPayment): number {
      return cp.invoice ? 1 : cp.billOfSale ? 2 : cp.billOfSaleAsInvoice ? 3 : cp.notRegistered ? 4 : 5;
    }

    this.displayData = PayableGroup.groupData(
      this.clientPayments,
      cp => cp && convertReceiptTypeToId(cp),
      cp => cp && this.convertReceiptTypeToName(cp),
      ComparatorBuilder.comparingByDateDays<ClientPayment>(cp => cp?.date || new Date(0))
        .thenComparing(cp => cp?.client?.name || '')
        .thenComparing(cp => cp?.price || 0)
        .build()
    );
  }

  private reselectGroup(): void {
    if (this.selectedGroup !== null) {
      const title = this.selectedGroup.title;
      this.selectedGroup = (this.displayData || []).find(g => g.title === title) || null;
    }
  }

  private adjustTableColumns() {
    this.resetColumnsVisibility();
    switch (this.groupingMode) {
      case Grouping.BY_CLIENTS:
        this.showClientColumn = false;
        break;
      case Grouping.BY_RECEIPT_TYPE:
        this.showReceiptTypeColumns = false;
        break;
    }
    this.numberOfColumns = (this.showClientColumn ? 1 : 0) + (this.showReceiptTypeColumns ? 4 : 0) + 3;
  }

  private resetColumnsVisibility(): void {
    this.showClientColumn = true;
    this.showReceiptTypeColumns = this.clientPaymentsDisplayType === 'desktop';
  }

  //endregion

  public isShowExtraReceiptTypeRow(clientPayment: ClientPayment): boolean {
    return this.clientPaymentsDisplayType == 'mobile'
      && (clientPayment.billOfSale
        || clientPayment.billOfSaleAsInvoice
        || clientPayment.invoice
        || clientPayment.notRegistered);
  }

  public convertReceiptTypeToName(cp: ClientPayment): string {
    return cp.invoice
      ? 'faktura'
      : cp.billOfSale
        ? 'paragon'
        : cp.billOfSaleAsInvoice
          ? 'paragon jako faktura'
          : cp.notRegistered
            ? 'na czarno'
            : 'brak';
  }

  public prepareToCreate(): void {
    const clientPayment = new ClientPayment();
    clientPayment.currency = 'PLN';
    clientPayment.date = new Date();
    this.prepareToEdit(clientPayment, 'create');
  }

  public prepareToGeneralEdit(): void {
    if (this.selectedElement) {
      this.prepareToEdit(this.selectedElement, 'edit');
    }
  }

  private prepareToEdit(editElement: ClientPayment, editMode: EditMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  public resetEditForm(): void {
    this.editMode = '';
    this.editElement = null;
  }

  public createClientPayment(clientPayment: ClientPayment): void {
    this.createEvent.emit(clientPayment);
    this.resetEditForm();
  }

  public updateClientPayment(): void {
    if (this.editElement) {
      this.updateEvent.emit(this.editElement);
      this.resetEditForm();
    }
  }

  public isNonEditMode(): boolean {
    return this.editMode === '';
  }

  public isGeneralEditMode(): boolean {
    return this.editMode === 'edit';
  }

  public isCreateEditMode(): boolean {
    return this.editMode === 'create';
  }

  public selectGroup(payableGroup: PayableGroup<ClientPayment>): void {
    if (this.isEqualToSelectedGroup(payableGroup)) {
      this.selectedGroup = null;
    } else {
      this.selectedGroup = payableGroup;
    }
  }

  public selectClientPayment(clientPayment: ClientPayment): void {
    if (this.isEqualToSelectedElement(clientPayment)) {
      this.selectedElement = null;
    } else {
      this.selectedElement = clientPayment;
    }
  }

  public isEqualToSelectedGroup(payableGroup: PayableGroup<ClientPayment>): boolean {
    return this.selectedGroup !== null && this.selectedGroup.isEqual(payableGroup);
  }

  public isEqualToSelectedElement(clientPayment: ClientPayment): boolean {
    return this.selectedElement !== null && this.selectedElement.id === clientPayment.id;
  }

  public getGroupClass(payableGroup: PayableGroup<ClientPayment>): string {
    if (this.isEqualToSelectedGroup(payableGroup)) {
      return '';
    }
    return this.getPaymentStatusClass(payableGroup.status);
  }

  public getClientPaymentClass(clientPayment: ClientPayment): string {
    const paymentStatus = clientPayment.getPaymentStatus();
    return this.getPaymentStatusClass(paymentStatus);
  }

  private getPaymentStatusClass(paymentStatus: PaymentStatus): string {
    if (paymentStatus === PaymentStatus.PAID) {
      return 'paid-ps';
    }
    if (paymentStatus === PaymentStatus.NOT_PAID) {
      return 'not-paid-ps';
    }
    if (paymentStatus === PaymentStatus.UNDERPAID) {
      return 'underpaid-ps';
    }
    return '';
  }

  public getServiceRelations(clientPayment: ClientPayment): { date: Date, service: string, price: number, currency: string }[] {
    type PaymentAndPerformedServices = {
      performedServicePayment: SimplePerformedServicePayment,
      performedService: PerformedService | undefined
    }
    return clientPayment.serviceRelations
      .map(p => {
        return {
          performedServicePayment: p,
          performedService: this.performedServices.find(cp => cp.id === p.performedServiceId)
        };
      })
      .filter((p: PaymentAndPerformedServices) => p.performedService !== undefined)
      .map(p => {
        return {
          date: p.performedService!.date,
          service: p.performedService!.service?.name || '',
          price: p.performedServicePayment.price,
          currency: p.performedServicePayment.currency
        };
      })
      .sort(ComparatorBuilder.comparingByDateDays<{ date: Date, service: string, price: number, currency: string }>(ps => ps?.date || new Date(0))
        .thenComparing(ps => ps.service)
        .thenComparing(ps => ps.price || 0)
        .build());
  }

  private sizeLayout(): void {
    if (this.clientPaymentsTableContainer) {
      const newHeight = this.availableHeight
        - this.clientPaymentsTableContainer.nativeElement.getBoundingClientRect().top
        - (this.addCPButton ? this.addCPButton.nativeElement.offsetHeight : 0);
      if (newHeight !== this.clientPaymentsTableContainerHeight) {
        this.clientPaymentsTableContainerHeight = newHeight;
      }
    }
  }
}
