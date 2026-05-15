// welcome.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  currentTime = new Date();
  currentHours!: number;
  currentMinutes!: number;
  currentSeconds!: number;
  am_pm!: string;

  constructor() { }

  ngOnInit(): void {
    setInterval(() => {
      this.currentTime = new Date();
      this.currentHours = this.currentTime.getHours();
      this.currentMinutes = this.currentTime.getMinutes();
      this.currentSeconds = this.currentTime.getSeconds();
      this.am_pm = this.currentHours >= 12 ? "p.m" : "a.m";
      this.currentHours = this.currentHours % 12;
      this.currentHours = this.currentHours ? this.currentHours : 12;
    }, 1000);
  }
}


