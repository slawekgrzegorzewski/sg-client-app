import {AfterViewInit, Component, Input, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-seven-seg-timer-display',
  templateUrl: './seven-seg-timer-display.component.html',
  styleUrls: ['./seven-seg-timer-display.component.css']
})
export class SevenSegTimerDisplay implements AfterViewInit {

  @Input() seconds: number = 0;

  @Input() minutes: number = 0;

  @Input() hours: number = 0;

  @Input() color: string = 'black';

  @Input() height: number = 48;

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit() {
  }
}
