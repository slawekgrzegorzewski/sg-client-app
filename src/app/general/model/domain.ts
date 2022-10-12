export class Domain {
  public id: number;
  public name: string;

  constructor(data?: Partial<Domain>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
  }
}

export class DetailedDomain {
  public id: number;
  public name: string;
  public usersAccessLevel = new Map<string, string>();

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.usersAccessLevel = data && this.toMap(data.usersAccessLevel) || new Map();
  }

  private toMap(usersAccessLevel: any): Map<string, string> {
    return Object.entries<string>(usersAccessLevel || {})
      .reduce(
        (previousValue, currentValue) => previousValue.set(currentValue[0], currentValue[1]),
        new Map<string, string>()
      );

  }

  public toSimpleDomain(): Domain {
    return new Domain(this);
  }
}
