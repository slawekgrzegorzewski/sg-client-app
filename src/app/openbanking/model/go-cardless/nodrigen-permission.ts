import {Domain} from '../../../general/model/domain';
import {BankAccount} from '../bank-account';
import {SimplePerformedServicePayment} from '../../../accountant/model/simple-performed-service-payment';

export class NodrigenPermission {
  id: number;
  domain: Domain;
  institutionId: string;
  createdAt: Date;
  givenAt: Date;
  withdrawnAt: Date;
  reference: string;
  ssn: string;
  confirmationLink: string;
  bankAccounts: BankAccount[];

  constructor(data?: Partial<NodrigenPermission>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.domain = new Domain(data.domain);
    this.institutionId = data.institutionId || '';
    this.createdAt = data.createdAt && new Date(data.createdAt) || new Date();
    this.givenAt = data.givenAt && new Date(data.givenAt) || new Date();
    this.withdrawnAt = data.withdrawnAt && new Date(data.withdrawnAt) || new Date();
    this.reference = data.reference || '';
    this.ssn = data.ssn || '';
    this.confirmationLink = data.confirmationLink || '';
    this.bankAccounts = (data.bankAccounts || []).map(ba => new BankAccount(ba));
  }
}
