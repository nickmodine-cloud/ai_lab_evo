const stages = [
  {
    name: "Идеация",
    items: [
      { title: "Автоматизация сортировки тикетов клиентов", owner: "Cassie", score: 72 },
      { title: "RAG для чатбота по политикам", owner: "Leo", score: 68 }
    ]
  },
  {
    name: "Определение масштаба",
    items: [{ title: "Обнаружение дефектов зрения", owner: "Mila", score: 81 }]
  },
  {
    name: "Приоритизация",
    items: [{ title: "Предиктивный отток для B2B", owner: "Arjun", score: 77 }]
  },
  {
    name: "Экспериментирование",
    items: [{ title: "Прогноз спроса на розничном рынке", owner: "Mia", score: 84 }]
  }
];

export function HypothesisBoard() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neon-green">Поток гипотез</h2>
          <p className="text-sm text-text-secondary">Готовые к перетаскиванию колонки с метриками здоровья этапов.</p>
        </div>
        <span className="rounded-full border border-border/60 bg-surface-muted/70 px-3 py-1 text-xs text-text-secondary">
          4 активных этапа
        </span>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.name} className="rounded-xl border border-border/60 bg-surface-muted/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neon-green">{stage.name}</h3>
              <span className="text-xs text-text-secondary/60">{stage.items.length} элементов</span>
            </div>
            <ul className="mt-4 space-y-3">
              {stage.items.map((item) => (
                <li key={item.title} className="rounded-lg border border-border/60 bg-surface-hover/70 p-3">
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                    <span>Владелец: {item.owner}</span>
                    <span className="text-neon-turquoise">Оценка {item.score}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
