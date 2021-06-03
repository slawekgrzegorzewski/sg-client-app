import {Category} from './category';
import {ExpenseDTO} from './expense';

export type IncomeDTO = Omit<Partial<Income>, 'category' | 'incomeDate'> & { category?: Partial<Category>, incomeDate?: string }

export class Income {
  public id: number;
  public description: string;
  public amount: number;
  public currency: string;
  public category: Category;
  public incomeDate: Date;

  constructor(data?: IncomeDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.description = data.description || '';
    this.amount = data.amount || 0;
    this.currency = data.currency || '';
    this.category = new Category(data.category);
    this.incomeDate = data.incomeDate && new Date(data.incomeDate) || new Date();
  }

  dateString(): string {
    return this.incomeDate.getFullYear() + '-' + (this.incomeDate.getMonth() + 1) + '-' + this.incomeDate.getDate();
  }
}
