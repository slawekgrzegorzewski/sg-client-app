import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Currency} from '../../../model/accountant/currency';
import {getCurrencySymbol} from '@angular/common';
import {DetailedDomain} from '../../../model/domain';

const GENERAL_EDIT_MODE = 'general';
const CREATE_EDIT_MODE = 'create';
const INVITE_EDIT_MODE = 'invite';
const EMPTY_EDIT_MODE = '';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit {
  @Input() title: string;
  @Input() adminMode: boolean;
  @Input() currentUserLogin: string;
  domainsInternal: DetailedDomain[] = [];

  @Input() get domains(): DetailedDomain[] {
    return this.domainsInternal;
  }

  set domains(value: DetailedDomain[]) {
    this.domainsInternal = value;
    if (this.editElement) {
      const currentEditMode = this.editMode;
      const newDomain = this.domainsInternal.find(d => d.id === this.editElement.id);
      this.editMode = EMPTY_EDIT_MODE;
      this.editElement = null;
      setTimeout(() => this.prepareToEdit(newDomain, currentEditMode), 0.001);
    }
    if (this.overElement) {
      this.overElement = this.domainsInternal.find(d => d.id === this.overElement.id);
    }
  }

  @Input() allCurrencies: Currency[];
  @Output() updateEvent = new EventEmitter<DetailedDomain>();
  @Output() createEvent = new EventEmitter<DetailedDomain>();
  @Output() changeUserAccessEvent = new EventEmitter<{ domain: DetailedDomain; user: string }>();
  @Output() removeUserFromDomainEvent = new EventEmitter<{ domain: DetailedDomain; user: string }>();
  @Output() inviteUserToDomainEvent = new EventEmitter<{ domain: DetailedDomain; user: string }>();

  editMode: string = EMPTY_EDIT_MODE;

  editElementInternal: DetailedDomain;

  get editElement(): DetailedDomain {
    return this.editElementInternal;
  }

  set editElement(value: DetailedDomain) {
    this.editElementInternal = value;
    this.setIsDomainAdmin(value);
    this.setIsDomainOnlyAdmin(value);
  }

  isDomainAdmin: boolean;
  isDomainOnlyAdmin: boolean;

  operationAmount = 0;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElementInternal: DetailedDomain;

  get overElement(): DetailedDomain {
    return this.overElementInternal;
  }

  set overElement(value: DetailedDomain) {
    this.overElementInternal = value;
    this.setIsDomainAdmin(value);
    this.setIsDomainOnlyAdmin(value);
  }

  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';
  userToInviteLogin: string;

  constructor() {
  }

  private static isEmptyString(value: string): boolean {
    return value === undefined || value === null || value.length === 0;
  }

  ngOnInit(): void {
  }

  setOverDomain(domain: DetailedDomain, row: HTMLTableRowElement): void {
    this.overElement = domain;
    if (domain) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - (this.utilBox.nativeElement.offsetWidth / 2);
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): DetailedDomain {
    const acc = this.overElement;
    this.setOverDomain(null, null);
    return acc;
  }

  prepareToCreate(): void {
    if (this.adminMode) {
      this.prepareToEdit(new DetailedDomain(), CREATE_EDIT_MODE);
    }
  }

  prepareToGeneralEdit(): void {
    if (this.adminMode) {
      this.prepareToEdit(this.overElement, GENERAL_EDIT_MODE);
    }
  }

  prepareToInvitationEdit(): void {
    if (this.adminMode) {
      this.prepareToEdit(this.overElement, INVITE_EDIT_MODE);
    }
  }

  prepareToEdit(editElement: DetailedDomain, editMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  resetEditForm(): void {
    this.editMode = EMPTY_EDIT_MODE;
    this.editElement = null;
    this.operationAmount = 0;
    this.setOverDomain(null, null);
  }

  resetInviteForm(): void {
    this.editMode = EMPTY_EDIT_MODE;
    this.userToInviteLogin = null;
  }

  create(): void {
    this.createEvent.emit(this.editElement);
    this.resetEditForm();
  }

  update(): void {
    this.updateEditElement();
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

  isInviteEditMode(): boolean {
    return this.editMode === INVITE_EDIT_MODE;
  }

  canCreate(): boolean {
    return this.isCreateEditMode()
      && !DomainsComponent.isEmptyString(this.editElement.name);
  }

  canEdit(): boolean {
    return this.isGeneralEditMode()
      && !DomainsComponent.isEmptyString(this.editElement.name);
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

  getCurrencySymbol(currency: string): string {
    return getCurrencySymbol(currency, 'narrow');
  }

  setIsDomainAdmin(domain: DetailedDomain): void {
    this.isDomainAdmin = false;
    if (domain && domain.usersAccessLevel) {
      for (const [key, value] of domain.usersAccessLevel) {
        if (key === this.currentUserLogin && value === 'ADMIN') {
          this.isDomainAdmin = true;
        }
      }
    }
  }

  private countDomainAdmins(domain: DetailedDomain): number {
    if (!domain || !domain.usersAccessLevel) {
      return 0;
    }
    let count = 0;
    for (const [key, value] of domain.usersAccessLevel) {
      if (key === this.currentUserLogin && value === 'ADMIN') {
        count++;
      }
    }
    return count;
  }

  setIsDomainOnlyAdmin(domain: DetailedDomain): void {
    this.isDomainOnlyAdmin = this.isDomainAdmin && this.countDomainAdmins(domain) === 1;
  }

  showDomainMembersToEdit(): boolean {
    return this.isGeneralEditMode() && this.isDomainAdmin;
  }

  changeMemberAccess(usr: string): void {
    this.changeUserAccessEvent.emit({domain: this.editElement, user: usr});
  }

  removeFromDomain(usr: string): void {
    this.removeUserFromDomainEvent.emit({domain: this.editElement, user: usr});
  }

  invite(): void {
    this.inviteUserToDomainEvent.emit({domain: this.editElement, user: this.userToInviteLogin});
    this.resetInviteForm();
  }

  leaveDomain(): void {
    this.removeUserFromDomainEvent.emit({domain: this.overElement, user: this.currentUserLogin});
  }
}
