interface ModulePageProps {
  title: string;
  description: string;
  callouts: Array<{ title: string; detail: string }>;
}

export function ModulePage({ title, description, callouts }: ModulePageProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="neon-card">
        <h1 className="text-2xl font-semibold text-neon-green">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {callouts.map((callout) => (
          <div key={callout.title} className="neon-card">
            <h2 className="text-base font-semibold text-slate-200">{callout.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{callout.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
