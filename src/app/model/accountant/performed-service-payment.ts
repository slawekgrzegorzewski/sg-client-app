import {ClientPayment} from './client-payment';
import {PerformedService} from './performed-service';

export class PerformedServicePayment {

  public id: number;
  public performedService: PerformedService;
  public clientPayment: ClientPayment;
  public price: number;

  constructor(data?: any) {
    this.id = data && data.id;
    this.performedService = data && new PerformedService(data.performedService) || null;
    this.clientPayment = data && new ClientPayment(data.clientPayment) || null;
    this.price = data && data.price || 0;
  }
}
