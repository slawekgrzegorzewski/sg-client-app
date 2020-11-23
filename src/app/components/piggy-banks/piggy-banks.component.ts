import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ToastService} from '../../services/toast.service';
import {PiggyBank} from '../../model/piggy-bank';
import {Observable, of} from 'rxjs';
import {Currency} from '../../model/currency';
import {NgEventBus} from 'ng-event-bus';

export const INCOME = 'income';
export const EXPENSE = 'expense';
const GENERAL_EDIT_MODE = 'general';
const CREATE_EDIT_MODE = 'create';
const TOPUP_EDIT_MODE = 'topup';
const DEBIT_EDIT_MODE = 'debit';
const EMPTY_EDIT_MODE = '';

@Component({
  selector: 'app-piggy-banks',
  templateUrl: './piggy-banks.component.html',
  styleUrls: ['./piggy-banks.component.css']
})
export class PiggyBanksComponent implements OnInit {
  @Input() adminMode: boolean;
  @Input() piggyBanks: PiggyBank[] = [];
  @Input() allCurrencies: Currency[];
  @Output() updateEvent = new EventEmitter<PiggyBank>();
  @Output() createEvent = new EventEmitter<PiggyBank>();
  editMode: string = EMPTY_EDIT_MODE;

  private editElementInternal: PiggyBank;

  get editElement(): PiggyBank {
    return this.editElementInternal;
  }

  set editElement(value: PiggyBank) {
    this.editElementInternal = value;
    this.monthlyTopUpEnabled = this.editElementInternal?.monthlyTopUp > 0;
  }

  private monthlyTopUpEnabledInternal = false;

  get monthlyTopUpEnabled(): boolean {
    return this.monthlyTopUpEnabledInternal;
  }

  set monthlyTopUpEnabled(value: boolean) {
    this.monthlyTopUpEnabledInternal = value;
    if (!this.monthlyTopUpEnabledInternal) {
      if (this.editElement) {
        this.editElement.monthlyTopUp = 0;
      }
    }
  }

  operationAmount = 0;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: PiggyBank;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor(
    private eventBus: NgEventBus,
    private toastService: ToastService
  ) {
  }

  private static isEmptyString(value: string): boolean {
    return value === undefined || value === null || value.length === 0;
  }

  ngOnInit(): void {
  }

  setOverPiggyBank(piggyBank: PiggyBank, row: HTMLTableRowElement): void {
    this.overElement = piggyBank;
    if (piggyBank) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): PiggyBank {
    const acc = this.overElement;
    this.setOverPiggyBank(null, null);
    return acc;
  }

  prepareToCreate(): void {
    if (this.adminMode) {
      this.prepareToEdit(new PiggyBank(), CREATE_EDIT_MODE);
    }
  }

  prepareToGeneralEdit(): void {
    if (this.adminMode) {
      this.prepareToEdit(this.overElement, GENERAL_EDIT_MODE);
    }
  }

  prepareToTopUp(): void {
    this.prepareToEdit(this.overElement, TOPUP_EDIT_MODE);

  }

  prepareToDebit(): void {
    this.prepareToEdit(this.overElement, DEBIT_EDIT_MODE);
  }

  prepareToEdit(editElement: PiggyBank, editMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  resetEditForm(): void {
    this.editMode = EMPTY_EDIT_MODE;
    this.editElement = null;
    this.operationAmount = 0;
    this.setOverPiggyBank(null, null);
  }

  create(): void {
    this.createEvent.emit(this.editElement);
    this.resetEditForm();
  }

  update(): void {
    this.updateEditElement();
  }

  topUp(): void {
    if (this.operationAmount > 0) {
      this.editElement.balance += this.operationAmount;
      this.updateEditElement();
    } else {
      this.resetEditForm();
    }
  }

  debit(): void {
    if (this.operationAmount > 0) {
      this.editElement.balance -= this.operationAmount;
      this.updateEditElement();
    } else {
      this.resetEditForm();
    }
  }

  private updateEditElement(): void {
    this.updateEvent.emit(this.editElement);
    this.resetEditForm();
  }

  isNonEditMode(): boolean {
    return this.editMode === EMPTY_EDIT_MODE;
  }

  isGeneralEditMode(): boolean {
    return this.editMode === GENERAL_EDIT_MODE;
  }

  isCreateEditMode(): boolean {
    return this.editMode === CREATE_EDIT_MODE;
  }

  isTopUpEditMode(): boolean {
    return this.editMode === TOPUP_EDIT_MODE;
  }

  isDebitEditMode(): boolean {
    return this.editMode === DEBIT_EDIT_MODE;
  }

  canCreate(): boolean {
    return this.isCreateEditMode()
      && !PiggyBanksComponent.isEmptyString(this.editElement.name);
  }

  canEdit(): boolean {
    return this.isGeneralEditMode()
      && !PiggyBanksComponent.isEmptyString(this.editElement.name);
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => of(that.allCurrencies);
  }

  currencyIdExtractor(currency: Currency): string {
    if (!currency) {
      return null;
    }
    return currency.code;
  }

  currencyToString(currency: Currency): string {
    return currency.description();
  }
}
