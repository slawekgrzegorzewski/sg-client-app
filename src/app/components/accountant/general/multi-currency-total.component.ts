import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-multi-currency-total',
  templateUrl: './multi-currency-total.component.html',
  styleUrls: ['./multi-currency-total.component.css']
})
export class MultiCurrencyTotalComponent implements OnInit {

  @Input() title: string = '';
  @Input() values: Map<string, number> | null = null;
  @Input() hoverable = true;

  constructor() {
  }


  ngOnInit(): void {
  }
}
