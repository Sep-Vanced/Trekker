import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@components/DashboardLayout";
import RequireAuth from "@components/RequireAuth";
import Login from "@pages/Login";
import LiveMapPage from "@pages/LiveMap";
import OverviewDashboard from "@pages/Dashboard";
import TouristManagement from "@pages/TouristManagement";
import EmergencyDashboard from "@pages/EmergencyDashboard";
import WeatherDashboard from "@pages/WeatherDashboard";
import AccessControlDashboard from "@pages/AccessControlDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardLayout>
                <OverviewDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/map"
          element={
            <RequireAuth>
              <DashboardLayout>
                <LiveMapPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/tourists"
          element={
            <RequireAuth>
              <DashboardLayout>
                <TouristManagement />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/emergency"
          element={
            <RequireAuth>
              <DashboardLayout>
                <EmergencyDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/weather"
          element={
            <RequireAuth>
              <DashboardLayout>
                <WeatherDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/vehicles"
          element={
            <RequireAuth>
              <DashboardLayout>
                <AccessControlDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;