import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [Navbar],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {
  constructor(private viewportScroller: ViewportScroller) {}

  scrollToSection() {
    this.viewportScroller.scrollToAnchor('mas');
  }

  scrollToTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

}
