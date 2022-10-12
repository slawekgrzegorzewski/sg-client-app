import {Pipe, PipeTransform} from '@angular/core';
import {SettingsService} from '../../accountant/services/settings.service';

@Pipe({
  name: 'htmlNewLine',
  pure: false
})
export class HtmlNewLinePipe implements PipeTransform {

  constructor() {
  }

  transform(value: string): string {
    return value.replace(/(\n)/g, '<br>');
  }

}
