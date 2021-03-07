import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {PerformedService} from '../../../model/accountant/performed-service';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';

@Component({
  selector: 'app-company-log',
  templateUrl: './company-log.component.html',
  styleUrls: ['./company-log.component.css']
})
export class CompanyLogComponent implements OnInit {

  @Input() services: Service[];
  @Input() clients: Client[];
  @Input() clientPayments: ClientPayment[];
  @Input() allCurrencies: Currency[];
  @Input() performedServices: PerformedService[];

  @Output() createPSEvent = new EventEmitter<PerformedService>();
  @Output() updatePSEvent = new EventEmitter<PerformedService>();
  @Output() createPSPaymentEvent = new EventEmitter<PerformedServicePayment>();
  @Output() createCPEvent = new EventEmitter<ClientPayment>();
  @Output() updateCPEvent = new EventEmitter<ClientPayment>();

  constructor() {
  }

  ngOnInit(): void {
  }

}
