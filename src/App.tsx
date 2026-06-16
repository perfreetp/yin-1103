import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { CaseList } from "@/pages/CaseList";
import { CaseDetail } from "@/pages/CaseDetail";
import { TeachingPlan } from "@/pages/TeachingPlan";
import { FollowUp } from "@/pages/FollowUp";
import { Annotations } from "@/pages/Annotations";
import { Assessment } from "@/pages/Assessment";
import { ArchivePage } from "@/pages/Archive";
import { useAuthStore } from "@/store/useAuthStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <CaseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute>
              <CaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teaching-plan"
          element={
            <ProtectedRoute>
              <TeachingPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teaching-plan/:taskId"
          element={
            <ProtectedRoute>
              <CaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow-up"
          element={
            <ProtectedRoute>
              <FollowUp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/annotations"
          element={
            <ProtectedRoute>
              <Annotations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <ArchivePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
