import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgEventBus} from 'ng-event-bus';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public eventBus: NgEventBus) {
  }

  getAvailableHeight(): number {
    return window.innerHeight;
  }

  onTap(event: any) {
    if (event.tapCount === 2) {
      this.eventBus.cast('data:refresh');
    }
  }
}
