import {Chart, ChartConfiguration, ChartOptions} from 'chart.js';

import {default as Annotation} from 'chartjs-plugin-annotation';
import {DatePipe} from '@angular/common';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';

export class SavingsLineChart {

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          display: true
        }
      }
    }
  };

  constructor(data: Map<Date, Map<string, number>>, datePipe: DatePipe) {

    Chart.register(Annotation);

    let dates: Date[] = [];
    for (const key of data.keys()) {
      dates.push(key);
    }
    dates = dates.sort(ComparatorBuilder.comparingByDateDays<Date>(date => date).build());
    const dataPerCurrency = new Map<string, (number | null)[]>();
    const labels: string[] = [];
    dates.forEach(d => {
      let dateLabel = datePipe.transform(d, 'yyyy-MM') || '';
      labels.push(dateLabel);
      const dateData = data.get(d) || new Map<string, number>();
      for (const currency of dateData.keys()) {
        const values = dataPerCurrency.get(currency) || [];
        values.push(dateData.get(currency) || null);
        dataPerCurrency.set(currency, values);
      }
    });
    for (const currency of dataPerCurrency.keys()) {
      this.lineChartData.datasets.push({data: dataPerCurrency.get(currency) || [], label: 'Oszczędności (' + currency + ')'});
    }
    this.lineChartData.labels = labels;
  }
}
