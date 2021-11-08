import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TimerComponent} from '../../../components/general/timer/timer.component';
import {CubeRecordsService} from '../../../services/accountant/cube-records.service';
import {CubeRecord, CubeStats, CubeType, CubeTypeSetting, cubeTypeSettings} from '../../../model/cubes/cube-record';
import scramble from '../../../model/cubes/cube-scrambler';
import {ChartMode, CubeRecordsLineChart} from '../../../model/cubes/CubeRecordsLineChart';
import {BaseChartDirective} from 'ng2-charts';
import {NgEventBus} from 'ng-event-bus';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {DatesUtils} from '../../../utils/dates-utils';
import {KeyValue} from '@angular/common';
import {AverageUtils} from '../../../utils/average-utils';
import {APP_GET_SIZE_EVENT, APP_SIZE_EVENT, DATA_REFRESH_REQUEST_EVENT} from '../../../app.module';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {CubeComponent} from '../../../components/rubiks-cube/cube/cube.component';

type DateStats = { sub30: number; sumOfAllSub30sTimes: number; all: number; sumOfAllTimes: number; };
type PageState = 'CLEAR' | 'SCRAMBLING' | 'SCRAMBLED' | 'ONGOING' | 'STOPPED';

export const CUBES_HOME_ROUTER_URL = 'cubes-home';

@Component({
  selector: 'app-cubes-home',
  templateUrl: './cubes-home.component.html',
  styleUrls: ['./cubes-home.component.css']
})
export class CubesHomeComponent implements OnInit, AfterViewInit, OnDestroy {

  public compareByDatesDesc = ComparatorBuilder.comparingByDateDays((value: KeyValue<Date, DateStats>) => value.key).desc().build();

  currentState: PageState = 'CLEAR';

  @ViewChild('rubiksCube') rubiksCube: CubeComponent | null = null;

  _cubeRecordsChartType: ChartMode = 'MOVING_AVERAGE';
  get cubeRecordsChartType(): ChartMode {
    return this._cubeRecordsChartType;
  }

  set cubeRecordsChartType(value: ChartMode) {
    this._cubeRecordsChartType = value;
    this.refreshStatsForSelectedCube();
  }

  cubeRecordsLineChart: CubeRecordsLineChart = new CubeRecordsLineChart([], this.cubeRecordsChartType);
  @ViewChild('piggyBanksChart') private cubesRecordsChart: BaseChartDirective | null = null;

  private _records: CubeRecord[] = [];

  get records(): CubeRecord[] {
    return this._records;
  }

  set records(value: CubeRecord[]) {
    this._records = value
      .sort(ComparatorBuilder.comparingByDate<CubeRecord>(cr => cr.recordTime).build());
    this.refreshStatsForSelectedCube();
  }

  statsForSelectedCube: CubeStats[] = [];
  statsByDates: Map<Date, DateStats> = new Map<Date, DateStats>();
  worst = 0;
  best = 0;
  bestAo5 = 0;
  bestAoN = 0;
  avg = 0;
  avgOfLastNElements = 0;
  historicalRecords: number[] = [];

  cubeTypeSettings = cubeTypeSettings;
  cubeTypesOrdered = [...cubeTypeSettings.entries()]
    .sort(ComparatorBuilder.comparing<[string, CubeTypeSetting]>(v => v[1].order).build())
    .map(v => v[0]);
  _selectedCubeType: CubeType = 'THREE';

  get selectedCubeType(): CubeType {
    return this._selectedCubeType;
  }

  set selectedCubeType(value: CubeType) {
    this._selectedCubeType = value;
    this.refreshStatsForSelectedCube();
    this.resetState();
  }

  @ViewChild('timer') timer: TimerComponent | null = null;
  turns: string = '';

  private _movingAverageNumberOfElements: number = 30;
  @Input() get movingAverageNumberOfElements(): number {
    return this._movingAverageNumberOfElements;
  }

  set movingAverageNumberOfElements(value: number) {
    this._movingAverageNumberOfElements = value;
    this.refreshStatsForSelectedCube();
  }

  resultsSummaryHeight: number = 200;
  resultsTableHeight: number = 0;
  clockWidth: number = 130;

  domainSubscription: Subscription | null = null;

