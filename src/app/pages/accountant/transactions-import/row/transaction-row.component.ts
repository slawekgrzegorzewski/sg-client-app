import {Component, Input} from '@angular/core';
import {BankTransactionToImport} from '../../../../model/banks/nodrigen/bank-transaction-to-import';


@Component({
  selector: 'app-transactions-row',
  templateUrl: './transaction-row.component.html',
  styleUrls: ['./transaction-row.component.css']
})
export class TransactionRowComponent {

  @Input() transactionToImport: BankTransactionToImport | null = null;
}
