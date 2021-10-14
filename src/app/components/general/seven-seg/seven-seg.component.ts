import {
  Component,
  Directive,
  Input,
  OnInit,
  Injectable,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  Renderer2,
  QueryList
} from '@angular/core';
import {SevenSegDigitComponent, ZeroNine} from './seven-seg-digit.component';
import {DecimalPipe} from '@angular/common';

@Injectable()
@Component({
  selector: 'seven-seg',
  templateUrl: './seven-seg.component.html',
  styleUrls: ['./seven-seg.component.css']
})
export class SevenSegComponent implements AfterViewInit {
  // @Input('value')
  _value: number | null = null;

  @Input() digits: number = 1;

  @Input() decimalPlaces: number = 0;// null = floating?

  @Input() class: string = '';

  scale: number = 2;

  @ViewChildren('digit') digitComponents!: QueryList<SevenSegDigitComponent>;
  allDigits: Array<number> = [];
  private _viewInit: boolean = false;

  constructor(private decimalPipe: DecimalPipe) {
  }

  ngOnInit() {
    this.allDigits = [];
    for (let i = 0; i < this.digits; i++) {
      this.allDigits.push(i);
    }
  }

  ngAfterViewInit() {
    this._viewInit = true;
    this.renderAll();
  }

  get transformGroup(): string {
    return `scale(${this.scale})`;
  }

  get viewBox(): string {
    const w = this.digits * 57 * this.scale;
    const h = 80 * this.scale;
    return `0 0 ${w} ${h}`;
  }

  groupTransform(i: number): string {
    let w = i * 57;
    return `translate(${w} 0)`;
  }

  @Input()
  set value(value: number) {
    const format = `${this.digits - this.decimalPlaces}.${this.decimalPlaces}-${this.decimalPlaces}`;
    const stringRepresentation = this.decimalPipe.transform(value, format);
    let decimalFactor = Math.pow(10, this.decimalPlaces);
    this._value = Math.round(value * decimalFactor) / decimalFactor;
    // console.log(`set value: ${this._value}`);
    this.renderAll();
  }

  renderAll() {
    if (!this._viewInit) {
      return;
    }

    // console.log('render all: ', this._value);

    // Special case: if value attribute is null or not given, blank the display
    if (this._value == null) {
      this.digitComponents.forEach(comp => comp.digit = 0);
      return;
    }

    let value = Math.round(this._value * Math.pow(10, this.decimalPlaces)); // shift out decimals from the value
    // Round the result to correct floating point bug with value="4.6" and decimalPlaces="2" rendering as 4.5_ (4.6*100===459.999999...)

    let digits = this.digits; // declared to put in scope of forEach
    // targetIdx is where the decimal place will be shown
    let targetIdx = this.decimalPlaces > 0 ?
      this.digits - this.decimalPlaces - 1 :
      -1;

    let leadingZero = true;
    this.digitComponents.forEach(function(comp, idx) {
      comp.showDecimal = (idx === targetIdx);
      let divisor = Math.pow(10, (digits - idx - 1));
      let curDigit = value / divisor;
      value = value % divisor;

      // console.log('CurDigit:', curDigit, 'next value:', value, 'idx', idx);
      if (Math.floor(curDigit) > 0) {
        leadingZero = false;
      }

      if (value == null || (leadingZero && idx < digits - 1)) {
        comp.digit = 0;
      } else if (idx === digits - 1) {
        comp.digit = (Math.round(curDigit) % 10) as ZeroNine;
      } else {
        comp.digit = (Math.floor(curDigit) % 10) as ZeroNine;
      }
    });
  }

}
