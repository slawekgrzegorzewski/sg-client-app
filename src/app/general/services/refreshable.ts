import {NgEventBus} from 'ng-event-bus';
import {DATA_REFRESH_REQUEST_EVENT} from '../utils/event-bus-events';

export abstract class Refreshable {
  constructor(protected eventBus: NgEventBus) {

    eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshData();
    });

  }

  protected abstract refreshData(): void;
}
