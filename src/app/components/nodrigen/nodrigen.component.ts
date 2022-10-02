import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NodrigenService} from '../../services/banks/nodrigen.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DomainService} from '../../services/domain.service';
import {NodrigenInstitution} from '../../model/banks/nodrigen/nodrigen-institution';
import {NodrigenPermission} from '../../model/banks/nodrigen/nodrigen-permission';
import {BanksService} from '../../services/banks/banks.service';


@Component({
  selector: 'nodrigen',
  templateUrl: './nodrigen.component.html',
  styleUrls: ['./nodrigen.component.css']
})
export class NodrigenComponent implements OnInit {

  permissionsGranted: NodrigenPermission[] = [];
  permissionsToProcess: NodrigenPermission[] = [];
  institutionsToRecreate: NodrigenInstitution[] = [];
  institutions: NodrigenInstitution[] = [];

  constructor(private banksService: BanksService,
              private nodrigenService: NodrigenService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.hasOwnProperty('ref')) {
        this.nodrigenService.confirmPermission(queryParams['ref'])
          .subscribe(value => this.removeRefFromQueryParams(), value => this.removeRefFromQueryParams());
      } else {
        this.getPermissions();
      }
    });
  }

  removeRefFromQueryParams() {
    this.router.navigate([], {queryParams: {}});
  }

  private getPermissions() {
    this.nodrigenService.getPermissionsGranted().subscribe(permissions => this.permissionsGranted = permissions);
    this.nodrigenService.getPermissionsToProcess().subscribe(permissions => this.permissionsToProcess = permissions);
    this.nodrigenService.getInstitutionsToRecreate().subscribe(institutions => this.institutionsToRecreate = institutions);
  }

  createPermissions(institutionId: string, maxHistoricalDays: number) {
    this.institutions = [];
    this.nodrigenService.getInstitutionsToRecreate().subscribe(institutions => this.institutionsToRecreate = institutions);
    this.nodrigenService.startPermissionRequest(institutionId, maxHistoricalDays, document.location.href, 'pl')
      .subscribe(permissions => this.permissionsToProcess = permissions);
  }

  showListOfInstitutions() {
    this.nodrigenService.listInstitutions('pl').subscribe(v => this.institutions = v);
  }

  fetchAllTransactions() {
    this.banksService.fetchAllTransactions().subscribe(v => {
    });
  }

  fetchAllBalances() {
    this.banksService.fetchAllBalances().subscribe(v => {
    });
  }

  updateDateFromProvider(externalId: string) {
    this.nodrigenService.fetchBankAccountData(externalId).subscribe();
  }
}
