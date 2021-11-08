import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Cube} from '../../../utils/rubiks-cube/models';
import {Mode} from '../../../utils/rubiks-cube/enums';

@Component({
  selector: 'app-cube-controls',
  templateUrl: './cube-controls.component.html',
  styleUrls: ['./cube-controls.component.css']
})
export class CubeControlsComponent {

  @Input() cube: Cube | null = null;
  @Input() mode: Mode | null = null;

  @Output() modeChange = new EventEmitter<Mode>();

  change(newValue: Mode) {
    this.mode = newValue;
    this.modeChange.emit(newValue);
  }
}
