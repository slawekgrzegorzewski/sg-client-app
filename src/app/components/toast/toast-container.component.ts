import {Component, Input, TemplateRef} from '@angular/core';
import {ToastService} from "../../services/toast/toast-service";


@Component({
  selector: 'app-toasts',
  templateUrl: './toast-container.component.html',
  host: {'[class.ngb-toasts]': 'true'},
  styleUrls: ['./toast-container.component.css']
})
export class ToastsContainer {

  constructor(public toastService: ToastService) {
  }

  isTemplate(toast) {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
