import {DATA_REFRESH_REQUEST_EVENT} from '../app.module';
import {NgEventBus} from 'ng-event-bus';

export abstract class Refreshable {
  constructor(protected eventBus: NgEventBus) {

    eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshData();
    });

  }

  protected abstract refreshData(): void;
}
