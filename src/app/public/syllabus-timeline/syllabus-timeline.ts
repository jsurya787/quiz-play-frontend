import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-syllabus-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './syllabus-timeline.html',
  styleUrls: ['./syllabus-timeline.css']
})
export class SyllabusTimelineComponent {
  syllabus = [
    { 
      title: 'Foundation Building',
      subtitle: 'Class 10 - Term 1',
      desc: 'Master the core concepts of Algebra, Geometry, and Science fundamentals to build a rock-solid base.',
      icon: '📐',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50'
    },
    { 
      title: 'Advanced Concepts',
      subtitle: 'Class 11 - Core Streams',
      desc: 'Dive deep into specialized subjects like Physics ("Laws of Motion") and Organic Chemistry basics.',
      icon: '⚛️',
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50'
    },
    { 
      title: 'Board Exam Prep',
      subtitle: 'Class 12 - Final Year',
      desc: 'Intensive practice on complex topics like Calculus, Electrostatics, and Genetics with previous year questions.',
      icon: '🧬',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50'
    },
    { 
      title: 'Competitive Edge',
      subtitle: 'Entrance Exams (JEE/NEET)',
      desc: 'Speed and accuracy training. Mock tests simulated to match real exam conditions for maximum scoring.',
      icon: '🏆',
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50'
    },
  ];
}
