export class Button<T> {
  name: string;
  action: (t: T) => void;
  show: (t: T) => boolean;

  constructor(b: Partial<Button<T>>) {
    if (!b) {
      b = {};
    }
    this.name = b.name || '';
    this.action = b.action || ((t: T) => {})
    this.show = b.show || ((t: T) => true)
  }
}
