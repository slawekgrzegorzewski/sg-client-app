import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';
import {map, tap} from 'rxjs/operators';
import {Refreshable} from '../../general/services/refreshable';
import {IntellectualProperty} from '../model/intellectual-property';
import {LoginService} from '../../general/services/login.service';
import {DomainService} from '../../general/services/domain.service';
import {TimeRecord} from '../model/time-record';
import Decimal from 'decimal.js';
import {Apollo, gql, QueryRef} from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class IntellectualPropertyService extends Refreshable {

  readonly TASK_URL = `${environment.serviceUrl}/task`;
  readonly TIME_RECORD_URL = `${environment.serviceUrl}/time-record`;
  readonly INTELLECTUAL_PROPERTY = `{
    id
    description
    tasks {
      id
      taskCategory {
        id
        name
      }
      attachments
      coAuthors
      description
      timeRecords {
        id
        date
        numberOfHours
        description
        domain {
          id
          name
        }
      }
    }
    domain {
      id
      name
    }
  }`;

  readonly GET_ALL_IPRS = gql`
  {
    allIPRs ${this.INTELLECTUAL_PROPERTY}
  }
  `;

  readonly CREATE_IPR = gql`
  mutation AddIPR($description: String!) {
    addIPR(input: {description: $description}) ${this.INTELLECTUAL_PROPERTY}
  }`;

  readonly UPDATE_IPR = gql`
  mutation UpdateIPR($intellectualPropertyId: Int!, $description: String!) {
    updateIPR(intellectualPropertyId: $intellectualPropertyId, input: {description: $description})${this.INTELLECTUAL_PROPERTY}
  }`;

  readonly DELETE_IPR = gql`
  mutation DeleteIPR($intellectualPropertyId: Int!) {
    deleteIPR(intellectualPropertyId: $intellectualPropertyId)
  }`;

  readonly CREATE_TASK = gql`
  mutation CreateTask($intellectualPropertyId: Int!, $coAuthors: String!, $description: String!) {
    createTask(intellectualPropertyId: $intellectualPropertyId, taskData: { coAuthors: $coAuthors, description: $description } )
  }`;

  readonly UPDATE_TASK = gql`
  mutation UpdateTask($taskId: Int!, $coAuthors: String!, $description: String!) {
    updateTask(taskId: $taskId, taskData: { coAuthors: $coAuthors, description: $description } )
  }`;

  readonly DELETE_TASK = gql`
  mutation DeleteTask($taskId: Int!) {
    deleteTask(taskId: $taskId)
  }`;

  private domainIntellectualPropertiesQueryRef: QueryRef<{ allIPRs: IntellectualProperty[] }> | null = null;

  constructor(
    private apollo: Apollo,
    private loginService: LoginService,
    private domainService: DomainService,
    private http: HttpClient,
    eventBus: NgEventBus) {
    super(eventBus);
  }

  getIntellectualPropertiesForDomain(): Observable<IntellectualProperty[]> {
    this.domainIntellectualPropertiesQueryRef = this.apollo
      .watchQuery<{ allIPRs: IntellectualProperty[] }>({
        query: this.GET_ALL_IPRS
      });
    return this.domainIntellectualPropertiesQueryRef.valueChanges
      .pipe(
        map(result => result.data && result.data.allIPRs && result.data.allIPRs.map(ip => new IntellectualProperty(ip)))
      );
  }

  createIntellectualProperty(description: string): Observable<IntellectualProperty> {
    return this.apollo
      .mutate<{ addIPR: IntellectualProperty }>({
        mutation: this.CREATE_IPR,
        variables: {
          description: description
        },
      }).pipe(
        map(data => new IntellectualProperty(data!.data!.addIPR)),
        tap(data => this.refreshData())
      );
  }

  updateIntellectualProperty(id: number, description: string): Observable<IntellectualProperty> {
    return this.apollo
      .mutate<{ addIPR: IntellectualProperty }>({
        mutation: this.UPDATE_IPR,
        variables: {
          intellectualPropertyId: id,
          description: description
        },
      }).pipe(
        map(data => new IntellectualProperty(data!.data!.addIPR)),
        tap(data => this.refreshData())
      );
  }

  deleteIntellectualProperty(id: number): Observable<string> {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: this.DELETE_IPR,
        variables: {
          intellectualPropertyId: id
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshData())
      );
  }

  createTask(intellectualPropertyId: number, createData: { coAuthors: string, description: string }): Observable<string> {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: this.CREATE_TASK,
        variables: {
          intellectualPropertyId: intellectualPropertyId,
          coAuthors: createData.coAuthors,
          description: createData.description
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshData())
      );
  }

  updateTask(taskId: number, taskData: { coAuthors: string; description: string }) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: this.UPDATE_TASK,
        variables: {
          taskId: taskId,
          coAuthors: taskData.coAuthors,
          description: taskData.description
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshData())
      );
  }

  deleteTask(taskId: number) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: this.DELETE_TASK,
        variables: {
          taskId: taskId
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshData())
      );
  }

  getTimeRecordsNotAssignedToTask() {
    return this.http.get<TimeRecord[]>(`${this.TIME_RECORD_URL}`).pipe(
      map(timeRecords => timeRecords.map(timeRecord => new TimeRecord(timeRecord)))
    );
  }

  createTimeRecord(taskId: number | null, timeRecordData: { date: Date; description: string; numberOfHours: Decimal }) {
    return this.http.put<string>(`${this.TIME_RECORD_URL}`, {
      date: timeRecordData.date,
      description: timeRecordData.description,
      numberOfHours: timeRecordData.numberOfHours.toString(),
      assignmentAction: taskId ? 'ASSIGN' : 'NOP',
      taskId: taskId
    })
      .pipe(
        tap(data => this.refreshData())
      );
  }

  updateTimeRecord(timeRecordId: number, timeRecordData: { date: Date; description: string; numberOfHours: Decimal }) {
    return this.http.patch<string>(`${this.TIME_RECORD_URL}/${timeRecordId}`, {
      date: timeRecordData.date,
      description: timeRecordData.description,
      numberOfHours: timeRecordData.numberOfHours.toString(),
      assignmentAction: 'NOP',
      taskId: null
    })
      .pipe(
        tap(data => this.refreshData())
      );
  }

  updateTimeRecordWithTask(taskId: number | null, timeRecordId: number, timeRecordData: {
    date: Date;
    description: string;
    numberOfHours: Decimal
  }) {
    return this.http.patch<string>(`${this.TIME_RECORD_URL}/${timeRecordId}`, {
      date: timeRecordData.date,
      description: timeRecordData.description,
      numberOfHours: timeRecordData.numberOfHours.toString(),
      assignmentAction: taskId ? 'ASSIGN' : 'UNASSIGN',
      taskId: taskId
    })
      .pipe(
        tap(data => this.refreshData())
      );
  }

  deleteTimeRecord(timeRecordId: number) {
    return this.http.delete<string>(`${this.TIME_RECORD_URL}/${timeRecordId}`)
      .pipe(
        tap(data => this.refreshData())
      );
  }

  linkForAttachmentDownload(taskId: number, fileName: string): string {
    return `${this.TASK_URL}/${taskId}/attachment/${encodeURIComponent(fileName)}?authorization=${encodeURIComponent(this.loginService.getToken()!)}&domainId=${this.domainService.currentDomainId}`;
  }

  uploadAttachment(taskId: number, file: File): Observable<HttpEvent<Object>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    return this.http.post(`${this.TASK_URL}/${taskId}/attachment`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.refreshData();
        }
      })
    );
  }

  deleteAttachment(taskId: number, fileName: string): Observable<string> {
    return this.http.delete<string>(`${this.TASK_URL}/${taskId}/attachment/${encodeURIComponent(fileName)}`).pipe(
      tap(response => this.refreshData())
    );
  }

  public refreshData(): void {
    this.domainIntellectualPropertiesQueryRef?.refetch();
  }
}
