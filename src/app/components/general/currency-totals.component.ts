import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-currency-totals',
  templateUrl: './currency-totals.component.html',
  styleUrls: ['./currency-totals.component.css']
})
export class CurrencyTotalsComponent<T> implements OnInit {

  private valuesLeftInternal: T[] = [];

  @Input() get valuesLeft(): T[] {
    return this.valuesLeftInternal;
  }

  set valuesLeft(value: T[]) {
    this.valuesLeftInternal = value;
    this.calulateTotals();
  }

  private valuesRightInternal: T[] = [];

  @Input() get valuesRight(): T[] {
    return this.valuesRightInternal;
  }

  set valuesRight(value: T[]) {
    this.valuesRightInternal = value;
    this.calulateTotals();
  }

  @Input() currencyExtractorLeft: (t: T) => string;

  @Input() balanceExtractorLeft: (t: T) => number;

  @Input() currencyExtractorRight: (t: T) => string;
  @Input() balanceExtractorRight: (t: T) => number;

  totalsLeft = new Map<string, number>();
  totalsDifference = new Map<string, number>();

  @Input() title: string;

  constructor() {
  }


  ngOnInit(): void {
  }

  private calulateTotals(): void {
    if (this.valuesRight) {
      this.totalsDifference = this.calculateTotalDifference();
      this.totalsLeft = null;
    } else {
      this.totalsDifference = null;
      this.totalsLeft = this.calculateTotalLeft();
    }
  }


  private calculateTotalLeft(): Map<string, number> {
    return this.processValues(this.valuesLeft,
      this.currencyExtractorLeft,
      this.balanceExtractorLeft);
  }

  private calculateTotalDifference(): Map<string, number> {
    const left = this.calculateTotalLeft();
    const right = this.processValues(this.valuesRight,
      this.currencyExtractorRight,
      this.balanceExtractorRight);
    const currencies = new Set<string>();
    for (const c of left.keys()) {
      currencies.add(c);
    }
    for (const c of right.keys()) {
      currencies.add(c);
    }
    const result = new Map<string, number>();
    for (const c of currencies) {
      const leftValue = left.get(c) || 0;
      const rightValue = right.get(c) || 0;
      result.set(c, leftValue - rightValue);
    }
    return result;
  }

  private processValues(vals: T[], currencyExtractor: (t: T) => string, balanceExtractor: (t: T) => number): Map<string, number> {
    const result = new Map<string, number>();
    for (const value of vals || []) {
      const currency = currencyExtractor(value);
      let total = result.get(currency) || 0;
      total += balanceExtractor(value);
      result.set(currency, total);
    }
    return result;
  }
}
