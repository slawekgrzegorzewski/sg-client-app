import {CubeRecord, CubeStats, CubeType} from '../model/cube-record';
import {AverageUtils} from '../../general/utils/average-utils';
import {DatesUtils} from '../../general/utils/dates-utils';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';

export type DateStats = { sub30: number; sumOfAllSub30sTimes: number; all: number; sumOfAllTimes: number; };

export class RubikCubeRecordStatistics {
  records: CubeRecord[] = [];
  statsForSelectedCube: CubeStats[] = [];
  movingAverageOf5: (number | null)[] = [];
  movingAverageOfN: (number | null)[] = [];
  dailyStatistics: Map<Date, DateStats> = new Map<Date, DateStats>();
  worst = 0;
  best = 0;
  bestAo5 = 0;
  bestAoN = 0;
  avg = 0;
  avgOfLastNElements = 0;
  historicalRecords: CubeRecord[] = [];

  constructor(records: CubeRecord[]) {
    this.records = records;
  }

  getLastNCubeRecords(n: number | null = null) {
    const cubeStats = this.statsForSelectedCube.sort(ComparatorBuilder.comparingByDate<CubeStats>(cs => cs.recordTime).build());
    return n ? cubeStats.slice(0, n) : cubeStats;
  }

  public refreshStatsForSelectedCube(cubeType: CubeType, movingAverageCount: number): void {
    const recordsForSelectedCube = this.records.filter(r => r.cubesType === cubeType);

    this.movingAverageOf5 = AverageUtils.movingAverageOf(recordsForSelectedCube.map(cr => cr.time), 5);
    this.movingAverageOfN = AverageUtils.movingAverageOf(recordsForSelectedCube.map(cr => cr.time), movingAverageCount);

    this.statsForSelectedCube = [];
    for (let i = recordsForSelectedCube.length - 1; i >= 0; i--) {
      const cubeStat = new CubeStats();
      cubeStat.time = recordsForSelectedCube[i].time;
      cubeStat.recordTime = recordsForSelectedCube[i].recordTime;
      cubeStat.averages.set(5, CubeRecord.date(this.movingAverageOf5[i] || 0));
      cubeStat.averages.set(movingAverageCount, CubeRecord.date(this.movingAverageOfN[i] || 0));
      this.statsForSelectedCube.push(cubeStat);
    }

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
    this.dailyStatistics.clear();
    byDatesAsNumbers.forEach((value: DateStats, key: number) => {
      this.dailyStatistics.set(new Date(key), value);
    });

    const allSolveTimes = recordsForSelectedCube.map(r => r.time);
    const lastNValues = recordsForSelectedCube.slice(-movingAverageCount).map(r => r.time);
    const ao5Values = recordsForSelectedCube.slice(-movingAverageCount).map(r => r.time);
    this.worst = (allSolveTimes && allSolveTimes.length > 0) ? Math.max(...allSolveTimes) : 0;
    this.best = (allSolveTimes && allSolveTimes.length > 0) ? Math.min(...allSolveTimes) : 0;
    const movingAverageOf5WithoutNulls = this.movingAverageOf5.filter(v => v !== null) as number[];
    const movingAverageOfNWithoutNulls = this.movingAverageOfN.filter(v => v !== null) as number[];
    this.bestAo5 = movingAverageOf5WithoutNulls.length > 0 ? Math.min(...movingAverageOf5WithoutNulls) : 0;
    this.bestAoN = movingAverageOfNWithoutNulls.length > 0 ? Math.min(...movingAverageOfNWithoutNulls) : 0;
    this.avg = (allSolveTimes && allSolveTimes.length > 0) ? allSolveTimes.reduce((a, b) => a + b, 0) / allSolveTimes.length : 0;
    this.avgOfLastNElements = (lastNValues && lastNValues.length > 0)
      ? lastNValues.reduce((a, b) => a + b, 0) / lastNValues.length
      : 0;

    this.historicalRecords = [];
    recordsForSelectedCube.forEach((record) => {
        if (this.historicalRecords.length === 0) {
          this.historicalRecords.push(record);
        } else {
          if (record.time < this.historicalRecords[this.historicalRecords.length - 1].time) {
            this.historicalRecords.push(record);
          }
        }
      }
    );
  }
}
