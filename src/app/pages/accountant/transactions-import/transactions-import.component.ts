import {Component, OnInit} from '@angular/core';
import {NodrigenService} from '../../../services/banks/nodrigen.service';
import {BankTransactionToImport} from '../../../model/banks/nodrigen/bank-transaction-to-import';


@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  transactionsToImport: BankTransactionToImport[] = [];

  constructor(private nodrigenService: NodrigenService) {
  }

  ngOnInit(): void {
    this.nodrigenService.getNodrigenTransactionsToImport().subscribe(data => this.transactionsToImport = data);
  }

}
