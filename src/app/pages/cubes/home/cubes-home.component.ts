import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {TimerComponent} from '../../../components/general/timer/timer.component';
import {CubeRecordsService} from '../../../services/accountant/cube-records.service';
import {CubeRecord, CubeType, cubeTypeDescriptions} from '../../../model/cubes/cube-record';
import scramble from '../../../model/cubes/cube-scrambler';
import {RubiksCube} from '../../../components/general/rubiks-cube/RubiksCube';
import {classicMaterials} from '../../../components/general/rubiks-cube/types';

@Component({
  selector: 'app-cubes-home',
  templateUrl: './cubes-home.component.html',
  styleUrls: ['./cubes-home.component.css']
})
export class CubesHomeComponent implements OnInit, AfterViewInit {

  @ViewChild('rubiks', {static: true})
  canvas: ElementRef<HTMLCanvasElement>;
  cube: RubiksCube;
  reverseAlgorithm = [];

  max: Date;
  min: Date;
  avg: Date;

  private _records: CubeRecord[];
  get records(): CubeRecord[] {
    return this._records;
  }

  set records(value: CubeRecord[]) {
    this._records = value;
    this.refreshStatsForSelectedCube();
  }

  recordsForSelectedCube: CubeRecord[];

  _selectedCube: CubeType = 'THREE';

  get selectedCube(): CubeType {
    return this._selectedCube;
  }

  set selectedCube(value: CubeType) {
    this._selectedCube = value;
    this.refreshStatsForSelectedCube();
    if (this.isThreeByThree()) {
      this.visible = true;
    } else {
      this.visible = false;
    }
  }

  cubeTypes = cubeTypeDescriptions;

  @ViewChild('timer') timer: TimerComponent;
  private firstRun = true;
  turns: string;
  visible = true;

  constructor(private cubeRecordsService: CubeRecordsService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.cube = new RubiksCube(this.canvas.nativeElement, classicMaterials, 100);
    this.refreshStats();
  }

  private refreshStats(): void {
    this.cubeRecordsService.currentDomainRecords().subscribe(r => this.records = r);
  }

  isThreeByThree(): boolean {
    return this.selectedCube === 'THREE';
  }

  private refreshStatsForSelectedCube(): void {
    this.recordsForSelectedCube = this.records.filter(r => r.cubesType === this.selectedCube);
    const values = this.recordsForSelectedCube.map(r => r.time * 1_000);
    console.log(values);
    this.max = (values && values.length > 0) ? new Date(Math.max(...values)) : new Date(0);
    this.min = (values && values.length > 0) ? new Date(Math.min(...values)) : new Date(0);
    this.avg = (values && values.length > 0) ? new Date(values.reduce((a, b) => a + b, 0) / values.length) : new Date(0);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      if (this.timer.isRunning()) {
        this.timer.stop();
      } else {
        if (this.firstRun) {
          this.firstRun = false;
        }
        this.timer.start();
      }
    } else if (event.code === 'KeyR') {
      if (!this.timer.isRunning() && !this.firstRun) {
        this.timer.resume();
      }
    } else if (event.code === 'Enter') {
      if (!this.timer.isRunning()) {
        const cubeRecord = new CubeRecord();
        cubeRecord.cubesType = this.selectedCube;
        cubeRecord.recordTime = new Date();
        cubeRecord.scramble = this.turns;
        cubeRecord.time = this.timer.committedTime / 1000;
        this.cubeRecordsService.createService(cubeRecord).subscribe(r => this.refreshStats());
      }
    }
  }

  scramble(): void {
    let promise = null;

    if (this.reverseAlgorithm) {
      promise = this.performAlgorithm(this.reverseAlgorithm, promise);
      this.reverseAlgorithm = [];
    }


    const turns = scramble({turns: 25});
    this.turns = turns.join(' ');

    const algorithm = [];
    const reverseAlgorithm = [];

    for (const turn of turns) {
      const clockwise = !turn.includes('\'');
      const doubled = turn.includes('2');
      const method = this.turnToMethod(turn, clockwise);
      const reversedMethod = this.turnToMethod(turn, !clockwise);

      algorithm.push(method);
      reverseAlgorithm.push(reversedMethod);
      if (doubled) {
        algorithm.push(method);
        reverseAlgorithm.push(reversedMethod);
      }
    }
    this.performAlgorithm(algorithm, promise);
    this.reverseAlgorithm = reverseAlgorithm.reverse();
  }

  private performAlgorithm(algorithm: any[], promise: Promise<void>): Promise<void> {
    for (const step of algorithm) {
      if (!promise) {
        promise = step(1);
      } else {
        promise = promise.then(r => step(1));
      }
    }
    return promise;
  }

  turnToMethod(turn: string, clockwise: boolean): (duration?: number) => Promise<void> {
    switch (turn.charAt(0)) {
      case 'F':
        return (d) => {
          return this.cube.F(clockwise, d);
        };
      case 'B':
        return (d) => {
          return this.cube.B(!clockwise, d);
        };
      case 'U':
        return (d) => {
          return this.cube.U(clockwise, d);
        };
      case 'D':
        return (d) => {
          return this.cube.D(!clockwise, d);
        };
      case 'L':
        return (d) => {
          return this.cube.L(!clockwise, d);
        };
      case 'R':
        return (d) => {
          return this.cube.R(clockwise, d);
        };
      case 'f':
        return (d) => {
          return this.cube.f(clockwise, d);
        };
      case 'b':
        return (d) => {
          return this.cube.b(!clockwise, d);
        };
      case 'u':
        return (d) => {
          return this.cube.u(clockwise, d);
        };
      case 'd':
        return (d) => {
          return this.cube.d(!clockwise, d);
        };
      case 'l':
        return (d) => {
          return this.cube.l(!clockwise, d);
        };
      case 'r':
        return (d) => {
          return this.cube.r(clockwise, d);
        };
      case 'x':
        return (d) => {
          return this.cube.x(clockwise, d);
        };
      case 'y':
        return (d) => {
          return this.cube.y(clockwise, d);
        };
      case 'z':
        return (d) => {
          return this.cube.z(clockwise, d);
        };
    }
  }

  date(time: number): Date {
    return new Date(time * 1000);
  }
}
















