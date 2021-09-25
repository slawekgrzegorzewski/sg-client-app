import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TimerComponent} from '../../../components/general/timer/timer.component';
import {CubeRecordsService} from '../../../services/accountant/cube-records.service';
import {CubeRecord, CubeType, cubeTypeDescriptions} from '../../../model/cubes/cube-record';
import scramble from '../../../model/cubes/cube-scrambler';
import {RubiksCube} from '../../../components/general/rubiks-cube/RubiksCube';
import {classicMaterials} from '../../../components/general/rubiks-cube/types';
import {ChartMode, CubeRecordsLineChart} from '../../../model/cubes/CubeRecordsLineChart';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-cubes-home',
  templateUrl: './cubes-home.component.html',
  styleUrls: ['./cubes-home.component.css']
})
export class CubesHomeComponent implements OnInit, AfterViewInit {

  @ViewChild('rubiks', {static: true})
  canvas: ElementRef<HTMLCanvasElement> | null = null;
  cube: RubiksCube | null = null;
  reverseAlgorithm: ((duration?: number) => Promise<void>)[] = [];
  cubeRecordsChartTypeInternal: ChartMode = 'RAW';

  get cubeRecordsChartType(): ChartMode {
    return this.cubeRecordsChartTypeInternal;
  }

  set cubeRecordsChartType(value: ChartMode) {
    this.cubeRecordsChartTypeInternal = value;
    this.refreshStatsForSelectedCube();
  }

  cubeRecordsLineChart: CubeRecordsLineChart = new CubeRecordsLineChart([], this.cubeRecordsChartType);
  @ViewChild('piggyBanksChart')
  public cubesRecordsChart: BaseChartDirective | null = null;

  max = new Date(0);
  min = new Date(0);
  avg = new Date(0);
  avgOfLastNElements = new Date(0);

  private recordsInternal: CubeRecord[] = [];

  get records(): CubeRecord[] {
    return this.recordsInternal;
  }

  set records(value: CubeRecord[]) {
    this.recordsInternal = value;
    this.refreshStatsForSelectedCube();
  }

  recordsForSelectedCube: CubeRecord[] = [];

  selectedCubeInternal: CubeType = 'THREE';

  get selectedCube(): CubeType {
    return this.selectedCubeInternal;
  }

  set selectedCube(value: CubeType) {
    this.selectedCubeInternal = value;
    this.refreshStatsForSelectedCube();
    this.visible = this.isThreeByThree();
  }

  cubeTypes = cubeTypeDescriptions;

  @ViewChild('timer') timer: TimerComponent | null = null;
  private firstRun = true;
  turns: string = '';
  visible = true;

  private _movingAverageNumberOfElements: number = 7;

  @Input() get movingAverageNumberOfElements(): number {
    return this._movingAverageNumberOfElements;
  }

  set movingAverageNumberOfElements(value: number) {
    this._movingAverageNumberOfElements = value;
    this.refreshStatsForSelectedCube();
  }

  constructor(private cubeRecordsService: CubeRecordsService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.cube = new RubiksCube(this.canvas!.nativeElement, classicMaterials, 100);
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
    this.cubeRecordsLineChart = new CubeRecordsLineChart(this.recordsForSelectedCube, this.cubeRecordsChartType, this.movingAverageNumberOfElements);
    this.cubeRecordsLineChart.updateChart.subscribe(d => this.cubesRecordsChart!.chart.update());
    const values = this.recordsForSelectedCube.map(r => r.time * 1_000);
    const lastNValues = this.recordsForSelectedCube.slice(-this.movingAverageNumberOfElements).map(r => r.time * 1_000);
    this.max = (values && values.length > 0) ? new Date(Math.max(...values)) : new Date(0);
    this.min = (values && values.length > 0) ? new Date(Math.min(...values)) : new Date(0);
    this.avg = (values && values.length > 0) ? new Date(values.reduce((a, b) => a + b, 0) / values.length) : new Date(0);
    this.avgOfLastNElements = (lastNValues && lastNValues.length > 0) ? new Date(lastNValues.reduce((a, b) => a + b, 0) / lastNValues.length) : new Date(0);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      if (this.timer!.isRunning()) {
        this.stop();
      } else {
        this.start();
      }
    } else if (event.code === 'KeyR') {
      this.resume();
    } else if (event.code === 'Enter') {
      if (event.shiftKey) {
        this.saveWithoutScramble();
      } else {
        this.save();
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
    const reverseAlgorithm: ((duration?: number) => Promise<void>)[] = [];

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

  private performAlgorithm(algorithm: any[], promise: Promise<void> | null): Promise<void> | null {
    for (const step of algorithm) {
      if (!promise) {
        promise = step(1);
      } else {
        promise = promise.then(r => step(1));
      }
    }
    return promise;
  }

  start(): void {
    if (this.firstRun) {
      this.firstRun = false;
    }
    this.timer!.start();
  }

  resume(): void {
    if (!this.timer!.isRunning() && !this.firstRun) {
      this.timer!.resume();
    }
  }

  stop(): void {
    this.timer!.stop();
  }

  save(): void {
    if (!this.timer!.isRunning()) {
      const cubeRecord = this.createCubeRecordEntity(this.turns);
      this.cubeRecordsService.createService(cubeRecord).subscribe(r => this.refreshStats());
    }
  }

  saveWithoutScramble(): void {
    if (!this.timer!.isRunning()) {
      const cubeRecord = this.createCubeRecordEntity('');
      this.cubeRecordsService.createService(cubeRecord).subscribe(r => this.refreshStats());
    }
  }

  private createCubeRecordEntity(scrambleToSave: string): CubeRecord {
    const cubeRecord = new CubeRecord();
    cubeRecord.cubesType = this.selectedCube;
    cubeRecord.recordTime = new Date();
    cubeRecord.scramble = scrambleToSave;
    cubeRecord.time = this.timer!.committedTime / 1000;
    return cubeRecord;
  }

  turnToMethod(turn: string, clockwise: boolean): (duration?: number) => Promise<void> {
    const cube = this.cube!;
    switch (turn.charAt(0)) {
      case 'F':
        return (d) => {
          return cube.F(clockwise, d);
        };
      case 'B':
        return (d) => {
          return cube.B(!clockwise, d);
        };
      case 'U':
        return (d) => {
          return cube.U(clockwise, d);
        };
      case 'D':
        return (d) => {
          return cube.D(!clockwise, d);
        };
      case 'L':
        return (d) => {
          return cube.L(!clockwise, d);
        };
      case 'R':
        return (d) => {
          return cube.R(clockwise, d);
        };
      case 'f':
        return (d) => {
          return cube.f(clockwise, d);
        };
      case 'b':
        return (d) => {
          return cube.b(!clockwise, d);
        };
      case 'u':
        return (d) => {
          return cube.u(clockwise, d);
        };
      case 'd':
        return (d) => {
          return cube.d(!clockwise, d);
        };
      case 'l':
        return (d) => {
          return cube.l(!clockwise, d);
        };
      case 'r':
        return (d) => {
          return cube.r(clockwise, d);
        };
      case 'x':
        return (d) => {
          return cube.x(clockwise, d);
        };
      case 'y':
        return (d) => {
          return cube.y(clockwise, d);
        };
      case 'z':
        return (d) => {
          return cube.z(clockwise, d);
        };
      default:
        return (d) => Promise.resolve();
    }
  }

  date(time: number): Date {
    return new Date(time * 1000);
  }
}
















