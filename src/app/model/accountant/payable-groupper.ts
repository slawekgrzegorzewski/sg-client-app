import {Payable, PaymentStatus} from './payable';

export class PayableGroup<T extends Payable> {
  private static generatedGroups = 0;

  id: number;
  title: string;
  additionalFinancialData = new Map<string, { paid: number, of: number }>();
  data: T[];
  order: number;
  statusInternal: PaymentStatus;

  get status(): PaymentStatus {
    if (!this.statusInternal) {
      this.statusInternal = PaymentStatus.PAID;
      this.data.forEach(p => {
        const paymentStatus = p.getPaymentStatus();
        if (paymentStatus === PaymentStatus.UNDERPAID && this.statusInternal !== PaymentStatus.NOT_PAID) {
          this.statusInternal = PaymentStatus.UNDERPAID;
        } else if (paymentStatus === PaymentStatus.NOT_PAID) {
          this.statusInternal = PaymentStatus.NOT_PAID;
        }
      });
    }
    return this.statusInternal;
  }

  public static groupData<P extends Payable>(input: P[], idGetter: (p: P) => number,
                                             titleGetter: (p: P) => string,
                                             comparator: (p1: P, p2: P) => number): PayableGroup<P>[] {
    const data = new Map<number, PayableGroup<P>>();
    for (const p of input) {
      const key = idGetter(p);
      const group = data.get(key) || PayableGroup.createGroup([], data.size);
      group.data.push(p);
      group.title = titleGetter(p);
      const toPay = group.additionalFinancialData.get(p.getCurrency()) || {paid: 0, of: 0};
      toPay.of += p.getPrice();
      toPay.paid += p.getPaidAmountForNow();
      group.additionalFinancialData.set(p.getCurrency(), toPay);
      data.set(key, group);
    }
    const toReturn = Array.from(data.values());
    toReturn.forEach(group => group.data = group.data.sort(comparator));
    return toReturn;
  }

  private static createGroup<P extends Payable>(data: P[], order: number): PayableGroup<P> {
    const group = new PayableGroup<P>();
    group.id = PayableGroup.generatedGroups++;
    group.data = data;
    group.order = order;
    return group;
  }

  public isEqual(payableGroup: PayableGroup<any>): boolean {
    return this.id === payableGroup.id;
  }

}
