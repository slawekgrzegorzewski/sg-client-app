import {AfterViewInit, Component, HostListener, ViewChild} from '@angular/core';
import {NgEventBus} from 'ng-event-bus';
import {HeaderComponent} from './components/general/header/header.component';
import {SizeService} from './services/size.service';
import {DATA_REFRESH_REQUEST_EVENT, NAVIGATION_RESIZE_EVENT} from './utils/event-bus-events';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('navigation') navigation!: HeaderComponent;

  constructor(
    private eventBus: NgEventBus,
    private sizeService: SizeService) {
  }

  ngAfterViewInit(): void {
    this.eventBus.on(NAVIGATION_RESIZE_EVENT).subscribe(() => {
      this.castSizeEvent();
    });
    this.castSizeEvent();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.castSizeEvent();
  }

  private castSizeEvent() {
    this.sizeService.size = {
      height: window.innerHeight,
      width: window.innerWidth,
      navigationHeight: this.navigation.getTakenHeight()
    };
  }

  getAvailableHeight(): number {
    return window.innerHeight;
  }

  onTap(event: any) {
    if (event.tapCount === 2) {
      this.eventBus.cast(DATA_REFRESH_REQUEST_EVENT);
    }
  }
}
