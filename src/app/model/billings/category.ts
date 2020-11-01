export class Category {
  public id: number;
  public name: string;
  public description: string;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.description = data && data.description || '';
  }
}
