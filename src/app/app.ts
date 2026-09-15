import { Component, signal } from '@angular/core';
import { Cube } from './cube/cube';
import { RouterModule } from '@angular/router';
import { Textures } from "./textures/textures";
import { Lights } from './lights/lights';
import { Galaxy } from './galaxy/galaxy';
import { ScrollAnimation } from "./scroll-animation/scroll-animation";
import { PhysicsWorld } from './physics-world/physics-world';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Cube, Textures, Lights, Galaxy, ScrollAnimation, PhysicsWorld],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('01');
}
