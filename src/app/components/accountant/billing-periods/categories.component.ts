import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Category} from '../../../model/billings/category';

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
  editElement: Category;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: Category;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverAccount(category: Category, row: HTMLDivElement): void {
    this.overElement = category;
    if (category) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): Category {
    const acc = this.overElement;
    this.setOverAccount(null, null);
    return acc;
  }

  prepareToEdit(): void {
    this.editElement = this.overElement;
  }

  prepareToCreate(): void {
    this.editElement = new Category();
  }

  reset(): void {
    this.editElement = null;
    this.setOverAccount(null, null);
  }

  create(): void {
    this.createEvent.emit(this.editElement);
    this.reset();
  }

  update(): void {
    this.createEvent.emit(this.editElement);
    this.reset();
  }
}
