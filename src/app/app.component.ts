import {AfterViewInit, Component, HostListener, ViewChild} from '@angular/core';
import {NgEventBus} from 'ng-event-bus';
import {HeaderComponent} from './components/general/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('navigation') navigation!: HeaderComponent;

  constructor(public eventBus: NgEventBus) {
  }

  ngAfterViewInit(): void {
    this.eventBus.on('navigation:resize').subscribe(() => {
      this.castSizeEvent();
    });
    this.eventBus.on('app:getsize').subscribe(() => {
      this.castSizeEvent();
    });
    this.castSizeEvent();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.castSizeEvent();
  }

  private castSizeEvent() {
    this.eventBus.cast('app:resize', {
      h: window.innerHeight - this.navigation.getTakenHeight(),
      w: window.innerWidth
    });
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
