import {Component, HostListener} from '@angular/core';
import {Cube, Move} from '../../../utils/rubiks-cube/models';
import {Direction, Mode, UserAction} from '../../../utils/rubiks-cube/enums';
import {UserActionInterpreter} from '../../../utils/rubiks-cube/user-action-interpreter';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.css']
})
export class CubeComponent {

  cube: Cube = new Cube();
  mouseDown = false;
  last: { clientY: number, clientX: number } | null = null;
  mode: Mode = Mode.Move;

  constructor() {
  }

  public reset(): void {
    this.cube.reset();
  }

  public u(clockwise: boolean): void {
    this.cube.move(new Move(0, clockwise ? Direction.Left : Direction.Right), true);
  }

  public d(clockwise: boolean): void {
    this.cube.move(new Move(2, clockwise ? Direction.Right : Direction.Left), true);
  }

  public f(clockwise: boolean): void {
    this.cube.move(new Move(2, clockwise ? Direction.Up2 : Direction.Down2), true);
  }

  public b(clockwise: boolean): void {
    this.cube.move(new Move(0, clockwise ? Direction.Down2 : Direction.Up2), true);
  }

  public l(clockwise: boolean): void {
    this.cube.move(new Move(0, clockwise ? Direction.Down : Direction.Up), true);
  }

  public r(clockwise: boolean): void {
    this.cube.move(new Move(2, clockwise ? Direction.Up : Direction.Down), true);
  }

  private performMove(code: number) {
    if (!Object.values(UserAction).includes(code)) {
      return;
    }
    if (this.mode !== Mode.Play) {
      return;
    }
    const interpreter = new UserActionInterpreter();
    this.cube.move(interpreter.resolve(code));
  }

  @HostListener('window:keydown', ['$event.ctrlKey', '$event.keyCode']) onkeyUp(ctrlKey: boolean, keyCode: number) {
    // handle Ctrl + z
    if (ctrlKey && keyCode === UserAction.Zkey) {
      this.cube.undo();
    }
    this.performMove(keyCode);
    if (this.mode !== Mode.Move) {
      return;
    }
    if (keyCode === UserAction.RightKey) {
      this.cube.rotateY += 5;
    }
    if (keyCode === UserAction.LeftKey) {
      this.cube.rotateY -= 5;
    }
    if (keyCode === UserAction.DownKey) {
      this.cube.rotateX += 5;
    }
    if (keyCode === UserAction.UpKey) {
      this.cube.rotateX -= 5;
    }
  }

  @HostListener('window:mouseup') onMouseup() {
    this.mouseDown = false;
  }

  @HostListener('window:mousedown', ['$event.clientY', '$event.clientX']) onMousedown(clientY: number, clientX: number) {
    this.mouseDown = true;
    this.last = {clientY: clientY, clientX: clientX};
  }

  @HostListener('window:mousemove', ['$event.clientY', '$event.clientX']) onMousemove(clientY: number, clientX: number) {
    if (this.mode !== Mode.Move || !this.mouseDown) {
      return;
    }
    this.cube.rotateX -= clientY - (this.last?.clientY || 0);
    this.cube.rotateY += clientX - (this.last?.clientX || 0);
    this.last =
      this.last = {clientY: clientY, clientX: clientX};
  }

  @HostListener('swipe', ['$event.direction']) onTap(direction: number) {
    this.performMove(direction);
  }
}
