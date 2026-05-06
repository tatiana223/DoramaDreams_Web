export default function App() {
  return (
    <main className="min-h-screen bg-violet-50 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
          DoramaDreams
        </p>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
          Найди дораму под своё настроение
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Каталог дорам с избранным, отзывами, рейтингами, историей просмотра и
          персональными рекомендациями.
        </p>

        <div className="mt-8 flex gap-3">
          <button className="rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700">
            Смотреть каталог
          </button>

          <button className="rounded-2xl border border-violet-200 bg-white px-6 py-3 font-semibold text-violet-700 hover:bg-violet-50">
            Войти
          </button>
        </div>
      </section>
    </main>
  );
}