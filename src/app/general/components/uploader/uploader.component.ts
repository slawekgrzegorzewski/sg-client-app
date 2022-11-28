import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';


@Component({
  selector: 'sg-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent {
  @Input() uploadFunction: ((file: File) => Observable<HttpEvent<Object>>) | null = null;
  @Output() uploadFinished: EventEmitter<string> = new EventEmitter<string>();
  @Output() uploadCancelled: EventEmitter<string> = new EventEmitter<string>();

  fileName: string = '';

  uploadProgress: number = 0;
  uploadSub: Subscription | null = null;

  selected(fileSelectEvent: Event) {
    if (!this.uploadFunction) {
      return;
    }
    const target = fileSelectEvent.target as HTMLInputElement;
    const file: File | null = target.files ? target.files[0] : null;
    if (file) {
      this.fileName = file.name;
      this.uploadSub = this.uploadFunction(file).subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event instanceof HttpResponse) {
          this.uploadFinished.emit('');
          this.reset();
        }
      });
    }
  }

  cancelUpload() {
    this.uploadSub?.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = 0;
    this.uploadSub = null;
    this.fileName = '';
  }
}
