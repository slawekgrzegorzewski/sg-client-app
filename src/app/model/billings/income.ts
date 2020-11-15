import {Category} from './category';

export class Income {
  public id: number;
  public description: string;
  public amount: number;
  public currency: string;
  public category: Category;
  public incomeDate: Date;

  constructor(data?: any) {
    this.id = data && data.id;
    this.description = data && data.description || '';
    this.amount = data && data.amount || 0;
    this.currency = data && data.currency || '';
    this.category = data && new Category(data.category) || null;
    this.incomeDate = data && new Date(data.incomeDate) || null;
  }

  dateString(): string {
    return this.incomeDate.getFullYear() + '-' + (this.incomeDate.getMonth() + 1) + '-' + this.incomeDate.getDate();
  }
}
