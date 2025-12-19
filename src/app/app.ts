import { Component } from '@angular/core';
import { StudentForm } from './features/estudiantes/components/student-form/student-form';

@Component({
  selector: 'app-root',
  imports: [StudentForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
