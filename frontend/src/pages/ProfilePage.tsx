import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { clearAuthData, getCurrentUser, isAuthenticated } from "@/api/authStorage";

export function ProfilePage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  function handleLogout() {
    clearAuthData();
    navigate("/");
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="text-sm font-semibold text-violet-700">
          ← На главную
        </Link>

        <div className="mt-8 rounded-3xl border border-violet-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-500">
                профиль
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                {user.username}
              </h1>

              <p className="mt-2 text-slate-500">{user.email}</p>

              <div className="mt-5 inline-flex rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                Роль: {user.role}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ProfileBlock title="Избранное" text="Скоро здесь будут любимые дорамы." />
          <ProfileBlock title="История" text="Скоро здесь будет история просмотра." />
          <ProfileBlock title="Рекомендации" text="Скоро здесь будут личные рекомендации." />
        </div>
      </div>
    </div>
  );
}

function ProfileBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}