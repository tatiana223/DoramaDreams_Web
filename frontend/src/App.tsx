import { Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { ActorsPage } from "@/pages/ActorsPage";
import { ActorDetailsPage } from "@/pages/ActorDetailsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminProfilePage } from "@/pages/AdminProfilePage";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { DoramaDetailsPage } from "@/pages/DoramaDetailsPage";
import { WatchPage } from "@/pages/WatchPage";
import { RequireAuth } from "@/components/app/RequireAuth";
import { RequireAdmin } from "@/components/app/RequireAdmin";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/actors" element={<ActorsPage />} />
      <Route path="/actors/:id" element={<ActorDetailsPage />} />
      <Route path="/doramas/:id" element={<DoramaDetailsPage />} />
      <Route path="/bookmarks" element={<RequireAuth><BookmarksPage /></RequireAuth>} />
      <Route path="/doramas/:id/watch" element={<RequireAuth><WatchPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><AdminProfilePage /></RequireAdmin>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
