import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exams.html',
})
export class ExamsComponent {
  exams = [
    { name: 'JEE Main', desc: 'Engineering Entrance', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'NEET', desc: 'Medical Entrance', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'CBSE 12', desc: 'Board Exams', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'CBSE 10', desc: 'Board Exams', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { name: 'ICSE 10', desc: 'Board Exams', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { name: 'CUET', desc: 'University Entrance', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  ];
}
