import {Category} from './category';

export class Expense {
  public id: number;
  public description: string;
  public amount: number;
  public currency: string;
  public category: Category;

  constructor(data?: any) {
    this.id = data && data.id;
    this.description = data && data.description || '';
    this.amount = data && data.amount || 0;
    this.currency = data && data.currency || '';
    this.category = data && new Category(data.category) || null;
  }
}
