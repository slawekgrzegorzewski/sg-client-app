import {Component, Input, OnInit} from '@angular/core';
import {AccountantSettings} from '../../../model/accountant/accountant-settings';
import {DomainService} from '../../../services/domain.service';
import {AccountantSettingsService} from '../../../services/accountant/accountant-settings.service';
import {NgEventBus} from 'ng-event-bus';
import {SELECTED_DOMAIN_CHANGED} from '../../../utils/event-bus-events';

@Component({
  selector: 'app-accountant-settings',
  templateUrl: './accountant-settings.component.html',
  styleUrls: ['./accountant-settings.component.css']
})
export class AccountantSettingsComponent implements OnInit {

  @Input() accountantSettings: AccountantSettings | null = null;

  constructor(
    private accountantSettingsService: AccountantSettingsService,
    private domainService: DomainService,
    private eventBus: NgEventBus) {
  }

  ngOnInit(): void {
    this.getSettings();
    this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.getSettings();
    });
  }

  private getSettings() {
    this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
  }

  changeIsCompany(): void {
    if (this.accountantSettings) {
      this.accountantSettings.company = !this.accountantSettings.company;
      this.accountantSettingsService.setIsCompany(this.accountantSettings.company)
        .subscribe(data => {
      });
    }
  }
}
