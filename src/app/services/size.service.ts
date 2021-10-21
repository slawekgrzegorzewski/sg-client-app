import {Injectable} from '@angular/core';
import {NgEventBus} from 'ng-event-bus';

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
    this.eventBus.cast('app:size', this.size);
  }

  constructor(
    private eventBus: NgEventBus
  ) {
    this.eventBus.on('app:getsize').subscribe(() => {
      this.eventBus.cast('app:size', this.size);
    });
  }
}
