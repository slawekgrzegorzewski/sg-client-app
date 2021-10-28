import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {CubeRecord, CubeRecordDTO} from '../../model/cubes/cube-record';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CubeRecordsService {

  private readonly endpoint = `${environment.serviceUrl}/cube-record`;

  constructor(private http: HttpClient) {
  }

  currentDomainRecords(): Observable<CubeRecord[]> {
    return this.http.get<CubeRecordDTO[]>(this.endpoint)
      .pipe(map((data: CubeRecordDTO[]) => (data.map(d => new CubeRecord(d)))));
  }

  create(cubeRecord: CubeRecord): Observable<CubeRecord> {
    return this.http.put(this.endpoint, cubeRecord).pipe(map(d => new CubeRecord(d)));
  }
}
