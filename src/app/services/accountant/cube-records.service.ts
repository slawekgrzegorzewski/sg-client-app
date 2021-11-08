import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {CubeRecord, CubeRecordDTO} from '../../model/cubes/cube-record';
import {Observable} from 'rxjs';
import {DatePipe} from '@angular/common';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CubeRecordsService {

  private readonly endpoint = `${environment.serviceUrl}/cube-record`;

  constructor(private http: HttpClient,
              private datePipe: DatePipe) {
  }

  currentDomainRecords(date: Date | null = null): Observable<CubeRecord[]> {
    const url = date === null ? this.endpoint : `${this.endpoint}/${this.datePipe.transform(date, 'yyyy-MM-dd')}`;
    return this.http.get<CubeRecordDTO[]>(url)
      .pipe(map((data: CubeRecordDTO[]) => (data.map(d => new CubeRecord(d)))));
  }

  create(cubeRecord: CubeRecord): Observable<CubeRecord> {
    return this.http.put(this.endpoint, cubeRecord).pipe(map(d => new CubeRecord(d)));
  }
}
