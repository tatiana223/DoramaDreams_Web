import { Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { DoramaDetailsPage } from "@/pages/DoramaDetailsPage";
import { WatchPage } from "@/pages/WatchPage";
import { RequireAuth } from "@/components/app/RequireAuth";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/catalog" element={<RequireAuth><CatalogPage /></RequireAuth>} />
      <Route path="/doramas/:id" element={<RequireAuth><DoramaDetailsPage /></RequireAuth>} />
      <Route path="/bookmarks" element={<RequireAuth><BookmarksPage /></RequireAuth>} />
      <Route path="/doramas/:id/watch" element={<RequireAuth><WatchPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
