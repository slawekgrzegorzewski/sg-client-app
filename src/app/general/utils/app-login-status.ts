export class AppLoginStatus {
  public isLoggedId: boolean = false;
  public defaultDomainId: number | null = null;

  constructor(isLoggedId: boolean, defaultDomainId: number | null) {
    this.isLoggedId = isLoggedId;
    this.defaultDomainId = defaultDomainId;
  }
}
