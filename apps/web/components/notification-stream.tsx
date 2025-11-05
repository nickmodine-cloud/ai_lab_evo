const notifications = [
  {
    title: "Требуется утверждение перехода",
    detail: "Гипотеза HYP-027 нуждается в проверке управления",
    time: "2 мин назад"
  },
  {
    title: "Аналитическая инсайт",
    detail: "Этап приоритизации превышает SLA на 1.8 дня",
    time: "8 мин назад"
  },
  {
    title: "Предупреждение о ресурсах",
    detail: "Очередь GPU продвинула эксперимент EXP-110",
    time: "12 мин назад"
  }
];

export function NotificationStream() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neon-turquoise">Сигналы</h2>
          <p className="text-sm text-text-secondary">
            Единый канал для утверждений, инсайтов и событий инфраструктуры.
          </p>
        </div>
        <span className="text-xs uppercase tracking-wide text-text-secondary/60">
          Прослушивание топиков Kafka
        </span>
      </header>
      <ul className="mt-6 space-y-3">
        {notifications.map((item) => (
          <li
            key={item.title}
            className="flex items-start justify-between rounded-xl border border-border/60 bg-surface-muted/70 p-4"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.detail}</p>
            </div>
            <span className="text-xs text-text-secondary/60">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
