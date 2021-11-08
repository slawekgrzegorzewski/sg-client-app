import {Component, Input} from '@angular/core';
import {Cube, Side} from '../../../utils/rubiks-cube/models';

@Component({
  selector: 'app-side',
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.css']
})
export class SideComponent {

  @Input() cube: Cube | null = null;
  @Input() side: Side | null = null;

  select(x: number, y: number) {
    this.side!.selectCell(x, y);
  }
}
