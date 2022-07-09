import {Component, OnInit} from '@angular/core';
import {NodrigenService} from '../../../services/banks/nodrigen.service';
import {BankTransactionToImport} from '../../../model/banks/nodrigen/bank-transaction-to-import';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {Expense} from '../../../model/accountant/billings/expense';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {Income} from '../../../model/accountant/billings/income';


export type ImportMode = 'CREDIT';

@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  transactionsToImport: BankTransactionToImport[] = [];
  transactionToImport: BankTransactionToImport | null = null;
  importMode: ImportMode | null = null;

  constructor(private nodrigenService: NodrigenService) {
  }

  ngOnInit(): void {
    this.nodrigenService.getNodrigenTransactionsToImport()
      .subscribe(data => this.transactionsToImport =
        data.sort(ComparatorBuilder.comparingByDateDays<BankTransactionToImport>(btti => btti.timeOfTransaction).build()));
  }

  select(transactionToImport: BankTransactionToImport): void {
    this.transactionToImport = transactionToImport;
  }

  transactionMayBeDebit(transaction: BankTransactionToImport | null) {
    return transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null;
  }

  createElement(expense: Expense | Income | null, accounttId: number | null, piggyBank: PiggyBank | null) {
    if(!expense){
      this.importMode = null;
    }
    console.log(expense + ':' + accounttId + ':' + piggyBank);
  }
}
