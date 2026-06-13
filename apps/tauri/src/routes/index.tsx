import { AdminRoute } from "@/components/auth/AdminRoute";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PresentationWindow } from "@/routes/presentation/PresentationWindow";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/routes/admin/AdminDashboard";
import { ExpenseApprovalsScreen } from "@/routes/admin/ExpenseApprovalsScreen";
import { GovernanceScreen } from "@/routes/admin/GovernanceScreen";
import { MemberManagementScreen } from "@/routes/admin/MemberManagementScreen";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TitheApprovalsScreen } from "@/routes/admin/TitheApprovalsScreen";
import { DevotionalsScreen } from "@/routes/member/DevotionalsScreen";
import { DirectoryScreen } from "@/routes/member/DirectoryScreen";
import { DownloadsScreen } from "@/routes/downloads/DownloadsScreen";
import { EBDClassScreen } from "@/routes/member/EBDClassScreen";
import { EBDScreen } from "@/routes/member/EBDScreen";
import { ExpensesScreen } from "@/routes/member/ExpensesScreen";
import { EventDetailScreen } from "@/routes/member/EventDetailScreen";
import { EventsScreen } from "@/routes/member/EventsScreen";
import { ForgotPasswordScreen } from "@/routes/auth/ForgotPasswordScreen";
import { LoginScreen } from "@/routes/auth/LoginScreen";
import { MemberDashboard } from "@/routes/member/MemberDashboard";
import { MemberDetailScreen } from "@/routes/member/MemberDetailScreen";
import { MissionDetailScreen } from "@/routes/member/MissionDetailScreen";
import { MissionsScreen } from "@/routes/member/MissionsScreen";
import { NewPrayerScreen } from "@/routes/member/NewPrayerScreen";
import { PrayerDetailScreen } from "@/routes/member/PrayerDetailScreen";
import { PrayerScreen } from "@/routes/member/PrayerScreen";
import { ProfileScreen } from "@/routes/member/ProfileScreen";
import { RegisterScreen } from "@/routes/auth/RegisterScreen";
import { ResetPasswordScreen } from "@/routes/auth/ResetPasswordScreen";
import { NewExpenseScreen } from "@/routes/member/NewExpenseScreen";
import { NewTitheScreen } from "@/routes/member/NewTitheScreen";
import { BibleChapterScreen } from "@/routes/public/BibleChapterScreen";
import { BibleScreen } from "@/routes/public/BibleScreen";
import { HomeScreen } from "@/routes/public/HomeScreen";
import { TithesScreen } from "@/routes/member/TithesScreen";
import { HymnScreen } from "@/routes/public/HymnScreen";
import { HymnalScreen } from "@/routes/public/HymnalScreen";
import { ManualArticleScreen } from "@/routes/public/ManualArticleScreen";
import { ManualScreen } from "@/routes/public/ManualScreen";

export const router = createBrowserRouter([
  {
    path: "/presentation",
    element: <PresentationWindow />,
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "biblia", element: <BibleScreen /> },
      { path: "biblia/:version/:book/:chapter", element: <BibleChapterScreen /> },
      { path: "hinario", element: <HymnalScreen /> },
      { path: "hinario/:number", element: <HymnScreen /> },
      { path: "manual", element: <ManualScreen /> },
      { path: "manual/:articleId", element: <ManualArticleScreen /> },
      { path: "downloads", element: <DownloadsScreen /> },
      { path: "auth/login", element: <LoginScreen /> },
      { path: "auth/register", element: <RegisterScreen /> },
      { path: "auth/forgot-password", element: <ForgotPasswordScreen /> },
      { path: "auth/reset-password", element: <ResetPasswordScreen /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "member", element: <MemberDashboard /> },
          { path: "member/profile", element: <ProfileScreen /> },
          { path: "member/directory", element: <DirectoryScreen /> },
          { path: "member/directory/:memberId", element: <MemberDetailScreen /> },
          { path: "member/devotionals", element: <DevotionalsScreen /> },
          { path: "member/events", element: <EventsScreen /> },
          { path: "member/events/:eventId", element: <EventDetailScreen /> },
          { path: "member/missions", element: <MissionsScreen /> },
          { path: "member/missions/:missionId", element: <MissionDetailScreen /> },
          { path: "member/prayer", element: <PrayerScreen /> },
          { path: "member/prayer/new", element: <NewPrayerScreen /> },
          { path: "member/prayer/:prayerId", element: <PrayerDetailScreen /> },
          { path: "member/tithes", element: <TithesScreen /> },
          { path: "member/tithes/new", element: <NewTitheScreen /> },
          { path: "member/expenses", element: <ExpensesScreen /> },
          { path: "member/expenses/new", element: <NewExpenseScreen /> },
          { path: "member/ebd", element: <EBDScreen /> },
          { path: "member/ebd/:classId", element: <EBDClassScreen /> },
          {
            element: <AdminRoute />,
            children: [
              { path: "admin", element: <AdminDashboard /> },
              { path: "admin/members", element: <MemberManagementScreen /> },
              { path: "admin/tithes", element: <TitheApprovalsScreen /> },
              { path: "admin/expenses", element: <ExpenseApprovalsScreen /> },
              { path: "admin/governance", element: <GovernanceScreen /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
