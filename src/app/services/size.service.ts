import {Injectable} from '@angular/core';
import {NgEventBus} from 'ng-event-bus';
import {APP_GET_SIZE_EVENT, APP_SIZE_EVENT} from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class SizeService {

  private _size: { height: number, width: number } = {height: 0, width: 0};
  get size(): { height: number; width: number } {
    return this._size;
  }

  set size(value: { height: number; width: number }) {
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
