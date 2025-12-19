import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
  <section class="py-20 px-6 max-w-7xl mx-auto">

    <h1 class="text-4xl font-bold mb-10">
      Welcome back 👋
    </h1>

    <div class="grid md:grid-cols-3 gap-8">

      <div class="card">
        <h3>Math Quiz</h3>
        <button class="btn-primary mt-4">Start</button>
      </div>

      <div class="card">
        <h3>Physics Quiz</h3>
        <button class="btn-primary mt-4">Start</button>
      </div>

      <div class="card">
        <h3>Chemistry Quiz</h3>
        <button class="btn-primary mt-4">Start</button>
      </div>

    </div>
  </section>
  `
})
export class DashboardComponent {}
