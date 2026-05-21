import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import { isAdmin, isInstructor } from "./services/auth.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserLayout from "./components/layout/UserLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import CoordinatorLayout from "./components/layout/CoordinatorLayout.jsx";

import AdminPanel from "./pages/admin/AdminPanel.jsx";
import AdminUniversitiesPage from "./pages/admin/UniversitiesPage.jsx";
import FacultiesPage from "./pages/admin/FacultiesPage.jsx";
import DepartmentsPage from "./pages/admin/DepartmentsPage.jsx";
import TermsPage from "./pages/admin/TermsPage.jsx";
import LessonsPage from "./pages/admin/LessonsPage.jsx";
import TermLessonsPage from "./pages/admin/TermLessonsPage.jsx";
import StudentAssignmentsPage from "./pages/admin/StudentAssignmentsPage.jsx";
import UsersPage from "./pages/admin/UsersPage.jsx";
import CoordinatorPanel from "./pages/coordinator/CoordinatorPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { isAdmin, isCoordinator } from "./services/auth.js";
import UploadReport from "./pages/Upload_Report";
import Lessons from "./pages/Lessons";
import InstructorHome from "./pages/instructor/InstructorHome.jsx";
import MyTermLessonsPage from "./pages/instructor/MyTermLessonsPage.jsx";
import InstructorLessonDetailPage from "./pages/instructor/InstructorLessonDetailPage.jsx";
import NotGirisi from "./pages/coordinator/NotGirisi.jsx";
import GroupProjectPage from "./components/group-project/GroupProjectPage.jsx";
import StudentLessonsPage from "./pages/student/StudentLessonsPage.jsx";
import StudentLessonDetailPage from "./pages/student/StudentLessonDetailPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute role={isAdmin}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route path="universities" element={<AdminUniversitiesPage />} />
          <Route path="faculties" element={<FacultiesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="term-lessons" element={<TermLessonsPage />} />
          <Route path="student-assignments" element={<StudentAssignmentsPage />} />
          <Route path="settings" element={<AdminPanel />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        <Route
          path="instructor"
          element={
            <ProtectedRoute role={isInstructor}>
              <CoordinatorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorHome />} />
          <Route path="groups" element={<CoordinatorPanel />} />
          <Route path="lessons" element={<MyTermLessonsPage />} />
          <Route path="lessons/:id" element={<InstructorLessonDetailPage />} />
          <Route path="grades" element={<NotGirisi />} />
          <Route path="group-projects" element={<GroupProjectPage />} />
          <Route path="reports" element={<CoordinatorPanel />} />
        </Route>

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lessons" element={<StudentLessonsPage />} />
          <Route path="lessons/:id" element={<StudentLessonDetailPage />} />
          <Route path="groups" element={<Groups />} />
            <Route path="upload-report" element={<UploadReport />} />
          <Route path="group-projects" element={<GroupProjectPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
