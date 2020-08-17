import {Component, Input, OnInit} from "@angular/core";


export class Button<T> {
  name: string;
  action: (t: T) => void
}

@Component({
  selector: 'hoverable-buttons',
  templateUrl: './hoverable-buttons.component.html',
  styleUrls: ['./hoverable-buttons.component.css']
})
export class HoverableButtonsComponent<T> implements OnInit {

  constructor() {
  }

  @Input() data: T[];
  @Input() converter: (T) => string;
  @Input() buttons: Button<T>[];
  mouseOver: T;

  ngOnInit() {
  }

  mouseIsOver(element: T) {
    return this.mouseOver === element;
  }
}
