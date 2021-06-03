import {Category} from './category';

export type ExpenseDTO = Omit<Partial<Expense>, 'category' | 'expenseDate'> & { category?: Partial<Category>, expenseDate?: string }

export class Expense {
  public id: number;
  public description: string;
  public amount: number;
  public currency: string;
  public category: Category;
  public expenseDate: Date;

  constructor(data?: ExpenseDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.description = data.description || '';
    this.amount = data.amount || 0;
    this.currency = data.currency || '';
    this.category = new Category(data.category);
    this.expenseDate = data.expenseDate && new Date(data.expenseDate) || new Date();
  }

  dateString(): string {
    return this.expenseDate.getFullYear() + '-' + (this.expenseDate.getMonth() + 1) + '-' + this.expenseDate.getDate();
  }
}
