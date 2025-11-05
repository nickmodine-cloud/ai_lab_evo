const stats = [
  { label: "Гипотезы портфеля", value: 42, change: "+6 в этом месяце" },
  { label: "Ср. длительность этапа", value: "11.3д", change: "-1.2д от цели" },
  { label: "Покрытие ROI", value: "78%", change: "13 в продакшене" }
];

export function PortfolioHighlights() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neon-green">Пульс портфеля</h2>
          <p className="text-sm text-text-secondary">Высокоуровневые сигналы, связанные с результатами гипотез.</p>
        </div>
        <span className="text-xs uppercase tracking-wide text-text-secondary/60">Живая телеметрия</span>
      </header>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-surface-muted/70 p-4">
            <dt className="text-xs uppercase tracking-wide text-text-secondary/60">{item.label}</dt>
            <dd className="mt-3 text-2xl font-semibold text-text-primary">{item.value}</dd>
            <p className="mt-2 text-xs text-neon-turquoise">{item.change}</p>
          </div>
        ))}
      </dl>
    </div>
  );
}
