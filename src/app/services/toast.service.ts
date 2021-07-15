import {Injectable, TemplateRef} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}): void {
    this.toasts.push({textOrTpl, ...options});
  }

  showWarning(textOrTpl: string | TemplateRef<any>, header?: string): void {
    this.toasts.push({textOrTpl: textOrTpl, header: header, classname: 'bg-danger text-light', delay: 15000});
  }
}
