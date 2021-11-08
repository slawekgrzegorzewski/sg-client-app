import {Component, HostListener, Input} from '@angular/core';
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
  last: MouseEvent | null = null;
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

  @HostListener('window:keydown', ['$event']) onkeyUp(event: any) {
    event.preventDefault();
    // handle Ctrl + z
    if (event.ctrlKey && event.keyCode === UserAction.Zkey) {
      this.cube.undo();
    }
    this.performMove(event.keyCode);
    if (this.mode !== Mode.Move) {
      return;
    }
    if (event.keyCode === UserAction.RightKey) {
      this.cube.rotateY += 5;
    }
    if (event.keyCode === UserAction.LeftKey) {
      this.cube.rotateY -= 5;
    }
    if (event.keyCode === UserAction.DownKey) {
      this.cube.rotateX += 5;
    }
    if (event.keyCode === UserAction.UpKey) {
      this.cube.rotateX -= 5;
    }
  }

  @HostListener('window:mouseup') onMouseup() {
    this.mouseDown = false;
  }

  @HostListener('window:mousedown', ['$event']) onMousedown(event: MouseEvent) {
    this.mouseDown = true;
    this.last = event;
  }

  @HostListener('window:mousemove', ['$event']) onMousemove(event: MouseEvent) {
    event.preventDefault();
    if (this.mode !== Mode.Move || !this.mouseDown) {
      return;
    }
    this.cube.rotateX -= event.clientY - (this.last?.clientY || 0);
    this.cube.rotateY += event.clientX - (this.last?.clientX || 0);
    this.last = event;
  }

  @HostListener('swipe', ['$event']) onTap(e: { direction: number }) {
    this.performMove(e.direction);
  }
}
