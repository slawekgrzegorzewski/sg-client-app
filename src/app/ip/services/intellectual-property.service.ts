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
import {Apollo, QueryRef} from 'apollo-angular';
import {
  AddIpr, AssignCategoryToTimeRecord,
  AssignmentAction,
  CreateTask,
  CreateTimeRecord,
  CreateTimeRecordCategory,
  DeleteIpr,
  DeleteTask,
  DeleteTimeRecord,
  DeleteTimeRecordCategory,
  GetAllDomainIntellectualProperties,
  GetAllDomainNonIpTimeRecords,
  GetAllDomainTimeRecordCategories, IntellectualPropertiesRecordsResponse,
  UpdateIpr,
  UpdateTask,
  UpdateTimeRecord,
  UpdateTimeRecordCategory
} from '../../../../types';
import {DatesUtils} from '../../general/utils/dates-utils';
import {DatePipe} from '@angular/common';
import {TimeRecordCategory} from '../model/time-record-category';

@Injectable({
  providedIn: 'root'
})
export class IntellectualPropertyService extends Refreshable {

  readonly TASK_URL = `${environment.serviceUrl}/task`;

  private domainIntellectualPropertiesQueryRef: QueryRef<{
    intellectualPropertiesRecords: IntellectualPropertiesRecordsResponse
  }> | null = null;
  private nonIPTimeRecordsQueryRef: QueryRef<{ nonIPTimeRecords: TimeRecord[] }> | null = null;
  private domainTimeRecordCategoriesQueryRef: QueryRef<{ allTimeRecordCategories: TimeRecordCategory[] }> | null = null;

  constructor(
    private apollo: Apollo,
    private loginService: LoginService,
    private domainService: DomainService,
    private http: HttpClient,
    private datePipe: DatePipe,
    eventBus: NgEventBus) {
    super(eventBus);
  }

  getIntellectualPropertiesForDomain(): Observable<IntellectualProperty[]> {
    this.domainIntellectualPropertiesQueryRef = this.apollo
      .watchQuery<{ intellectualPropertiesRecords: IntellectualPropertiesRecordsResponse }>({
        query: GetAllDomainIntellectualProperties
      });
    return this.domainIntellectualPropertiesQueryRef.valueChanges
      .pipe(
        map(result => result.data?.intellectualPropertiesRecords?.reports?.map(ip => new IntellectualProperty(ip)))
      );
  }

  createIntellectualProperty(description: string): Observable<IntellectualProperty> {
    return this.apollo
      .mutate<{ addIPR: IntellectualProperty }>({
        mutation: AddIpr,
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
        mutation: UpdateIpr,
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
        mutation: DeleteIpr,
        variables: {
          intellectualPropertyId: id
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshData())
      );
  }

  createTask(intellectualPropertyId: number, createData: {
    coAuthors: string,
    description: string
  }): Observable<string> {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: CreateTask,
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
        mutation: UpdateTask,
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
        mutation: DeleteTask,
        variables: {
          taskId: taskId
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshData())
      );
  }

  getTimeRecordsNotAssignedToTask() {
    this.nonIPTimeRecordsQueryRef = this.apollo
      .watchQuery<{ nonIPTimeRecords: TimeRecord[] }>({
        query: GetAllDomainNonIpTimeRecords
      });
    return this.nonIPTimeRecordsQueryRef.valueChanges
      .pipe(
        map(result => result.data && result.data.nonIPTimeRecords && result.data.nonIPTimeRecords.map(tr => new TimeRecord(tr)))
      );
  }

  createTimeRecord(taskId: number | null, timeRecordData: { date: Date; description: string; numberOfHours: Decimal }) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: CreateTimeRecord,
        variables: {
          taskId: taskId,
          date: DatesUtils.getDateString(timeRecordData.date, this.datePipe),
          numberOfHours: timeRecordData.numberOfHours,
          description: timeRecordData.description,
          assignmentAction: taskId ? AssignmentAction.Assign : AssignmentAction.Nop
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => taskId ? this.refreshData() : this.refreshNonIPTimeRecords())
      );
  }

  updateTimeRecord(timeRecordId: number, timeRecordData: { date: Date; description: string; numberOfHours: Decimal }) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: UpdateTimeRecord,
        variables: {
          timeRecordId: timeRecordId,
          taskId: null,
          date: DatesUtils.getDateString(timeRecordData.date, this.datePipe),
          numberOfHours: timeRecordData.numberOfHours,
          description: timeRecordData.description,
          assignmentAction: AssignmentAction.Nop
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => {
          this.refreshData();
          this.refreshNonIPTimeRecords();
        })
      );
  }

  updateTimeRecordWithTask(taskId: number | null, timeRecordId: number, timeRecordData: {
    date: Date;
    description: string;
    numberOfHours: Decimal
  }) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: UpdateTimeRecord,
        variables: {
          timeRecordId: timeRecordId,
          taskId: taskId,
          date: DatesUtils.getDateString(timeRecordData.date, this.datePipe),
          numberOfHours: timeRecordData.numberOfHours,
          description: timeRecordData.description,
          assignmentAction: taskId ? AssignmentAction.Assign : AssignmentAction.Unassign
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => {
          this.refreshData();
          this.refreshNonIPTimeRecords();
        })
      );
  }

  assignTimeRecordToCategory(timeRecordId: number, timeRecordCategoryId: number | null) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: AssignCategoryToTimeRecord,
        variables: {
          timeRecordId: timeRecordId,
          timeRecordCategoryId: timeRecordCategoryId
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => {
          this.refreshNonIPTimeRecords();
        })
      );
  }

  deleteTimeRecord(timeRecordId: number) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: DeleteTimeRecord,
        variables: {
          timeRecordId: timeRecordId
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => {
          this.refreshData();
          this.refreshNonIPTimeRecords();
        })
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


  getTimeRecordCategoryForDomain(): Observable<TimeRecordCategory[]> {
    this.domainTimeRecordCategoriesQueryRef = this.apollo
      .watchQuery<{ allTimeRecordCategories: TimeRecordCategory[] }>({
        query: GetAllDomainTimeRecordCategories
      });
    return this.domainTimeRecordCategoriesQueryRef.valueChanges
      .pipe(
        map(result =>
          result.data && result.data.allTimeRecordCategories
          && result.data.allTimeRecordCategories.map(trc => new TimeRecordCategory(trc)))
      );
  }

  createTimeRecordCategory(name: string) {
    return this.apollo
      .mutate<{ result: TimeRecordCategory }>({
        mutation: CreateTimeRecordCategory,
        variables: {
          name: name
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => this.refreshTimeRecordCategories())
      );
  }

  updateTimeRecordCategory(timeRecordId: number, name: string) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: UpdateTimeRecordCategory,
        variables: {
          timeRecordId: timeRecordId,
          name: name
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => {
          this.refreshNonIPTimeRecords();
          this.refreshTimeRecordCategories();
        })
      );
  }

  deleteTimeRecordCategory(timeRecordId: number) {
    return this.apollo
      .mutate<{ result: string }>({
        mutation: DeleteTimeRecordCategory,
        variables: {
          timeRecordId: timeRecordId
        },
      }).pipe(
        map(data => data!.data!.result),
        tap(data => {
          this.refreshTimeRecordCategories();
        })
      );
  }

  public refreshData(): void {
    this.domainIntellectualPropertiesQueryRef?.refetch();
  }

  public refreshNonIPTimeRecords() {
    this.nonIPTimeRecordsQueryRef?.refetch();
  }

  public refreshTimeRecordCategories() {
    this.domainTimeRecordCategoriesQueryRef?.refetch();
  }
}
