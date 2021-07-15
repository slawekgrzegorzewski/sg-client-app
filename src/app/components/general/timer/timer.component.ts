import {Component} from '@angular/core';


@Component({
  selector: 'sg-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent {

  interval = 99;
  timeoutId = 0;
  startTime: Date = new Date();

  committedTime = 0;
  currentTime = 0;

  seconds = 0;
  minutes = 0;
  hours = 0;

  constructor() {
    this.clear();
  }

  start(): void {
    this.clear();
    this.timeoutId = setInterval(() => this.update(), this.interval);
  }

  private clear(): void {
    this.committedTime = 0;
    this.currentTime = 0;
    this.startTime = new Date();
    this.display(this.committedTime);
  }

  resume(): void {
    this.startTime = new Date();
    this.timeoutId = setInterval(() => this.update(), this.interval);
  }

  stop(): void {
    clearInterval(this.timeoutId);
    this.timeoutId = 0;
    this.committedTime = this.committedTime + new Date().getTime() - this.startTime.getTime();
    this.display(this.committedTime);
  }

  isRunning(): boolean {
    return this.timeoutId !== 0;
  }

  update(): void {
    this.currentTime = this.committedTime + new Date().getTime() - this.startTime.getTime();
    this.display(this.currentTime);
  }

  private display(time: number): void {
    this.seconds = time / 1000 % 60;
    this.minutes = Math.floor(time / 60_000) % 60;
    this.hours = Math.floor(time / 3_600_000);
  }
}
