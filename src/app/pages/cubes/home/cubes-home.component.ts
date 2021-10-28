import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TimerComponent} from '../../../components/general/timer/timer.component';
import {CubeRecordsService} from '../../../services/accountant/cube-records.service';
import {CubeRecord, CubeStats, CubeType, cubeTypeDescriptions} from '../../../model/cubes/cube-record';
import scramble from '../../../model/cubes/cube-scrambler';
import {RubiksCube} from '../../../components/general/rubiks-cube/RubiksCube';
import {classicMaterials} from '../../../components/general/rubiks-cube/types';
import {ChartMode, CubeRecordsLineChart} from '../../../model/cubes/CubeRecordsLineChart';
import {BaseChartDirective} from 'ng2-charts';
import {NgEventBus} from 'ng-event-bus';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {DatesUtils} from '../../../utils/dates-utils';
import {KeyValue} from '@angular/common';

type DateStats = { sub30: number; sumOfAllSub30sTimes: number; all: number; sumOfAllTimes: number; };

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
  cubeRecordsChartTypeInternal: ChartMode = 'MOVING_AVERAGE';
  statsByDates: Map<Date, DateStats> = new Map<Date, DateStats>();
  compareKeyPair = ComparatorBuilder.comparingByDateDays((value: KeyValue<Date, DateStats>) => value.key).desc().build();

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

  statsForSelectedCube: CubeStats[] = [];
  private recordsInternal: CubeRecord[] = [];

  get records(): CubeRecord[] {
    return this.recordsInternal;
  }

  set records(value: CubeRecord[]) {
    this.recordsInternal = value
      .sort(ComparatorBuilder.comparingByDate<CubeRecord>(cr => cr.recordTime).build());
    this.refreshStatsForSelectedCube();
  }

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

  private _movingAverageNumberOfElements: number = 30;
  resultsSummaryHeight: number = 200;
  resultsTableHeight: number = 0;
  clockWidth: number = 130;

  @Input() get movingAverageNumberOfElements(): number {
    return this._movingAverageNumberOfElements;
  }

  set movingAverageNumberOfElements(value: number) {
    this._movingAverageNumberOfElements = value;
    this.refreshStatsForSelectedCube();
  }

  constructor(private cubeRecordsService: CubeRecordsService,
              private eventBus: NgEventBus) {
  }

  ngOnInit(): void {
    this.eventBus.on('data:refresh').subscribe(() => {
      this.refreshStats();
    });
    this.eventBus.on('app:size').subscribe((event: any) => {
      this.sizeLayout(event.data.height, event.data.width);
    });
    this.eventBus.cast('app:getsize');
  }

  ngAfterViewInit(): void {
    this.cube = new RubiksCube(this.canvas!.nativeElement, classicMaterials, 100);
    this.refreshStats();
  }

  private refreshStats(newCubeRecord?: CubeRecord): void {
    if (newCubeRecord) {
      this.records.push(newCubeRecord);
      this.refreshStatsForSelectedCube();
    } else {
      this.cubeRecordsService.currentDomainRecords().subscribe(r => this.records = r);
    }
  }

  isThreeByThree(): boolean {
    return this.selectedCube === 'THREE';
  }

  private refreshStatsForSelectedCube(): void {
    const recordsForSelectedCube = this.records.filter(r => r.cubesType === this.selectedCube);
    this.statsForSelectedCube = [];

    const movingAverageOf5 = this.movingAverageOf(recordsForSelectedCube.map(cr => cr.time), 5);
    const movingAverageOfN = this.movingAverageOf(recordsForSelectedCube.map(cr => cr.time), this.movingAverageNumberOfElements);

    for (let i = recordsForSelectedCube.length - 1; i >= 0; i--) {
      const cubeStat = new CubeStats();
      cubeStat.time = this.toDate(recordsForSelectedCube[i].time);
      cubeStat.recordTime = recordsForSelectedCube[i].recordTime;
      cubeStat.averages.set(5, this.toDate(movingAverageOf5[i] || 0));
      cubeStat.averages.set(this.movingAverageNumberOfElements, this.toDate(movingAverageOfN[i] || 0));
      this.statsForSelectedCube.push(cubeStat);
      if (this.statsForSelectedCube.length > 50) {
        break;
      }
    }

    const chartData = this.cubeRecordsChartType === 'RAW' ? recordsForSelectedCube.map(cr => cr.time) : movingAverageOfN;
    this.cubeRecordsLineChart = new CubeRecordsLineChart(chartData.filter(cr => cr !== null), this.cubeRecordsChartType);
    this.cubeRecordsLineChart.updateChart.subscribe(d => this.cubesRecordsChart!.chart.update());

    const values = recordsForSelectedCube.map(r => r.time * 1_000);
    const lastNValues = recordsForSelectedCube.slice(-this.movingAverageNumberOfElements).map(r => r.time * 1_000);
    this.max = (values && values.length > 0) ? new Date(Math.max(...values)) : new Date(0);
    this.min = (values && values.length > 0) ? new Date(Math.min(...values)) : new Date(0);
    this.avg = (values && values.length > 0) ? new Date(values.reduce((a, b) => a + b, 0) / values.length) : new Date(0);
    this.avgOfLastNElements = (lastNValues && lastNValues.length > 0)
      ? new Date(lastNValues.reduce((a, b) => a + b, 0) / lastNValues.length)
      : new Date(0);

    const byDatesAsNumbers: Map<number, DateStats> = new Map<number, DateStats>();
    recordsForSelectedCube.forEach(record => {
      const dateMidnight = DatesUtils.getDateMidnight(record.recordTime);
      let dateStats = byDatesAsNumbers.get(dateMidnight.getTime());
      if (!dateStats) {
        dateStats = {sub30: 0, sumOfAllSub30sTimes: 0, all: 0, sumOfAllTimes: 0};
      }
      dateStats.all++;
      dateStats.sumOfAllTimes += record.time;
      if (record.time < 30) {
        dateStats.sub30++;
        dateStats.sumOfAllSub30sTimes += record.time;
      }
      byDatesAsNumbers.set(dateMidnight.getTime(), dateStats);
    });
    const byDates: Map<Date, DateStats> = new Map<Date, DateStats>();
    byDatesAsNumbers.forEach((value: DateStats, key: number) => {
      byDates.set(new Date(key), value);
    });
    this.statsByDates = byDates;
  }

  private movingAverageOf(records: number[], numberOfElements: number): (number | null)[] {
    const movingAverage = [];
    const lastNRecords = [];
    for (const d of records) {
      lastNRecords.push(d);
      if (lastNRecords.length > numberOfElements) {
        lastNRecords.shift();
        movingAverage.push(lastNRecords.reduce((a, b) => a + b, 0) / lastNRecords.length);
      } else {
        movingAverage.push(null);
      }
    }
    return movingAverage;
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

  resetScramble(): void {
    this.performAlgorithm(this.reverseAlgorithm, null);
    this.turns = '';
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
      this.cubeRecordsService.create(cubeRecord).subscribe((newCubeRecord: CubeRecord) => this.refreshStats(newCubeRecord));
    }
  }

  saveWithoutScramble(): void {
    if (!this.timer!.isRunning()) {
      const cubeRecord = this.createCubeRecordEntity('');
      this.cubeRecordsService.create(cubeRecord).subscribe((newCubeRecord: CubeRecord) => this.refreshStats(newCubeRecord));
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

  toDate(time: number): Date {
    return new Date(time * 1000);
  }

  private sizeLayout(height: number, width: number): void {
    this.resultsTableHeight = (height - this.resultsSummaryHeight) / 2;
    this.clockWidth = width / 2;
  }
}
















