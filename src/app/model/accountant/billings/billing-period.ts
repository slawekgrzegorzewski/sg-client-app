import {Income, IncomeDTO} from './income';
import {Expense, ExpenseDTO} from './expense';

export type BillingPeriodInfoDTO = Omit<Partial<BillingPeriodInfo>, 'result' | 'unfinishedBillingPeriods'> & {
  result?: BillingPeriodDTO,
  unfinishedBillingPeriods?: BillingPeriodDTO[]
}

export class BillingPeriodInfo {
  public result: BillingPeriod | null = null;
  public unfinishedBillingPeriods: BillingPeriod[];

  constructor(data?: Partial<BillingPeriodInfoDTO>) {
    if (!data) {
      data = {};
    }
    this.result = data.result ? new BillingPeriod(data.result) : null;
    this.unfinishedBillingPeriods = data.unfinishedBillingPeriods && data.unfinishedBillingPeriods.map(up => new BillingPeriod(up)) || [];
  }
}

type BillingPeriodDTO = Omit<Partial<BillingPeriod>, 'period' | 'incomes' | 'expenses'> & {
  period?: string,
  incomes?: IncomeDTO[],
  expenses?: ExpenseDTO[]
}

export class BillingPeriod {
  public id: number;
  public name: string;
  public period: Date;
  public incomes: Income[];
  public expenses: Expense[];
  public userId: number;

  constructor(data?: BillingPeriodDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
    this.period = data.period && new Date(data.period) || new Date();
    this.incomes = data.incomes && data.incomes.map(income => new Income(income)) || [];
    this.expenses = data.expenses && data.expenses.map(income => new Expense(income)) || [];
    this.userId = data.userId || 0;
  }
}
