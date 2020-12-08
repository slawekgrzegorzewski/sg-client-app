import {Pipe, PipeTransform} from '@angular/core';
import {SettingsService} from '../services/accountant/settings.service';

@Pipe({
  name: 'htmlNewLine',
  pure: false
})
export class HtmlNewLinePipe implements PipeTransform {

  constructor(private settingsService: SettingsService) {
  }

  transform(value: string): string {
    return value.replace(/(\n)/g, '<br>');
  }

}
