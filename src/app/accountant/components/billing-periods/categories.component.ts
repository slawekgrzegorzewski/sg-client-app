import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Category} from '../../model/billings/category';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  @Input() categories: Category[] = [];
  @Output() createEvent = new EventEmitter<Category>();
  @Output() updateEvent = new EventEmitter<Category>();
  categoryToEdit: Category | null = null;

  @ViewChild('utilBox') utilBox!: ElementRef;
  categoryWithMouseCursorOnIt: Category | null = null;
  utilBoxTop = 0;
  utilBoxLeft = 0;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverAccount(category: Category | null, row: HTMLDivElement | null): void {
    this.categoryWithMouseCursorOnIt = category;
    if (this.categoryWithMouseCursorOnIt && row) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  prepareToEdit(): void {
    this.categoryToEdit = this.categoryWithMouseCursorOnIt;
  }

  prepareToCreate(): void {
    this.categoryToEdit = new Category();
  }

  reset(): void {
    this.categoryToEdit = null;
    this.setOverAccount(null, null);
  }

  create(): void {
    if (this.categoryToEdit) {
      this.createEvent.emit(this.categoryToEdit);
      this.reset();
    }
  }

  update(): void {
    if (this.categoryToEdit) {
      this.updateEvent.emit(this.categoryToEdit);
      this.reset();
    }
  }
}
