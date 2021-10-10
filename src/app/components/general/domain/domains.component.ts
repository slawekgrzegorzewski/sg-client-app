import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Currency} from '../../../model/accountant/currency';
import {DetailedDomain} from '../../../model/domain';

export type EditMode = 'edit' | 'create' | 'invite' | '';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit {
  @Input() title: string | null = null;
  @Input() adminMode = false;
  @Input() currentUserLogin = '';

  domainsInternal: DetailedDomain[] = [];

  @Input() get domains(): DetailedDomain[] {
    return this.domainsInternal;
  }

  set domains(value: DetailedDomain[]) {
    this.domainsInternal = value;
    if (this.editElement) {
      const currentEditMode = this.editMode;
      const newDomain = this.domainsInternal.find(d => this.editElement && d.id === this.editElement.id);
      this.editMode = '';
      this.editElement = null;
      if (newDomain) {
        setTimeout(() => this.prepareToEdit(newDomain, currentEditMode), 0.001);
      }
    }
    if (this.overElement) {
      this.overElement = this.domainsInternal.find(d => d.id === this.overElement!.id) || null;
    }
  }

  @Input() allCurrencies: Currency[] = [];
  @Output() updateEvent = new EventEmitter<DetailedDomain>();
  @Output() createEvent = new EventEmitter<DetailedDomain>();
  @Output() changeUserAccessEvent = new EventEmitter<{ domain: DetailedDomain; user: string }>();
  @Output() removeUserFromDomainEvent = new EventEmitter<{ domain: DetailedDomain; user: string }>();
  @Output() inviteUserToDomainEvent = new EventEmitter<{ domain: DetailedDomain; user: string }>();

  editMode: EditMode = '';

  editElementInternal: DetailedDomain | null = null;

  get editElement(): DetailedDomain | null {
    return this.editElementInternal;
  }

  set editElement(value: DetailedDomain | null) {
    this.editElementInternal = value;
    this.setIsDomainAdmin(value);
    this.setIsDomainOnlyAdmin(value);
  }

  isDomainAdmin = false;
  isDomainOnlyAdmin = false;

  operationAmount = 0;

  @ViewChild('utilBox') utilBox: ElementRef | null = null;

  overElementInternal: DetailedDomain | null = null;

  get overElement(): DetailedDomain | null {
    return this.overElementInternal;
  }

  set overElement(value: DetailedDomain | null) {
    this.overElementInternal = value;
    this.setIsDomainAdmin(value);
    this.setIsDomainOnlyAdmin(value);
  }

  utilBoxTop: number = 0;
  utilBoxLeft: number = 0;
  utilBoxVisibility = 'hidden';
  userToInviteLogin = '';

  constructor() {
  }

  private static isEmptyString(value: string): boolean {
    return value === undefined || value === null || value.length === 0;
  }

  ngOnInit(): void {
  }

  setOverDomain(domain: DetailedDomain | null, row: HTMLTableRowElement | null): void {
    this.overElement = domain;
    if (domain && row) {
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
      this.prepareToEdit(new DetailedDomain(), 'create');
    }
  }

  prepareToGeneralEdit(): void {
    if (this.adminMode && this.overElement) {
      this.prepareToEdit(this.overElement, 'edit');
    }
  }

  prepareToInvitationEdit(): void {
    if (this.adminMode && this.overElement) {
      this.prepareToEdit(this.overElement, 'invite');
    }
  }

  prepareToEdit(editElement: DetailedDomain, editMode: EditMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  resetEditForm(): void {
    this.editMode = '';
    this.editElement = null;
    this.operationAmount = 0;
    this.setOverDomain(null, null);
  }

  resetInviteForm(): void {
    this.editMode = '';
    this.userToInviteLogin = '';
  }

  create(): void {
    if (this.editElement) {
      this.createEvent.emit(this.editElement);
    }
    this.resetEditForm();
  }

  update(): void {
    this.updateEditElement();
  }

  private updateEditElement(): void {
    if (this.editElement) {
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

  isInviteEditMode(): boolean {
    return this.editMode === 'invite';
  }

  canCreate(): boolean {
    return this.isCreateEditMode() && !DomainsComponent.isEmptyString(this.editElement?.name || '');
  }

  canEdit(): boolean {
    return this.isGeneralEditMode() && !DomainsComponent.isEmptyString(this.editElement?.name || '');
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => of(that.allCurrencies);
  }

  setIsDomainAdmin(domain: DetailedDomain | null): void {
    this.isDomainAdmin = false;
    if (domain && domain.usersAccessLevel) {
      for (const [key, value] of domain.usersAccessLevel) {
        if (key === this.currentUserLogin && value === 'ADMIN') {
          this.isDomainAdmin = true;
        }
      }
    }
  }

  private countDomainAdmins(domain: DetailedDomain | null): number {
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

  setIsDomainOnlyAdmin(domain: DetailedDomain | null): void {
    this.isDomainOnlyAdmin = this.isDomainAdmin && this.countDomainAdmins(domain) === 1;
  }

  showDomainMembersToEdit(): boolean {
    return this.isGeneralEditMode() && this.isDomainAdmin;
  }

  changeMemberAccess(usr: string): void {
    if (this.editElement) {
      this.changeUserAccessEvent.emit({domain: this.editElement, user: usr});
    }
  }

  removeFromDomain(usr: string): void {
    if (this.editElement) {
      this.removeUserFromDomainEvent.emit({domain: this.editElement, user: usr});
    }
  }

  invite(): void {
    if (this.editElement) {
      this.inviteUserToDomainEvent.emit({domain: this.editElement, user: this.userToInviteLogin});
    }
    this.resetInviteForm();
  }

  leaveDomain(): void {
    if (this.overElement) {
      this.removeUserFromDomainEvent.emit({domain: this.overElement, user: this.currentUserLogin});
    }
  }
}
