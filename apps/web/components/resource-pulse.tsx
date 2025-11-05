const resources = [
  { name: "Пул A100", utilization: 0.72, eta: "3м", status: "Здоровый" },
  { name: "Пул T4", utilization: 0.58, eta: "0м", status: "Неактивен" },
  { name: "CPU Batch", utilization: 0.91, eta: "5м", status: "Ограничен" }
];

const statusTone: Record<string, string> = {
  Здоровый: "text-neon-green",
  Неактивен: "text-text-secondary/60",
  Ограничен: "text-[rgba(255,59,241,0.9)]"
};

export function ResourcePulse() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neon-green">Пульс ресурсов</h2>
          <p className="text-sm text-text-secondary">Готовность GPU и вычислений, согласованная с предстоящими экспериментами.</p>
        </div>
        <span className="text-xs uppercase tracking-wide text-text-secondary/60">В реальном времени</span>
      </header>
      <table className="mt-6 w-full text-left text-sm text-text-secondary">
        <thead className="text-xs uppercase tracking-wide text-text-secondary/60">
          <tr>
            <th className="pb-2 font-medium">Пул</th>
            <th className="pb-2 font-medium">Использование</th>
            <th className="pb-2 font-medium">ETA очереди</th>
            <th className="pb-2 font-medium">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {resources.map((resource) => (
            <tr key={resource.name} className="hover:bg-surface-hover/50">
              <td className="py-2 text-text-primary">{resource.name}</td>
              <td className="py-2">{Math.round(resource.utilization * 100)}%</td>
              <td className="py-2">{resource.eta}</td>
              <td className={`py-2 font-medium ${statusTone[resource.status] ?? "text-text-secondary/60"}`}>
                {resource.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
