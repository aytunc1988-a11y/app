import BerufDetail from "./pages/BerufDetail";
import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "@/lib/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import AppLayout from "@/components/AppLayout";
import AuthCallback from "@/components/AuthCallback";
import { RequireAuth, RequireLicense } from "@/components/RequireAuth";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as ShadToaster } from "@/components/ui/toaster";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Faecher from "@/pages/Faecher";
import Berufe from "@/pages/Berufe";
import QuizSetup from "@/pages/QuizSetup";
import Flashcards from "./pages/Flashcards";
import QuizRun from "@/pages/QuizRun";
import ExamsList from "@/pages/ExamsList";
import ExamCreate from "@/pages/ExamCreate";
import ExamRun from "@/pages/ExamRun";
import MeineFragen from "@/pages/MeineFragen";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import Anzeigen from "@/pages/Anzeigen";
import AnzeigeCreate from "@/pages/AnzeigeCreate";
import AnzeigeDetail from "@/pages/AnzeigeDetail";
import AlleProfile from "@/pages/AlleProfile";
import LeuteDetail from "@/pages/LeuteDetail";
import Chat from "@/pages/Chat";
import Admin from "@/pages/Admin";
import PageNotFound from "@/pages/PageNotFound";

function AppRouter() {
  const location = useLocation();
  // Process Emergent OAuth return BEFORE any auth check (prevents race conditions).
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
          <Route path="/beruf/:id" element={<BerufDetail />} />

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/anzeigen" element={<Anzeigen />} />
          <Route path="/anzeigen/neu" element={<AnzeigeCreate />} />
          <Route path="/anzeigen/:id" element={<AnzeigeDetail />} />
          <Route path="/anzeigen/:id/bearbeiten" element={<AnzeigeCreate />} />
          <Route path="/leute" element={<AlleProfile />} />
          <Route path="/leute/:id" element={<LeuteDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route element={<RequireLicense />}>
            <Route path="/faecher" element={<Faecher />} />
            <Route path="/berufe" element={<Berufe />} />
            <Route path="/quiz/:subject" element={<QuizSetup />} />
            <Route path="/quiz/:subject/start" element={<QuizRun />} />
            <Route path="/quiz/:subject/karten" element={<Flashcards />} />
            <Route path="/pruefungen" element={<ExamsList />} />
            <Route path="/pruefung/neu" element={<ExamCreate />} />
            <Route path="/pruefung/:examId" element={<ExamRun />} />
            <Route path="/meine-fragen" element={<MeineFragen />} />
            <Route path="/statistik" element={<Stats />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRouter />
          <Toaster position="top-center" />
          <ShadToaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
