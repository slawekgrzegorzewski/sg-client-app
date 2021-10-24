import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-multi-currency-total',
  templateUrl: './multi-currency-total.component.html',
  styleUrls: ['./multi-currency-total.component.css']
})
export class MultiCurrencyTotalComponent implements OnInit {

  @Input() title: string = '';

  private _values: Map<string, number> | null = null;
  @Input() get values(): Map<string, number> | null {
    return this._values;
  }

  set values(value: Map<string, number> | null) {
    this._values = value;
    if (this._values === null) {
      this._values = new Map<string, number>();
    }
  }

  @Input() hoverable = true;

  constructor() {
  }


  ngOnInit(): void {
  }
}
