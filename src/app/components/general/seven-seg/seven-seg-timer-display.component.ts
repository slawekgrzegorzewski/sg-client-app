import {AfterViewInit, Component, Input, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-seven-seg-timer-display',
  templateUrl: './seven-seg-timer-display.component.html',
  styleUrls: ['./seven-seg-timer-display.component.css']
})
export class SevenSegTimerDisplay implements AfterViewInit {

  @ViewChild('colon_part11') colon_part11: any;
  @ViewChild('colon_part12') colon_part12: any;
  @ViewChild('colon_part21') colon_part21: any;
  @ViewChild('colon_part22') colon_part22: any;

  @Input() seconds: number = 0;

  @Input() minutes: number = 0;

  @Input() hours: number = 0;

  scale = 1;

  get viewBox(): string {
    const w = 10 * this.scale;
    const h = 80 * this.scale;
    return `0 0 ${w} ${h}`;
  }

  groupTransform(): string {
    let w =0;
    return `translate(${w} 0)`;
  }

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit() {
    this.renderer.setAttribute(this.colon_part11, 'segmentOn', '');
    this.renderer.removeAttribute(this.colon_part11, 'segmentOff');
    this.renderer.setAttribute(this.colon_part12, 'segmentOn', '');
    this.renderer.removeAttribute(this.colon_part12, 'segmentOff');
    this.renderer.setAttribute(this.colon_part21, 'segmentOn', '');
    this.renderer.removeAttribute(this.colon_part21, 'segmentOff');
    this.renderer.setAttribute(this.colon_part22, 'segmentOn', '');
    this.renderer.removeAttribute(this.colon_part22, 'segmentOff');
  }
}
