import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TimerComponent} from '../../components/general/timer/timer.component';
import {CubeRecordsService} from '../../services/accountant/cube-records.service';
import {CubeRecord, CubeStats, CubeType, cubeTypeSettings, orderOfCubeTypes} from '../../model/cubes/cube-record';
import scramble from '../../model/cubes/cube-scrambler';
import {NgEventBus} from 'ng-event-bus';
import {ComparatorBuilder} from '../../utils/comparator-builder';
import {APP_GET_SIZE_EVENT, APP_SIZE_EVENT, DATA_REFRESH_REQUEST_EVENT} from '../../app.module';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../services/domain.service';
import {CubeComponent} from '../../components/rubiks-cube/cube/cube.component';
import {RubikCubeRecordStatistics} from '../../utils/rubiks-cube/rubik-cube-record-statistics';
import {ViewMode} from '../../utils/view-mode';
import {AppSize} from '../../services/size.service';

type PageState = 'CLEAR' | 'SCRAMBLING' | 'SCRAMBLED' | 'ONGOING' | 'STOPPED';

export const CUBES_HOME_ROUTER_URL = 'cubes-home';

@Component({
  selector: 'app-cubes-home',
  templateUrl: './cubes-home.component.html',
  styleUrls: ['./cubes-home.component.css']
})
export class CubesHomeComponent implements OnInit, AfterViewInit, OnDestroy {

  currentState: PageState = 'CLEAR';

  @ViewChild('rubiksCube') rubiksCube: CubeComponent | null = null;

  private _records: CubeRecord[] = [];
  viewMode: ViewMode = 'desktop';

  get records(): CubeRecord[] {
    return this._records;
  }

  set records(value: CubeRecord[]) {
    this._records = value
      .sort(ComparatorBuilder.comparingByDate<CubeRecord>(cr => cr.recordTime).build());
    this.refreshStatsForSelectedCube();
  }

  statsForSelectedCube: CubeStats[] = [];
  worst = 0;
  best = 0;
  bestAo5 = 0;
  bestAoN = 0;
  avg = 0;
  avgOfLastNElements = 0;

  cubeTypeSettings = cubeTypeSettings;
  cubeTypesOrdered = orderOfCubeTypes;

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

  @ViewChild('cubeContainer') rubiksCubeContainer: ElementRef | null = null;
  resultsSummaryHeight: number = 200;
  resultsTableHeight: number = 0;
  clockWidth: number = 130;
  cubeAvailableSpace: number = 130;

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
    this.domainService.deregisterFromDomainChangesViaRouterUrl(CUBES_HOME_ROUTER_URL);
  }

  private refreshStats(newCubeRecord?: CubeRecord): void {
    if (newCubeRecord) {
      this.records.push(newCubeRecord);
      this.refreshStatsForSelectedCube();
    } else {
      this.cubeRecordsService.currentDomainRecords(new Date()).subscribe(r => this.records = r);
    }
  }

  private refreshStatsForSelectedCube(): void {
    const rubikCubeRecordStatistics = new RubikCubeRecordStatistics(this.records);
    rubikCubeRecordStatistics.refreshStatsForSelectedCube(this.selectedCubeType, this.movingAverageNumberOfElements);
    this.statsForSelectedCube = rubikCubeRecordStatistics.getLastNCubeRecords();
    this.worst = rubikCubeRecordStatistics.worst;
    this.best = rubikCubeRecordStatistics.best;
    this.bestAo5 = rubikCubeRecordStatistics.bestAo5;
    this.bestAoN = rubikCubeRecordStatistics.bestAoN;
    this.avg = rubikCubeRecordStatistics.avg;
    this.avgOfLastNElements = rubikCubeRecordStatistics.avgOfLastNElements;
  }

  isThreeByThree(): boolean {
    return this.selectedCubeType === 'THREE';
  }

  @HostListener('window:keyup', ['$event.shiftKey', '$event.code', '$event.target'])
  onKeyUp(shiftKey: boolean, code: string, target: object): void {

    function shouldProcess(): boolean {
      if (target && 'id' in target) {
        const t = target as { id: string };
        if (t.id && t.id === 'movingAverageElementsCount') {
          return false;
        }
      }
      return true;
    }

    function process(cubesHomeComponent: CubesHomeComponent) {
      switch (code) {
        case 'Space':
          if (cubesHomeComponent.timer!.isRunning()) {
            cubesHomeComponent.stop();
          } else {
            if (shiftKey) {
              cubesHomeComponent.resume();
            } else {
              cubesHomeComponent.start();
            }
          }
          break;
        case 'KeyR':
          cubesHomeComponent.resetState();
          break;
        case 'KeyS':
          cubesHomeComponent.scramble();
          break;
        case 'Enter':
          if (shiftKey) {
            cubesHomeComponent.saveWithoutScramble();
          } else {
            cubesHomeComponent.save();
          }
          break;
        case 'Digit2':
        case 'Numpad2':
          cubesHomeComponent.selectedCubeType = 'TWO';
          break;
        case 'Digit3':
        case 'Numpad3':
          cubesHomeComponent.selectedCubeType = 'THREE';
          break;
        case 'Digit4':
        case 'Numpad4':
          cubesHomeComponent.selectedCubeType = 'FOUR';
          break;
        case 'Digit5':
        case 'Numpad5':
          cubesHomeComponent.selectedCubeType = 'FIVE';
          break;
        case 'Digit6':
        case 'Numpad6':
          cubesHomeComponent.selectedCubeType = 'SIX';
          break;
        case 'Digit7':
        case 'Numpad7':
          cubesHomeComponent.selectedCubeType = 'SEVEN';
          break;
        case 'Digit0':
        case 'Numpad0':
          cubesHomeComponent.selectedCubeType = 'MEGAMINX';
          break;

      }
    }

    if (shouldProcess()) {
      process(this);
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

  private sizeLayout(appSize: AppSize): void {
    if (window.innerWidth < 640) {
      this.viewMode = 'mobile';
    } else {
      this.viewMode = 'desktop';
    }
    this.resultsTableHeight = appSize.height - this.resultsSummaryHeight - appSize.navigationHeight - 60;
    this.clockWidth = appSize.width / 2;
    this.cubeAvailableSpace = this.rubiksCubeContainer?.nativeElement?.offsetWidth;
  }
}
















