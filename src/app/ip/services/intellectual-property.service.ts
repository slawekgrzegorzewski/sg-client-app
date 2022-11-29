import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';
import {map, share} from 'rxjs/operators';
import {Refreshable} from '../../general/services/refreshable';
import {IntellectualProperty} from '../model/intellectual-property';
import {LoginService} from '../../general/services/login.service';
import {DomainService} from '../../general/services/domain.service';

@Injectable({
  providedIn: 'root'
})
export class IntellectualPropertyService extends Refreshable {

  readonly IPR_URL = `${environment.serviceUrl}/ipr`;
  readonly TASK_URL = `${environment.serviceUrl}/task`;
  readonly TIME_RECORD_URL = `${environment.serviceUrl}/time-record`;

  private domainIntellectualProperties: Observable<IntellectualProperty[]> | null = null;

  constructor(
    private loginService: LoginService,
    private domainService: DomainService,
    private http: HttpClient,
    eventBus: NgEventBus) {
    super(eventBus);
  }

  getIntellectualPropertiesForDomain(): Observable<IntellectualProperty[]> {
    if (!this.domainIntellectualProperties) {
      this.domainIntellectualProperties = this.http.get<IntellectualProperty[]>(this.IPR_URL).pipe(
        share(),
        map(data => data.map(ip => new IntellectualProperty(ip)))
      );
    }
    return this.domainIntellectualProperties;
  }

  createIntellectualProperty(description: string): Observable<IntellectualProperty> {
    const intellectualPropertyObservable: Observable<IntellectualProperty> = this.http.put<IntellectualProperty>(this.IPR_URL, {description: description}).pipe(
      map(data => new IntellectualProperty(data))
    );
    this.domainIntellectualProperties = null;
    return intellectualPropertyObservable;
  }

  updateIntellectualProperty(id: number, description: string): Observable<string> {
    const observable: Observable<string> = this.http.patch<string>(`${this.IPR_URL}/${id}`, {description: description});
    this.domainIntellectualProperties = null;
    return observable;
  }

  deleteIntellectualProperty(id: number): Observable<string> {
    const observable: Observable<string> = this.http.delete<string>(`${this.IPR_URL}/${id}`);
    this.domainIntellectualProperties = null;
    return observable;
  }

  createTask(intellectualPropertyId: number, createData: { coAuthors: string, description: string }): Observable<string> {
    const observable: Observable<string> = this.http.post<string>(`${this.IPR_URL}/${intellectualPropertyId}`, createData);
    this.domainIntellectualProperties = null;
    return observable;
  }

  updateTask(taskId: number, taskData: { coAuthors: string; description: string }) {
    const observable: Observable<string> = this.http.patch<string>(`${this.TASK_URL}/${taskId}`, taskData);
    this.domainIntellectualProperties = null;
    return observable;
  }

  deleteTask(taskId: number) {
    const observable: Observable<string> = this.http.delete<string>(`${this.TASK_URL}/${taskId}`);
    this.domainIntellectualProperties = null;
    return observable;
  }

  createTimeRecord(taskId: number, timeRecordData: { date: Date; description: string; numberOfHours: string }) {
    const observable: Observable<string> = this.http.put<string>(`${this.TIME_RECORD_URL}`, {
      ...timeRecordData,
      assignmentAction: 'ASSIGN',
      taskId: taskId
    });
    this.domainIntellectualProperties = null;
    return observable;
  }

  updateTimeRecord(timeRecordId: number, timeRecordData: { date: Date; description: string; numberOfHours: string }) {
    const observable: Observable<string> = this.http.patch<string>(`${this.TIME_RECORD_URL}/${timeRecordId}`, {
      ...timeRecordData,
      assignmentAction: 'NOP',
      taskId: null
    });
    this.domainIntellectualProperties = null;
    return observable;
  }

  deleteTimeRecord(timeRecordId: number) {
    const observable: Observable<string> = this.http.delete<string>(`${this.TIME_RECORD_URL}/${timeRecordId}`);
    this.domainIntellectualProperties = null;
    return observable;
  }

  linkForAttachmentDownload(taskId: number, fileName: string): string {
    return `${this.TASK_URL}/${taskId}/attachment/${encodeURIComponent(fileName)}?authorization=${encodeURIComponent(this.loginService.getToken()!)}&domainId=${this.domainService.currentDomainId}`;
  }

  uploadAttachment(taskId: number, file: File): Observable<HttpEvent<Object>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    var observable = this.http.post(`${this.TASK_URL}/${taskId}/attachment`, formData, {
      reportProgress: true,
      observe: 'events'
    });
    this.refreshData();
    return observable;
  }

  deleteAttachment(taskId: number, fileName: string): Observable<string> {
    const observable = this.http.delete<string>(`${this.TASK_URL}/${taskId}/attachment/${encodeURIComponent(fileName)}`);
    this.refreshData();
    return observable;
  }

  protected refreshData(): void {
    this.domainIntellectualProperties = null;
  }
}
