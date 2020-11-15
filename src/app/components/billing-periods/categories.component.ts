import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {Category} from '../../model/billings/category';
import {ToastService} from '../../services/toast.service';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: Category[] = [];
  editElement: Category;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: Category;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor(
    private billingsService: BillingPeriodsService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.billingsService.getAllCategories().subscribe(
      data => this.categories = data,
      error => this.toastService.showWarning('Could not obtain categories ' + error)
    );
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
    this.billingsService.createCategory(this.editElement).subscribe(
      data => {
        this.categories.push(data);
        this.reset();
      },
      error => {
        this.toastService.showWarning('Can not create new category ' + error);
        this.reset();
      }
    );
  }

  update(): void {
    this.billingsService.updateCategory(this.editElement).subscribe(
      data => {
        this.reset();
      },
      error => {
        this.toastService.showWarning('Can not create new category ' + error);
        this.reset();
      }
    );
  }
}
