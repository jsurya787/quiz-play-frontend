import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  imports: [RouterLink]
})
export class HeroComponent {}
