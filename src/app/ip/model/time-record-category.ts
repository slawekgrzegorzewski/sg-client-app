export type TimeRecordCategoryDTO = Partial<TimeRecordCategory>;

export const EMPTY_TIME_RECORD_CATEGORY_ID = 0;

export class TimeRecordCategory {
  public id: number;
  public name: string;

  constructor(data?: TimeRecordCategoryDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || EMPTY_TIME_RECORD_CATEGORY_ID;
    this.name = data.name || '';
  }
}

export const EMPTY_TIME_RECORD_CATEGORY = new TimeRecordCategory({});
