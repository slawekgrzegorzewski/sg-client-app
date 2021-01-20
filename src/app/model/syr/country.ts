export class Country {
  public id: number;
  public names: string[];

  constructor(data?: any) {
    this.id = data && data.id;
    this.names = data && data.names || [];
  }
}
