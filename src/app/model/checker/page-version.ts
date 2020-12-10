export class PageVersion {
  public id: number;
  public content: string;
  public versionTime: Date;
  public added: string[];
  public removed: string[];

  constructor(data?: any) {
    this.id = data && data.id;
    this.content = data && data.content || '';
    this.versionTime = data && new Date(data.versionTime) || null;
    this.added = data && data.elementsAdded || [];
    this.removed = data && data.elementsRemoved || [];
  }
}
