export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-600">{description}</p>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
        This section will be implemented next (WordPress-style {title.toLowerCase()} management).
      </div>
    </div>
  );
}
