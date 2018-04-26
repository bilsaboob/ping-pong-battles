import { Directive, Renderer, ElementRef} from '@angular/core';

@Directive({
  selector: '[autofocus]' // Attribute selector
})
export class Autofocus {

  constructor(private renderer:Renderer,
              private elementRef:ElementRef) {
  }

  ngAfterViewInit() {
    // we need to delay our call in order to work with ionic ...
    setTimeout(() => {
      const element = this.elementRef.nativeElement.querySelector('input');
      this.renderer.invokeElementMethod(element, 'focus', []);
    }, 50);
  }
}
