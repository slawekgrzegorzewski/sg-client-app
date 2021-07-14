import {Component, Input, OnInit} from '@angular/core';
import {WithBalance} from '../../../model/accountant/with-balance';

@Component({
  selector: 'app-currency-totals',
  templateUrl: './currency-totals.component.html',
  styleUrls: ['./currency-totals.component.css']
})
export class CurrencyTotalsComponent<L extends WithBalance, R extends WithBalance> implements OnInit {

  private valuesLeftInternal: L[] = [];

  @Input() get valuesLeft(): L[] {
    return this.valuesLeftInternal;
  }

  set valuesLeft(value: L[]) {
    this.valuesLeftInternal = value;
    this.calulateTotals();
  }

  private valuesRightInternal: R[] = [];

  @Input() get valuesRight(): R[] {
    return this.valuesRightInternal;
  }

  set valuesRight(value: R[]) {
    this.valuesRightInternal = value;
    this.calulateTotals();
  }

  totalsLeft: Map<string, number> | null = null;
  totalsDifference: Map<string, number> | null = null;

  @Input() title: string = '';

  constructor() {
  }


  ngOnInit(): void {
  }

  private calulateTotals(): void {
    if (this.valuesRight) {
      this.totalsLeft = null;
      this.totalsDifference = this.calculateTotalDifference();
    } else {
      this.totalsLeft = this.calculateTotalLeft();
      this.totalsDifference = null;
    }
  }


  private calculateTotalLeft(): Map<string, number> {
    return this.calculateOneSideTotals(this.valuesLeft);
  }

  private calculateTotalsRight(): Map<string, number> {
    return this.calculateOneSideTotals(this.valuesRight);
  }

  private calculateOneSideTotals(values: (L | R)[]): Map<string, number> {
    if (!values) {
      return new Map<string, number>();
    }
    return this.processValues(values);
  }

  private calculateTotalDifference(): Map<string, number> {
    const left = this.calculateTotalLeft();
    const right = this.calculateTotalsRight();
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

  private processValues(vals: (L | R)[]): Map<string, number> {
    const result = new Map<string, number>();
    for (const value of vals || []) {
      const balance = value.getBalance();
      let total = result.get(balance.currency) || 0;
      total += balance.balance;
      result.set(balance.currency, total);
    }
    return result;
  }
}
