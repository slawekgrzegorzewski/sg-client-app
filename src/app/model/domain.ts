export class Domain {
  public id: number;
  public name: string[];

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || [];
  }
}
