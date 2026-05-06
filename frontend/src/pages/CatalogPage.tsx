import { Link } from "react-router";

export function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#faf8ff] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="text-sm font-semibold text-violet-700">
          ← На главную
        </Link>

        <h1 className="mt-8 text-4xl font-black tracking-tight">
          Каталог дорам
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Здесь позже появится список дорам из backend через запрос
          <span className="font-semibold text-violet-700"> /api/doramas</span>.
        </p>
      </div>
    </div>
  );
}