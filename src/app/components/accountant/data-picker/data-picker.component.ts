import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDate, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Component, forwardRef, Input} from '@angular/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DataPickerComponent), multi: true}
  ]
})
export class DataPickerComponent implements ControlValueAccessor {

  @Input() id: string;

  private dataInternal: NgbDateStruct;

  get data(): NgbDateStruct {
    return this.dataInternal;
  }

  set data(value: NgbDateStruct) {
    this.dataInternal = value;
    const dateValue = this.convertToDate(this.dataInternal);
    this.propagateChange(dateValue);
    this.propagateTouched(dateValue);
  }

  propagateChange: (_: Date) => void;
  propagateTouched: (_: Date) => void;

  registerOnChange(fn: (_: Date) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: Date) => void): void {
    this.propagateTouched = fn;
  }

  writeValue(obj: Date): void {
    if (!obj) {
      return null;
    }
    this.dataInternal = new NgbDate(
      obj.getFullYear(),
      obj.getMonth() + 1,
      obj.getDate());
  }

  private convertToDate(date: NgbDateStruct): Date {
    const result = new Date();
    result.setFullYear(date.year);
    result.setMonth(date.month - 1);
    result.setDate(date.day);
    return result;
  }

}
