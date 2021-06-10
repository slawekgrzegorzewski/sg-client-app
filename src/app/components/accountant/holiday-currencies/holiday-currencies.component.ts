import {Component, OnInit} from '@angular/core';
import {HolidayCurrenciesService} from '../../../services/accountant/holiday-currencies.service';
import {HolidayCurrencies} from 'src/app/model/accountant/holiday-currencies';

@Component({
  selector: 'app-holiday-currencies',
  templateUrl: './holiday-currencies.component.html',
  styleUrls: ['./holiday-currencies.component.css']
})
export class HolidayCurrenciesComponent implements OnInit {

  edit = false;
  holidayCurrencies: HolidayCurrencies;
  private _eurPrice: number;

  get eurPrice(): number {
    return this._eurPrice;
  }

  set eurPrice(value: number) {
    this._eurPrice = value;
    this.eurInPln = this.eurPrice * this.holidayCurrencies.euroConversionRate;
  }

  eurInPln: number;

  private _kunPrice: number;
  get kunPrice(): number {
    return this._kunPrice;
  }

  set kunPrice(value: number) {
    this._kunPrice = value;
    this.kunInPln = this.kunPrice * this.holidayCurrencies.kunaConversionRate;
  }

  kunInPln: number;
  private _plnPrice: number;
  get plnPrice(): number {
    return this._plnPrice;
  }

  set plnPrice(value: number) {
    this._plnPrice = value;
    this.plnInKun = this.plnPrice / this.holidayCurrencies.kunaConversionRate;
    this.plnInEur = this.plnPrice / this.holidayCurrencies.euroConversionRate;
  }

  plnInKun: number;
  plnInEur: number;

  constructor(private holidayCurrenciesService: HolidayCurrenciesService) {
  }

  ngOnInit(): void {
    this.holidayCurrenciesService.currentDomain().subscribe(hc => this.holidayCurrencies = hc);
    this.reset();
  }

  setEditMode(): void {
    this.edit = true;
  }

  save(): void {
    this.holidayCurrenciesService.update(this.holidayCurrencies).subscribe(hc => this.reset(), err => this.reset());
  }

  cancel(): void {
    this.holidayCurrenciesService.currentDomain().subscribe(hc => {
      this.holidayCurrencies = hc;
      this.edit = false;
    }, error => this.edit = false);
  }

  reset(): void {
    this.edit = false;
    this._eurPrice = 0;
    this.eurInPln = 0;
    this._kunPrice = 0;
    this.kunInPln = 0;
    this._plnPrice = 0;
    this.plnInKun = 0;
    this.plnInEur = 0;
  }
}
