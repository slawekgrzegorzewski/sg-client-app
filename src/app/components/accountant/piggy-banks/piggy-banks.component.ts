import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {Observable, of} from 'rxjs';
import {Currency} from '../../../model/accountant/currency';
import {CurrencyPipe, getCurrencySymbol} from '@angular/common';

export type EditMode = 'income' | 'expense' | 'edit' | 'create' | 'topup' | 'debit' | '';

@Component({
  selector: 'app-piggy-banks',
  templateUrl: './piggy-banks.component.html',
  styleUrls: ['./piggy-banks.component.css']
})
export class PiggyBanksComponent implements OnInit {
  @Input() title: string | null = null;
  @Input() adminMode = false;
  piggyBanksInternal: PiggyBank[] = [];

  @Input() get piggyBanks(): PiggyBank[] {
    return this.piggyBanksInternal;
  }

  set piggyBanks(value: PiggyBank[]) {
    this.piggyBanksInternal = value;
    (this.piggyBanksInternal || []).forEach(pg => {
      PiggyBanksComponent.calculateAndStoreSum(this.sumOfPiggyBanks, pg, pg.balance);
      PiggyBanksComponent.calculateAndStoreSum(this.sumOfMonthlyTopUps, pg, pg.monthlyTopUp);
    });
  }

  sumOfPiggyBanks = new Map<string, number>();
  sumOfMonthlyTopUps = new Map<string, number>();

  @Input() allCurrencies: Currency[] = [];
  @Output() updateEvent = new EventEmitter<PiggyBank>();
  @Output() createEvent = new EventEmitter<PiggyBank>();
  editMode: EditMode = '';

  overElement: PiggyBank | null = null;

  private editElementInternal: PiggyBank | null = null;

  get editElement(): PiggyBank | null {
    return this.editElementInternal;
  }

  set editElement(value: PiggyBank | null) {
    this.editElementInternal = value;
    this.monthlyTopUpEnabled = (this.editElementInternal?.monthlyTopUp || 0) > 0;
  }

  get editElementCurrency(): Currency | null {
    return this.allCurrencies.find(currency => currency.code === this.editElementInternal?.currency || '') || null;
  }

  set editElementCurrency(value: Currency | null) {
    if(this.editElementInternal) {
      this.editElementInternal.currency = value?.code || '';
    }
  }

  private monthlyTopUpEnabledInternal: boolean = false;

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

  @ViewChild('utilBox') utilBox: ElementRef | null = null;
  utilBoxTop: number = 0;
  utilBoxLeft: number = 0;
  utilBoxVisibility = 'hidden';

  constructor(private currencyPipe: CurrencyPipe) {
  }

  private static isEmptyString(value: string): boolean {
    return value === undefined || value === null || value.length === 0;
  }

  ngOnInit(): void {
  }

  private static calculateAndStoreSum(aMap: Map<string, number>, pg: PiggyBank, toAdd: number): void {
    let sum = aMap.get(pg.currency) || 0;
    sum += toAdd;
    aMap.set(pg.currency, sum);
  }

  setOverPiggyBank(piggyBank: PiggyBank | null, row: HTMLTableRowElement | null): void {
    this.overElement = piggyBank;
    if (piggyBank && row) {
      const adjustment = (row.offsetHeight - this.utilBox!.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - (this.utilBox!.nativeElement.offsetWidth / 2);
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  prepareToCreate(): void {
    if (this.adminMode) {
      this.prepareToEdit(new PiggyBank(this.currencyPipe, {}), 'create');
    }
  }

  prepareToGeneralEdit(): void {
    if (this.adminMode) {
      this.prepareToEdit(this.overElement, 'edit');
    }
  }

  prepareToTopUp(): void {
    this.prepareToEdit(this.overElement, 'topup');

  }

  prepareToDebit(): void {
    this.prepareToEdit(this.overElement, 'debit');
  }

  prepareToEdit(editElement: PiggyBank | null, editMode: EditMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  resetEditForm(): void {
    this.editMode = '';
    this.editElement = null;
    this.operationAmount = 0;
    this.setOverPiggyBank(null, null);
  }

  create(): void {
    if (this.editElement) {
      this.editElement.correctCurrencyToString();
      this.createEvent.emit(this.editElement);
    }
    this.resetEditForm();
  }

  update(): void {
    this.updateEditElement();
  }

  topUp(): void {
    if (this.editElement && this.operationAmount > 0) {
      this.editElement.balance += this.operationAmount;
      this.updateEditElement();
    } else {
      this.resetEditForm();
    }
  }

  debit(): void {
    if (this.editElement && this.operationAmount > 0) {
      this.editElement.balance -= this.operationAmount;
      this.updateEditElement();
    } else {
      this.resetEditForm();
    }
  }

  private updateEditElement(): void {
    if (this.editElement) {
      this.editElement.correctCurrencyToString();
      this.updateEvent.emit(this.editElement);
    }
    this.resetEditForm();
  }

  isNonEditMode(): boolean {
    return this.editMode === '';
  }

  isGeneralEditMode(): boolean {
    return this.editMode === 'edit';
  }

  isCreateEditMode(): boolean {
    return this.editMode === 'create';
  }

  isTopUpEditMode(): boolean {
    return this.editMode === 'topup';
  }

  isDebitEditMode(): boolean {
    return this.editMode === 'debit';
  }

  canCreate(): boolean {
    return this.isCreateEditMode() && !PiggyBanksComponent.isEmptyString(this.editElement?.name || '');
  }

  canEdit(): boolean {
    return this.isGeneralEditMode() && !PiggyBanksComponent.isEmptyString(this.editElement?.name || '');
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => of(that.allCurrencies);
  }

  getCurrencySymbol(currency: string): string {
    return getCurrencySymbol(currency, 'narrow');
  }
}
