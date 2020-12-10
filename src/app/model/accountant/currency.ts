export class Currency {

  public static fromData(data: any): Currency {
    return new Currency(data.code, data.displayName);
  }

  constructor(public code: string, public displayName: string) {

  }

  public description(): string {
    return this.code + ' - ' + this.displayName;
  }
}
