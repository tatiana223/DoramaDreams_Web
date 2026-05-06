import { Link } from "react-router";

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#faf8ff] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="text-sm font-semibold text-violet-700">
          ← На главную
        </Link>

        <h1 className="mt-8 text-4xl font-black tracking-tight">
          Мой профиль
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Здесь позже будут данные авторизованного пользователя через
          <span className="font-semibold text-violet-700"> /api/users/my</span>.
        </p>
      </div>
    </div>
  );
}