  constructor(private cubeRecordsService: CubeRecordsService,
              private eventBus: NgEventBus,
              private route: ActivatedRoute,
              private domainService: DomainService) {
    this.domainService.registerToDomainChangesViaRouterUrl(CUBES_HOME_ROUTER_URL, this.route);
    this.domainSubscription = this.domainService.onCurrentDomainChange.subscribe((domain) => {
      this.refreshStats();
    });
  }

  ngOnInit(): void {
    this.eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshStats();
    });
    this.eventBus.on(APP_SIZE_EVENT).subscribe((event: any) => {
      this.sizeLayout(event.data.height, event.data.width);
    });
    this.eventBus.cast(APP_GET_SIZE_EVENT);
  }

  ngAfterViewInit(): void {
    this.refreshStats();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(CUBES_HOME_ROUTER_URL);
  }

  private refreshStats(newCubeRecord?: CubeRecord): void {
    if (newCubeRecord) {
      this.records.push(newCubeRecord);
      this.refreshStatsForSelectedCube();
    } else {
      this.cubeRecordsService.currentDomainRecords().subscribe(r => this.records = r);
    }
  }

  private refreshStatsForSelectedCube(): void {
    const recordsForSelectedCube = this.records.filter(r => r.cubesType === this.selectedCubeType);
    this.statsForSelectedCube = [];

    const movingAverageOf5 = AverageUtils.movingAverageOf(recordsForSelectedCube.map(cr => cr.time), 5);
    const movingAverageOfN = AverageUtils.movingAverageOf(recordsForSelectedCube.map(cr => cr.time), this.movingAverageNumberOfElements);

    for (let i = recordsForSelectedCube.length - 1; i >= 0; i--) {
      const cubeStat = new CubeStats();
      cubeStat.time = this.date(recordsForSelectedCube[i].time);
      cubeStat.recordTime = recordsForSelectedCube[i].recordTime;
      cubeStat.averages.set(5, this.date(movingAverageOf5[i] || 0));
      cubeStat.averages.set(this.movingAverageNumberOfElements, this.date(movingAverageOfN[i] || 0));
      this.statsForSelectedCube.push(cubeStat);
      if (this.statsForSelectedCube.length > 50) {
        break;
      }
    }

    const chartData = this.cubeRecordsChartType === 'RAW' ? recordsForSelectedCube.map(cr => cr.time) : movingAverageOfN;
    this.cubeRecordsLineChart = new CubeRecordsLineChart(chartData.filter(cr => cr !== null), this.cubeRecordsChartType);
    this.cubeRecordsLineChart.updateChart.subscribe(d => this.cubesRecordsChart!.chart.update());

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

    const allSolveTimes = recordsForSelectedCube.map(r => r.time);
    const lastNValues = recordsForSelectedCube.slice(-this.movingAverageNumberOfElements).map(r => r.time * 1_000);
    const ao5Values = recordsForSelectedCube.slice(-this.movingAverageNumberOfElements).map(r => r.time * 1_000);
    this.worst = (allSolveTimes && allSolveTimes.length > 0) ? Math.max(...allSolveTimes) : 0;
    this.best = (allSolveTimes && allSolveTimes.length > 0) ? Math.min(...allSolveTimes) : 0;
    const movingAverageOf5WithoutNulls = movingAverageOf5.filter(v => v !== null) as number[];
    const movingAverageOfNWithoutNulls = movingAverageOfN.filter(v => v !== null) as number[];
    this.bestAo5 = movingAverageOf5WithoutNulls.length > 0 ? Math.min(...movingAverageOf5WithoutNulls) : 0;
    this.bestAoN = movingAverageOfNWithoutNulls.length > 0 ? Math.min(...movingAverageOfNWithoutNulls) : 0;
    this.avg = (allSolveTimes && allSolveTimes.length > 0) ? allSolveTimes.reduce((a, b) => a + b, 0) / allSolveTimes.length : 0;
    this.avgOfLastNElements = (lastNValues && lastNValues.length > 0)
      ? lastNValues.reduce((a, b) => a + b, 0) / lastNValues.length
      : 0;

    const historicalRecords: number[] = [];
    recordsForSelectedCube.forEach((record) => {
        if (historicalRecords.length === 0) {
          historicalRecords.push(record.time);
        } else {
          if (record.time < historicalRecords[historicalRecords.length - 1]) {
            historicalRecords.push(record.time);
          }
        }
      }
    );
    this.historicalRecords = historicalRecords;
  }

  isThreeByThree(): boolean {
    return this.selectedCubeType === 'THREE';
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'Space':
        if (this.timer!.isRunning()) {
          this.stop();
        } else {
          if (event.shiftKey) {
            this.resume();
          } else {
            this.start();
          }
        }
        break;
      case 'KeyR':
        this.resetState();
        break;
      case 'KeyS':
        this.scramble();
        break;
      case 'Enter':
        if (event.shiftKey) {
          this.saveWithoutScramble();
        } else {
          this.save();
        }
        break;
      case 'Digit2':
      case 'Numpad2':
        this.selectedCubeType = 'TWO';
        break;
      case 'Digit3':
      case 'Numpad3':
        this.selectedCubeType = 'THREE';
        break;
      case 'Digit4':
      case 'Numpad4':
        this.selectedCubeType = 'FOUR';
        break;
      case 'Digit5':
      case 'Numpad5':
        this.selectedCubeType = 'FIVE';
        break;
      case 'Digit6':
      case 'Numpad6':
        this.selectedCubeType = 'SIX';
        break;
      case 'Digit7':
      case 'Numpad7':
        this.selectedCubeType = 'SEVEN';
        break;
      case 'Digit0':
      case 'Numpad0':
        this.selectedCubeType = 'MEGAMINX';
        break;

    }
  }

  public scramble(): void {
    if (this.currentState == 'ONGOING' || this.currentState === 'SCRAMBLING') {
      return;
    }

    this.resetState('SCRAMBLING');

    const turns = scramble({turns: 25});
    this.turns = turns.join(' ');

    performAlgorithm(this.rubiksCube!, turns);
    this.currentState = 'SCRAMBLED';


    function performAlgorithm(cube: CubeComponent, turns: string[]): void {
      for (const turn of turns) {
        const clockwise = !turn.includes('\'');
        const doubled = turn.includes('2');
        makeTurn(cube, turn, clockwise);
        if (doubled) {
          makeTurn(cube, turn, clockwise);
        }
      }
    }

    function makeTurn(cube: CubeComponent, turn: string, clockwise: boolean): void {
      switch (turn.charAt(0)) {
        case 'F':
          cube.f(clockwise);
          break;
        case 'B':
          cube.b(clockwise);
          break;
        case 'U':
          cube.u(clockwise);
          break;
        case 'D':
          cube.d(clockwise);
          break;
        case 'L':
          cube.l(clockwise);
          break;
        case 'R':
          cube.r(clockwise);
          break;
      }
    }
  }

  public start(): void {
    if (this.currentState === 'STOPPED') {
      this.resetState();
    }
    if (this.currentState === 'CLEAR' || this.currentState === 'SCRAMBLED') {
      this.timer!.start();
      this.currentState = 'ONGOING';
    }
  }

  public resume(): void {
    if (this.currentState === 'STOPPED') {
      this.timer!.resume();
      this.currentState = 'ONGOING';
    }
  }

  public stop(): void {
    if (this.currentState === 'ONGOING') {
      this.timer!.stop();
      this.currentState = 'STOPPED';
    }
  }

  public save(): void {
    if (this.currentState === 'STOPPED') {
      const cubeRecord = this.createCubeRecordEntity(this.turns);
      this.cubeRecordsService.create(cubeRecord).subscribe((newCubeRecord: CubeRecord) => this.refreshStats(newCubeRecord));
      this.resetState();
    }
  }

  public saveWithoutScramble(): void {
    if (this.currentState === 'STOPPED') {
      const cubeRecord = this.createCubeRecordEntity('');
      this.cubeRecordsService.create(cubeRecord).subscribe((newCubeRecord: CubeRecord) => this.refreshStats(newCubeRecord));
      this.resetState();
    }
  }

  resetState(currentState: PageState = 'CLEAR') {
    this.currentState = currentState;
    this.turns = '';
    this.timer!.stop();
    this.timer!.clear();
    this.rubiksCube?.reset();
  }

  private createCubeRecordEntity(scrambleToSave: string): CubeRecord {
    const cubeRecord = new CubeRecord();
    cubeRecord.cubesType = this.selectedCubeType;
    cubeRecord.recordTime = new Date();
    cubeRecord.scramble = scrambleToSave;
    cubeRecord.time = this.timer!.committedTime / 1000;
    return cubeRecord;
  }

  date(time: number): Date {
    return new Date(time * 1000);
  }

  private sizeLayout(height: number, width: number): void {
    this.resultsTableHeight = (height - this.resultsSummaryHeight) / 2;
    this.clockWidth = width / 2;
  }
}
















