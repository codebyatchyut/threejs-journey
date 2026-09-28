import { Component } from '@angular/core';
import { HauntedHouse } from './haunted-house/haunted-house';

@Component({
  selector: 'app-root',
  imports: [HauntedHouse],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
