import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AccountantSettings} from '../../../model/accountant/accountant-settings';

@Component({
  selector: 'app-accountant-settings',
  templateUrl: './accountant-settings.component.html',
  styleUrls: ['./accountant-settings.component.css']
})
export class AccountantSettingsComponent implements OnInit {

  @Input() accountantSettings: AccountantSettings;

  @Output() isCompanyUpdateEvent = new EventEmitter<AccountantSettings>();


  constructor() {
  }

  ngOnInit(): void {
  }

  changeIsCompany(): void {
    this.accountantSettings.company = !this.accountantSettings.company;
    this.isCompanyUpdateEvent.emit(this.accountantSettings);
  }
}
