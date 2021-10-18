import {
  Component,
  Input,
  AfterViewInit,
  QueryList,
  Renderer2,
  ElementRef,
  ViewChild,
  ViewChildren
} from '@angular/core';

const segmentsForDigit = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F];
export type ZeroNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

@Component({
  selector: '[sevenSegDigit]',
  templateUrl: './seven-seg-digit.component.html',
  styleUrls: ['./seven-seg-digit.component.css']
})
export class SevenSegDigitComponent implements AfterViewInit {

  @ViewChildren('seg', {read: ElementRef}) segments!: QueryList<ElementRef>;
  @ViewChild('dot') point: any;

  @Input() color: string = 'black';

  @Input() idx: number = 0;
  allSegments = [0, 1, 2, 3, 4, 5, 6];
  class: string = '';

  private _digit: ZeroNine = 0;

  get digit(): ZeroNine {
    return this._digit;
  }

  set digit(val: ZeroNine) {
    this._digit = val;
    this.render();
  }

  private _showDecimal: boolean = false;

  set showDecimal(show: boolean) {
    this._showDecimal = show;
  }

  get showDecimal(): boolean {
    return this._showDecimal;
  }

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit() {
    this.render();
  }

  render() {
    let segs = segmentsForDigit[this._digit];
    this.segments.forEach((item, idx) => {
      let elt = item.nativeElement;
      if ((segs >> idx) & 1) {
        this.renderer.setAttribute(elt, 'segmentOn', '');
        this.renderer.removeAttribute(elt, 'segmentOff');
      } else {
        this.renderer.setAttribute(elt, 'segmentOff', '');
        this.renderer.removeAttribute(elt, 'segmentOn');
      }
      // force redraw in webkit
      elt.style.display = 'none';
      elt.style.display = '';
    });

    let ptElt = this.point.nativeElement;

    if (this._showDecimal) {
      this.renderer.setAttribute(ptElt, 'segmentOn', '');
      this.renderer.removeAttribute(ptElt, 'segmentOff');
    } else {
      this.renderer.setAttribute(ptElt, 'segmentOff', '');
      this.renderer.removeAttribute(ptElt, 'segmentOn');
    }
    ptElt.style.display = 'none';
    ptElt.style.display = '';
  }
}
