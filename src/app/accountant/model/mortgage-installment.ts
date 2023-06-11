import Decimal from 'decimal.js';

export type MortgageInstallmentDTO = Partial<MortgageInstallment>;


export class MortgageInstallment {
  public paymentFrom: Date;
  public paymentTo: Date;
  public remainingCapitalAtTheBeginning: Decimal;
  public installment: Decimal;
  public repaidCapital: Decimal;
  public paidInterest: Decimal;
  public overpayment: Decimal;

  constructor(data?: MortgageInstallmentDTO) {
    if (!data) {
      data = {};
    }
    this.paymentFrom = data.paymentFrom && new Date(data.paymentFrom) || new Date();
    this.paymentTo = data.paymentTo && new Date(data.paymentTo) || new Date();
    this.remainingCapitalAtTheBeginning = data.remainingCapitalAtTheBeginning || new Decimal(0);
    this.installment = data.installment || new Decimal(0);
    this.repaidCapital = data.repaidCapital || new Decimal(0);
    this.paidInterest = data.paidInterest || new Decimal(0);
    this.overpayment = data.overpayment || new Decimal(0);
  }
}
