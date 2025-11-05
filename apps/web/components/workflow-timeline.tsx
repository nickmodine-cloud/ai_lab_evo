const timeline = [
  {
    title: "Черновик рабочего процесса этапов",
    description: "Куратор опубликовал v1.3 с автоматизированными проверками готовности",
    status: "Опубликовано"
  },
  {
    title: "Утверждения переходов этапов",
    description: "Эскалация совета по рискам сработала для гипотезы HYP-024",
    status: "Угроза SLA"
  },
  {
    title: "Синхронизация эксперимента",
    description: "Эксперимент EXP-112 автоматически связан после перехода этапа",
    status: "Синхронизировано"
  }
];

const statusColor: Record<string, string> = {
  Опубликовано: "text-neon-green",
  "Угроза SLA": "text-[rgba(255,59,241,0.9)]",
  Синхронизировано: "text-neon-turquoise"
};

export function WorkflowTimeline() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neon-green">Активность процессов</h2>
          <p className="text-sm text-text-secondary">Оркестрация на основе BPMN, привязанная к гипотезам.</p>
        </div>
        <span className="text-xs uppercase tracking-wide text-text-secondary/60">Конструктор → Экземпляры</span>
      </header>
      <ol className="mt-6 space-y-4">
        {timeline.map((item) => (
          <li key={item.title} className="relative rounded-xl border border-border/60 bg-surface-muted/70 p-4">
            <span className={`absolute left-4 top-4 h-2 w-2 rounded-full ${statusColor[item.status] ?? "bg-text-secondary/60"}`} />
            <div className="pl-6">
              <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
              <p className={`mt-2 text-xs font-medium uppercase tracking-wide ${statusColor[item.status] ?? "text-text-secondary/60"}`}>
                {item.status}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
