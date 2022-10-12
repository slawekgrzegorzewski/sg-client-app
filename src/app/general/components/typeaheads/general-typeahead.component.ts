import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ToastService} from '../../services/toast.service';
import {merge, Observable, OperatorFunction, Subject} from 'rxjs';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {BillingPeriodsService} from '../../../accountant/services/billing-periods.service';
import {ForTypeahead} from '../../../accountant/model/for-typeahead';

@Component({
  selector: 'app-general-typeahead',
  templateUrl: './general-typeahead.component.html',
  styleUrls: ['./general-typeahead.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeneralTypeaheadComponent), multi: true}
  ]
})
export class GeneralTypeaheadComponent<T extends ForTypeahead> implements OnInit, ControlValueAccessor {

  @Input() id: string | null = null;
  @Input() dataProvider: (() => T[]) | null = null;
  private internalValue: T | null = null;

  get value(): T | null {
    return this.internalValue;
  }

  set value(value: T | null) {
    if (typeof value === 'string' || value instanceof String
      || typeof value === 'number' || value instanceof Number) {
      this.internalValue = null;
      return;
    }
    this.internalValue = value;
    this.propagateChange(value);
  }

  get readonlyValue(): string {
    return this.getElementDescription(this.value);
  }

  private availableDataInternal: string[] | null = null;

  @Input() get availableData(): string[] | null {
    return this.availableDataInternal;
  }

  set availableData(value: string[] | null) {
    this.availableDataInternal = value;
    this.filterData();
  }

  allValues: T[] = [];
  values: T[] = [];
  @Input() readonly = false;
  @Input() inputClass: string = '';

  @ViewChild('tTypeAhead', {static: true}) tTypeAhead: NgbTypeahead | null = null;
  focus = new Subject<string>();
  click = new Subject<string>();
  propagateChange: ((t: T | null) => void) = (t: T | null) => {
  };
  propagateTouch: ((t: T | null) => void) = (t: T | null) => {
  };

  search: OperatorFunction<string, readonly T[]> = (text: Observable<string>) => {
    const debouncedText: Observable<string> = text.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup: Observable<string> = this.click.pipe(
      filter(() => !this.tTypeAhead || !this.tTypeAhead.isPopupOpen())
    );
    const inputFocus: Observable<string> = this.focus;

    return merge(debouncedText, inputFocus, clicksWithClosedPopup).pipe(
      map((term: string) => {
        this.loadData();
        return (term === ''
          ? this.values
          : this.values.filter(c => c.getTypeaheadDescription().toLowerCase().indexOf(term.toLowerCase()) > -1))
          .slice(0, 10);
      })
    );
  };

  formatter: (t: T) => string = (t: T) => this.getElementDescription(t);

  constructor(private billingPeriodsService: BillingPeriodsService, private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  private findValue(elementId: string): T | undefined {
    return (this.values || []).find(t => this.getElementId(t) === elementId);
  }

  public getElementId(element: T): any {
    if (element) {
      return element.getTypeaheadId();
    } else {
      return '';
    }
  }

  registerOnChange(fn: (t: T | null) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (t: T | null) => void): void {
    this.propagateTouch = fn;
  }

  writeValue(obj: T): void {
    const id = typeof obj === 'string' ? obj : this.getElementId(obj);
    this.internalValue = this.findValue(id) || null;
  }

  private loadData(): void {
    if (this.dataProvider) {
      this.allValues = this.dataProvider();
      this.filterData();
    }
  }

  private filterData(): void {
    this.values = (this.allValues || []).filter(c =>
      this.availableData === null ? true : this.availableData.includes(this.getElementId(c))
    );
  }

  getElementDescription(element: T | null): string {
    if (element) {
      return element.getTypeaheadDescription();
    } else {
      return '';
    }
  }
}
