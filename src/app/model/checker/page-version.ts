export type PageVersionDTO = Omit<Partial<PageVersion>, 'versionTime'> & { versionTime?: string }

export class PageVersion {
  public id: number;
  public content: string;
  public versionTime: Date;
  public elementsAdded: string[];
  public elementsRemoved: string[];

  constructor(data?: PageVersionDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.content = data.content || '';
    this.versionTime = data.versionTime && new Date(data.versionTime) || new Date();
    this.elementsAdded = data.elementsAdded || [];
    this.elementsRemoved = data.elementsRemoved || [];
  }
}
