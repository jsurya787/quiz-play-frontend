import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subjects.html',
})
export class SubjectsComponent {
  subjects = [
    {
      name: 'Mathematics',
      class: 'Class 10 & 12',
      image: 'assets/math.png',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Physics',
      class: 'Class 11 & 12',
      image: 'assets/physics.png',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Chemistry',
      class: 'Class 11 & 12',
      image: 'assets/chemistry.png',
      color: 'from-emerald-500 to-green-600'
    }
  ];
}
