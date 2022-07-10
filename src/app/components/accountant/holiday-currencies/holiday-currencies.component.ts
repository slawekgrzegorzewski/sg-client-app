import {Component, OnDestroy, OnInit} from '@angular/core';
import {HolidayCurrenciesService} from '../../../services/accountant/holiday-currencies.service';
import {HolidayCurrencies} from 'src/app/model/accountant/holiday-currencies';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../services/domain.service';

export const HOLIDAY_CURRENCIES_ROUTER_URL = 'holiday-currencies';

@Component({
  selector: 'app-holiday-currencies',
  templateUrl: './holiday-currencies.component.html',
  styleUrls: ['./holiday-currencies.component.css']
})
export class HolidayCurrenciesComponent implements OnInit, OnDestroy {

  edit = false;
  holidayCurrencies: HolidayCurrencies | null = null;

  private eurPriceInternal: number = 0;

  get eurPrice(): number {
    return this.eurPriceInternal;
  }

  set eurPrice(value: number) {
    this.eurPriceInternal = value;
    if (this.holidayCurrencies) {
      this.eurInPln = this.eurPrice * this.holidayCurrencies.euroConversionRate;
    } else {
      this.eurInPln = 0;
    }
  }

  eurInPln: number = 0;

  private kunPriceInternal: number = 0;

  get kunPrice(): number {
    return this.kunPriceInternal;
  }

  set kunPrice(value: number) {
    this.kunPriceInternal = value;
    if (this.holidayCurrencies) {
      this.kunInPln = this.kunPrice * this.holidayCurrencies.kunaConversionRate;
    } else {
      this.kunInPln = 0;
    }
  }

  kunInPln: number = 0;

  private plnPriceInternal: number = 0;

  get plnPrice(): number {
    return this.plnPriceInternal;
  }

  set plnPrice(value: number) {
    this.plnPriceInternal = value;
    if (this.holidayCurrencies) {
      this.plnInKun = this.plnPrice / this.holidayCurrencies.kunaConversionRate;
      this.plnInEur = this.plnPrice / this.holidayCurrencies.euroConversionRate;
    } else {
      this.plnInKun = 0;
      this.plnInEur = 0;
    }
  }

  plnInKun: number = 0;
  plnInEur: number = 0;

  domainSubscription: Subscription | null = null;

  constructor(private holidayCurrenciesService: HolidayCurrenciesService,
              private route: ActivatedRoute,
              private domainService: DomainService) {
    this.domainService.registerToDomainChangesViaRouterUrl(HOLIDAY_CURRENCIES_ROUTER_URL, this.route);
    this.domainSubscription = this.domainService.currentDomainChangeEvent.subscribe((domain) => {
      this.reset();
    });
  }

  ngOnInit(): void {
    this.holidayCurrenciesService.currentDomain().subscribe(hc => this.holidayCurrencies = hc);
    this.reset();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(HOLIDAY_CURRENCIES_ROUTER_URL);
  }

  setEditMode(): void {
    this.edit = true;
  }

  save(): void {
    if (this.holidayCurrencies) {
      this.holidayCurrenciesService.update(this.holidayCurrencies).subscribe(hc => this.reset(), err => this.reset());
    }
  }

  cancel(): void {
    this.holidayCurrenciesService.currentDomain().subscribe(hc => {
      this.holidayCurrencies = hc;
      this.edit = false;
    }, error => this.edit = false);
  }

  reset(): void {
    this.edit = false;
    this.eurPriceInternal = 0;
    this.eurInPln = 0;
    this.kunPriceInternal = 0;
    this.kunInPln = 0;
    this.plnPriceInternal = 0;
    this.plnInKun = 0;
    this.plnInEur = 0;
  }
}
