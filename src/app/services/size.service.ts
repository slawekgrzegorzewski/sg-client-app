import {Injectable} from '@angular/core';
import {NgEventBus} from 'ng-event-bus';
import {APP_GET_SIZE_EVENT, APP_SIZE_EVENT} from '../utils/event-bus-events';

export type AppSize = { height: number, width: number, navigationHeight: number };

@Injectable({
  providedIn: 'root'
})
export class SizeService {

  private _size: AppSize = {height: 0, width: 0, navigationHeight: 0};
  get size(): AppSize {
    return this._size;
  }

  set size(value: AppSize) {
    this._size = value;
    this.eventBus.cast(APP_SIZE_EVENT, this.size);
  }

  constructor(
    private eventBus: NgEventBus
  ) {
    this.eventBus.on(APP_GET_SIZE_EVENT).subscribe(() => {
      this.eventBus.cast(APP_SIZE_EVENT, this.size);
    });
  }
}
