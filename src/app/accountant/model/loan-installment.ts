import Decimal from 'decimal.js';

export type LoanInstallmentDTO = Partial<LoanInstallment>;


export class LoanInstallment {
  public paymentFrom: Date;
  public paymentTo: Date;
  public remainingCapitalAtTheBeginning: Decimal;
  public remainingCapitalAtTheEnd: Decimal;
  public installment: Decimal;
  public repaidCapital: Decimal;
  public paidInterest: Decimal;
  public overpayment: Decimal;

  constructor(data?: LoanInstallmentDTO) {
    if (!data) {
      data = {};
    }
    this.paymentFrom = data.paymentFrom && new Date(data.paymentFrom) || new Date();
    this.paymentTo = data.paymentTo && new Date(data.paymentTo) || new Date();
    this.remainingCapitalAtTheBeginning = new Decimal(data.remainingCapitalAtTheBeginning || '0')
    this.installment = new Decimal(data.installment || '0');
    this.repaidCapital = new Decimal(data.repaidCapital || '0');
    this.paidInterest = new Decimal(data.paidInterest || '0');
    this.overpayment = new Decimal(data.overpayment || '0');
    this.remainingCapitalAtTheEnd = this.remainingCapitalAtTheBeginning.minus(this.repaidCapital).minus(this.overpayment);
  }
}
