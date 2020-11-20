import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ToastService} from '../../services/toast.service';
import {merge, Observable, Subject} from 'rxjs';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {BillingPeriodsService} from '../../services/billing-periods.service';

@Component({
  selector: 'app-general-typeahead',
  templateUrl: './general-typeahead.component.html',
  styleUrls: ['./general-typeahead.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeneralTypeaheadComponent), multi: true}
  ]
})
export class GeneralTypeaheadComponent<T, ID extends string | number> implements OnInit, ControlValueAccessor {

  private internalValue: ID;
  @Input() dataProvider: () => Observable<T[]>;
  @Input() idExtractor: (t: T) => ID;
  @Input() tToString: (t: T) => string;

  get value(): T {
    return (this.values || []).find(t => this.idExtractor(t) === this.internalValue);
  }

  set value(value: T) {
    if ((value instanceof String) || (value instanceof Number)) {
      return;
    }
    const id = this.idExtractor(value);
    this.internalValue = id;
    this.propagateChange(id);
    this.propagateTouch(id);
  }

  private availableDataInternal: ID[] = [];

  @Input() get availableData(): ID[] {
    return this.availableDataInternal;
  }

  set availableData(value: ID[]) {
    this.availableDataInternal = value;
    this.filterData();
  }

  allValues: T[];
  values: T[];
  @Input() readonly = false;
  @Input() inputClass: string;

  @ViewChild('tTypeAhead', {static: true}) tTypeAhead: NgbTypeahead;
  focus = new Subject<string>();
  click = new Subject<string>();
  propagateChange: (T) => void;
  propagateTouch: (T) => void;

  constructor(private billingPeriodsService: BillingPeriodsService, private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  registerOnChange(fn: (_: number) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: number) => void): void {
    this.propagateTouch = fn;
  }

  writeValue(obj: ID): void {
    this.internalValue = obj as ID;
  }

  private loadData(): void {
    this.dataProvider().subscribe(
      data => {
        this.allValues = data;
        this.filterData();
      },
      err => {
        this.values = [];
        this.toastService.showWarning('No values available.', 'Can not obtain available values!');
      }
    );
  }

  private filterData(): void {
    this.values = (this.allValues || []).filter(c =>
      this.availableData === null ? true : this.availableData.includes(this.idExtractor(c))
    );
  }

  searchClosure(that: GeneralTypeaheadComponent<T, ID>): (text$: Observable<string>) => Observable<T[]> {
    return (text$: Observable<string>) => {
      const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
      const clicksWithClosedPopup = that.click.pipe(filter(() => !that.tTypeAhead.isPopupOpen()));
      const inputFocus = that.focus;

      return merge(debouncedText, inputFocus, clicksWithClosedPopup).pipe(
        map(term => (
          term === '' ? that.values : that.values.filter(c => that.tToString(c).toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 10))
      );
    };
  }

  formatter(): (t: T) => string {
    const stringFunction = this.tToString;
    return (t: T) => t === null ? '' : stringFunction(t);
  }

}
