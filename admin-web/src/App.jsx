import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import MealPlans from "./pages/MealPlans.jsx";
import Semesters from "./pages/Semesters.jsx";
import Students from "./pages/Students.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Payments from "./pages/Payments.jsx";
import MealClaims from "./pages/MealClaims.jsx";
import Reports from "./pages/Reports.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

/** Wrap a page inside the protected admin chrome (layout + route guard). */
const AdminPage = ({ title, breadcrumb, children }) => (
  <ProtectedRoute>
    <AdminLayout title={title} breadcrumb={breadcrumb}>
      {children}
    </AdminLayout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <AdminPage title="Overview" breadcrumb={["Overview"]}>
            <Dashboard />
          </AdminPage>
        }
      />
      <Route
        path="/meal-plans"
        element={
          <AdminPage title="Meal Plans" breadcrumb={["Meal Plans"]}>
            <MealPlans />
          </AdminPage>
        }
      />
      <Route
        path="/semesters"
        element={
          <AdminPage title="Semesters" breadcrumb={["Semesters"]}>
            <Semesters />
          </AdminPage>
        }
      />
      <Route
        path="/students"
        element={
          <AdminPage title="Students" breadcrumb={["Students"]}>
            <Students />
          </AdminPage>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <AdminPage title="Subscriptions" breadcrumb={["Subscriptions"]}>
            <Subscriptions />
          </AdminPage>
        }
      />
      <Route
        path="/payments"
        element={
          <AdminPage title="Payments" breadcrumb={["Payments"]}>
            <Payments />
          </AdminPage>
        }
      />
      <Route
        path="/meal-claims"
        element={
          <AdminPage title="Meal Claims" breadcrumb={["Meal Claims"]}>
            <MealClaims />
          </AdminPage>
        }
      />
      <Route
        path="/reports"
        element={
          <AdminPage title="Reports" breadcrumb={["Reports"]}>
            <Reports />
          </AdminPage>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
