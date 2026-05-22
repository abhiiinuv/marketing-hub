export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-3xl font-normal tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      )}
    </header>
  );
}
