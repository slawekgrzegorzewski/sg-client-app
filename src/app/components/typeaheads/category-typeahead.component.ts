import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Currency} from '../../model/currency';
import {ToastService} from '../../services/toast.service';
import {merge, Observable, Subject} from 'rxjs';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Category} from '../../model/billings/category';
import {BillingPeriodsService} from '../../services/billing-periods.service';

@Component({
  selector: 'app-category-typeahead',
  templateUrl: './category-typeahead.component.html',
  styleUrls: ['./category-typeahead.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CategoryTypeaheadComponent), multi: true}
  ]
})
export class CategoryTypeaheadComponent implements OnInit, ControlValueAccessor {

  private internalValue: number;

  get value(): Category {
    return (this.catgories || []).find(c => c.id === this.internalValue);
  }

  set value(value: Category) {
    if (!(value instanceof Category)) {
      return;
    }
    this.internalValue = value.id;
    this.propagateChange(value.id);
    this.propagateTouch(value.id);
  }

  private availableCategoriesInternal: number[] = [];

  @Input() get availableCategories(): number[] {
    return this.availableCategoriesInternal;
  }

  set availableCategories(value: number[]) {
    this.availableCategoriesInternal = value;
    this.filterCategories();
  }

  allCategories: Category[];
  catgories: Category[];
  @Input() readonly = false;
  @Input() inputClass: string;

  @ViewChild('categoriesTypeAhead', {static: true}) categoriesTypeAhead: NgbTypeahead;
  focus = new Subject<string>();
  click = new Subject<string>();
  propagateChange: (Currency) => void;
  propagateTouch: (Currency) => void;

  constructor(private billingPeriodsService: BillingPeriodsService, private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  registerOnChange(fn: (_: number) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: number) => void): void {
    this.propagateTouch = fn;
  }

  writeValue(obj: number): void {
    this.internalValue = Number(obj);
  }

  private loadCategories(): void {
    this.billingPeriodsService.getAllCategories().subscribe(
      data => {
        this.allCategories = data.sort((a, b) => a.name.localeCompare(b.name));
        this.filterCategories();
      },
      err => {
        this.catgories = [];
        this.toastService.showWarning('No categories available.', 'Can not obtain available categories!');
      }
    );
  }

  private filterCategories(): void {
    this.catgories = (this.allCategories || []).filter(c =>
      this.availableCategories.length === 0 ? true : this.availableCategories.includes(c.id)
    );
  }

  searchClosure(that: CategoryTypeaheadComponent): (text$: Observable<string>) => Observable<Category[]> {
    return (text$: Observable<string>) => {
      const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
      const clicksWithClosedPopup = that.click.pipe(filter(() => !that.categoriesTypeAhead.isPopupOpen()));
      const inputFocus = that.focus;

      return merge(debouncedText, inputFocus, clicksWithClosedPopup).pipe(
        map(term => (term === '' ? that.catgories
          : that.catgories.filter(c => c.fullName().toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
      );
    };
  }

  formatter(category: Category): string {
    return category === null ? '' : category.fullName();
  }

}
