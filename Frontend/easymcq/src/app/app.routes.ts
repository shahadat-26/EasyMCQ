import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { TeacherDashboardComponent } from './components/teacher/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student/student-dashboard.component';
import { TakeExamComponent } from './components/student/take-exam.component';
import { ExamResultComponent } from './components/student/exam-result.component';
import { ExamResultsComponent } from './components/teacher/exam-results/exam-results.component';
import { CourseStatisticsComponent } from './components/teacher/course-statistics/course-statistics.component';
import { MyResultsComponent } from './components/student/my-results/my-results.component';
import { authGuard } from './guards/auth.guard';
import { teacherGuard, studentGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'teacher',
    children: [
      {
        path: 'dashboard',
        component: TeacherDashboardComponent,
        canActivate: [teacherGuard]
      },
      {
        path: 'exam-results/:examId',
        component: ExamResultsComponent,
        canActivate: [teacherGuard]
      },
      {
        path: 'course-statistics/:courseId',
        component: CourseStatisticsComponent,
        canActivate: [teacherGuard]
      }
    ]
  },
  {
    path: 'student',
    children: [
      {
        path: 'dashboard',
        component: StudentDashboardComponent,
        canActivate: [studentGuard]
      },
      {
        path: 'my-results/:courseId',
        component: MyResultsComponent,
        canActivate: [studentGuard]
      }
    ]
  },
  {
    path: 'exam/:id',
    component: TakeExamComponent,
    canActivate: [studentGuard]
  },
  {
    path: 'exam-result/:id',
    component: ExamResultComponent,
    canActivate: [studentGuard]
  },
  { path: '**', redirectTo: '/login' }
];
