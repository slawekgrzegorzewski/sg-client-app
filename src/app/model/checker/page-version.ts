export class PageVersion {
  public id: number;
  public content: string;
  public versionTime: Date;

  constructor(data?: any) {
    this.id = data && data.id;
    this.content = data && data.content || '';
    this.versionTime = data && new Date(data.versionTime) || null;
  }
}
