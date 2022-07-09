import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CubeRecordsService} from '../../services/accountant/cube-records.service';
import {CubeRecord, CubeStats, CubeType, CubeTypeSetting, cubeTypeSettings, orderOfCubeTypes} from '../../model/cubes/cube-record';
import {ChartMode, CubeRecordsLineChart} from '../../model/cubes/CubeRecordsLineChart';
import {BaseChartDirective} from 'ng2-charts';
import {NgEventBus} from 'ng-event-bus';
import {ComparatorBuilder} from '../../utils/comparator-builder';
import {KeyValue} from '@angular/common';
import {APP_GET_SIZE_EVENT, APP_SIZE_EVENT, DATA_REFRESH_REQUEST_EVENT} from '../../app.module';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../services/domain.service';
import {DateStats, RubikCubeRecordStatistics} from '../../utils/rubiks-cube/rubik-cube-record-statistics';
import {AppSize} from '../../services/size.service';

export const CUBES_STATISTICS_ROUTER_URL = 'cubes-statistics';

@Component({
  selector: 'app-cube-statistics',
  templateUrl: './cube-statistics.component.html',
  styleUrls: ['./cube-statistics.component.css']
})
export class CubeStatisticsComponent implements OnInit, AfterViewInit, OnDestroy {

  public compareByDatesDesc = ComparatorBuilder.comparingByDateDays((value: KeyValue<Date, DateStats>) => value.key).desc().build();

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
  cubeTypesOrdered = orderOfCubeTypes;

  _selectedCubeType: CubeType = 'THREE';

  get selectedCubeType(): CubeType {
    return this._selectedCubeType;
  }

  set selectedCubeType(value: CubeType) {
    this._selectedCubeType = value;
    this.refreshStatsForSelectedCube();
  }

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

  domainSubscription: Subscription | null = null;

  constructor(private cubeRecordsService: CubeRecordsService,
              private eventBus: NgEventBus,
              private route: ActivatedRoute,
              private domainService: DomainService) {
    this.domainService.registerToDomainChangesViaRouterUrl(CUBES_STATISTICS_ROUTER_URL, this.route);
    this.domainSubscription = this.domainService.onCurrentDomainChange.subscribe((domain) => {
      this.refreshStats();
    });
  }

  ngOnInit(): void {
    this.eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshStats();
    });
    this.eventBus.on(APP_SIZE_EVENT).subscribe((event: any) => {
      this.sizeLayout(event.data);
    });
    setTimeout(() => this.eventBus.cast(APP_GET_SIZE_EVENT), 1);
  }

  ngAfterViewInit(): void {
    this.refreshStats();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(CUBES_STATISTICS_ROUTER_URL);
  }

  private refreshStats(): void {
    this.cubeRecordsService.currentDomainRecords().subscribe(r => this.records = r);
  }

  private refreshStatsForSelectedCube(): void {
    const rubikCubeRecordStatistics = new RubikCubeRecordStatistics(this.records);
    rubikCubeRecordStatistics.refreshStatsForSelectedCube(this.selectedCubeType, this.movingAverageNumberOfElements);
    this.statsForSelectedCube = rubikCubeRecordStatistics.getLastNCubeRecords(50);
    const chartData = this.cubeRecordsChartType === 'RAW'
      ? rubikCubeRecordStatistics.getLastNCubeRecords().map(cr => cr.time)
      : rubikCubeRecordStatistics.movingAverageOfN;
    this.cubeRecordsLineChart = new CubeRecordsLineChart(chartData.filter(cr => cr !== null), this.cubeRecordsChartType);
    this.cubeRecordsLineChart.updateChart.subscribe(d => this.cubesRecordsChart!.chart!.update());
    this.statsByDates = rubikCubeRecordStatistics.dailyStatistics;
    this.worst = rubikCubeRecordStatistics.worst;
    this.best = rubikCubeRecordStatistics.best;
    this.bestAo5 = rubikCubeRecordStatistics.bestAo5;
    this.bestAoN = rubikCubeRecordStatistics.bestAoN;
    this.avg = rubikCubeRecordStatistics.avg;
    this.avgOfLastNElements = rubikCubeRecordStatistics.avgOfLastNElements;
    this.historicalRecords = rubikCubeRecordStatistics.historicalRecords.map(cr => cr.time);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
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

  private sizeLayout(size: AppSize): void {
    this.resultsTableHeight = (size.height - this.resultsSummaryHeight - size.navigationHeight) / 2;
  }
}
















