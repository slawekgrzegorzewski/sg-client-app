import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Currency} from '../../model/currency';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {merge, Observable, Subject} from 'rxjs';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-currency-typeahead',
  templateUrl: './currency-typeahead.component.html',
  styleUrls: ['./currency-typeahead.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CurrencyTypeaheadComponent), multi: true}
  ]
})
export class CurrencyTypeaheadComponent implements OnInit, ControlValueAccessor {

  private internalValue: string;

  get value(): Currency {
    return (this.currencies || []).find(c => c.code === this.internalValue);
  }

  set value(value: Currency) {
    if (!(value instanceof Currency)) {
      return;
    }
    this.internalValue = value.code;
    this.propagateChange(value.code);
    this.propagateTouch(value.code);
  }

  private availableCurrenciesInternal: string[] = [];

  @Input() get availableCurrencies(): string[] {
    return this.availableCurrenciesInternal;
  }

  set availableCurrencies(value: string[]) {
    this.availableCurrenciesInternal = value;
    this.filterCurrencies();
  }

  allCurrencies: Currency[];
  currencies: Currency[];
  @Input() readonly = false;
  @Input() inputClass: string;

  @ViewChild('currenciesTypeAhead', {static: true}) currenciesTypeAhead: NgbTypeahead;
  focus = new Subject<string>();
  click = new Subject<string>();
  propagateChange: (Currency) => void;
  propagateTouch: (Currency) => void;

  constructor(private accountsService: AccountsService, private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.loadCurrencies();
  }

  registerOnChange(fn: (_: string) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: string) => void): void {
    this.propagateTouch = fn;
  }

  writeValue(obj: string): void {
    this.internalValue = obj;
  }

  private loadCurrencies(): void {
    this.accountsService.possibleCurrencies().subscribe(
      data => {
        this.allCurrencies = data.sort((a, b) => a.code.localeCompare(b.code));
        this.filterCurrencies();
      },
      err => {
        this.currencies = [];
        this.toastService.showWarning('No currency available.', 'Can not obtain available currencies!');
      }
    );
  }

  private filterCurrencies(): void {
    this.currencies = (this.allCurrencies || []).filter(c =>
      this.availableCurrencies.length === 0 ? true : this.availableCurrencies.includes(c.code)
    );
  }

  searchClosure(that: CurrencyTypeaheadComponent): (text$: Observable<string>) => Observable<Currency[]> {
    return (text$: Observable<string>) => {
      const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
      const clicksWithClosedPopup = that.click.pipe(filter(() => !that.currenciesTypeAhead.isPopupOpen()));
      const inputFocus = that.focus;

      return merge(debouncedText, inputFocus, clicksWithClosedPopup).pipe(
        map(term => (term === '' ? that.currencies
          : that.currencies.filter(c => c.description().toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
      );
    };
  }

  formatter(currency: Currency): string {
    return currency === null ? '' : currency.description();
  }

}
