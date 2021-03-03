import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ToastService} from '../../services/toast.service';
import {merge, Observable, Subject} from 'rxjs';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {BillingPeriodsService} from '../../services/accountant/billing-periods.service';
import {ForTypeahead} from '../../model/accountant/for-typeahead';

@Component({
  selector: 'app-general-typeahead',
  templateUrl: './general-typeahead.component.html',
  styleUrls: ['./general-typeahead.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeneralTypeaheadComponent), multi: true}
  ]
})
export class GeneralTypeaheadComponent<T extends ForTypeahead> implements OnInit, ControlValueAccessor {

  @Input() id: string;
  @Input() dataProvider: () => Observable<T[]>;
  private internalValue: T;

  get value(): T {
    return this.internalValue;
  }

  set value(value: T) {
    if (typeof value === 'string' || value instanceof String
      || typeof value === 'number' || value instanceof Number) {
      return;
    }
    this.internalValue = value;
    const id = this.getElementId(value);
    this.propagateChange(value);
    this.propagateTouch(value);
  }

  get readonlyValue(): string {
    if (!this.value) {
      return '';
    } else {
      return this.getElementDescription(this.value);
    }
  }

  private availableDataInternal: string[] = null;

  @Input() get availableData(): string[] {
    return this.availableDataInternal;
  }

  set availableData(value: string[]) {
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

  private findValue(elementId: string): T {
    return (this.values || []).find(t => this.getElementId(t) === elementId);
  }

  public getElementId(element: T): any {
    if (element) {
      return element.getTypeaheadId();
    } else {
      return '';
    }
  }

  private getElementDescription(element: T): any {
    if (element) {
      return element.getTypeaheadDescription();
    } else {
      return '';
    }
  }

  registerOnChange(fn: (_: T) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: T) => void): void {
    this.propagateTouch = fn;
  }

  writeValue(obj: T): void {
    const id = typeof obj === 'string' ? obj : this.getElementId(obj);
    const value = this.findValue(id);
    this.internalValue = value;
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
      this.availableData === null ? true : this.availableData.includes(this.getElementId(c))
    );
  }

  searchClosure(that: GeneralTypeaheadComponent<T>): (text$: Observable<string>) => Observable<T[]> {
    return (text$: Observable<string>) => {
      const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
      const clicksWithClosedPopup = that.click.pipe(filter(() => !that.tTypeAhead || !that.tTypeAhead.isPopupOpen()));
      const inputFocus = that.focus;

      return merge(debouncedText, inputFocus, clicksWithClosedPopup).pipe(
        map(term => (
          term === '' ? that.values : that.values.filter(c => this.getElementDescription(c).toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 10))
      );
    };
  }

  formatter(): (t: T) => string {
    return (t: T) => {
      if (!t) {
        return '';
      } else {
        return this.getElementDescription(t);
      }
    };
  }
}
