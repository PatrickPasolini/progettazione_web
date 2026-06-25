import { Outlet, Navigate } from 'react-router-dom';

export function TeacherPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Outlet />
    </div>
  );
}

export function TeacherIndex() {
  return <Navigate to="/teacher/exams" replace />;
}

