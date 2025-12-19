import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})

export class AdminDashboard {

  subjects: any[] = [
    {
      id: 'sub_math',
      name: 'Mathematics',
      chapterCount: 3,
      sectionCount: 7,
      chapters: [
        {
          id: 'ch_algebra',
          title: 'Algebra',
          sections: [
            { id: 'sec_linear', title: 'Linear Equations' },
            { id: 'sec_quadratic', title: 'Quadratic Equations' },
            { id: 'sec_polynomial', title: 'Polynomials' },
          ],
        },
        {
          id: 'ch_geometry',
          title: 'Geometry',
          sections: [
            { id: 'sec_lines', title: 'Lines & Angles' },
            { id: 'sec_triangles', title: 'Triangles' },
          ],
        },
        {
          id: 'ch_probability',
          title: 'Probability',
          sections: [
            { id: 'sec_basics', title: 'Basics of Probability' },
            { id: 'sec_events', title: 'Events & Outcomes' },
          ],
        },
      ],
    },

    {
      id: 'sub_physics',
      name: 'Physics',
      chapterCount: 2,
      sectionCount: 5,
      chapters: [
        {
          id: 'ch_mechanics',
          title: 'Mechanics',
          sections: [
            { id: 'sec_motion', title: 'Motion in One Dimension' },
            { id: 'sec_laws', title: 'Laws of Motion' },
            { id: 'sec_work', title: 'Work, Power & Energy' },
          ],
        },
        {
          id: 'ch_thermo',
          title: 'Thermodynamics',
          sections: [
            { id: 'sec_heat', title: 'Heat & Temperature' },
            { id: 'sec_laws_thermo', title: 'Laws of Thermodynamics' },
          ],
        },
      ],
    },

    {
      id: 'sub_chem',
      name: 'Chemistry',
      chapterCount: 1,
      sectionCount: 3,
      chapters: [
        {
          id: 'ch_atomic',
          title: 'Atomic Structure',
          sections: [
            { id: 'sec_atoms', title: 'Atoms & Molecules' },
            { id: 'sec_models', title: 'Atomic Models' },
            { id: 'sec_quantum', title: 'Quantum Numbers' },
          ],
        },
      ],
    },
  ];

}