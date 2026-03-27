import { Routes } from '@angular/router';
import { StudentForm } from './features/estudiantes/components/student-form/student-form';

export const routes: Routes = [
  { path: 'registro', component: StudentForm, data: { fase: 1 } },
  { path: 'ficha-socioeconomica', component: StudentForm, data: { fase: 2 } },
  { path: '', redirectTo: 'registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'registro' }
];
