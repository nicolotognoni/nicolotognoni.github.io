import { skillGroups } from '../data/content';

const SkillsWindow = () => {
  return (
    <div className="h-full overflow-y-auto p-4 text-[11px] leading-5 text-slate-900">
      <header className="mb-4">
        <h2 className="text-sm font-semibold">Skills &amp; Tools</h2>
        <p className="text-[11px] text-slate-500">
          Technical toolkit for backend development, data analytics, and machine learning.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <section
            key={group.label}
            className="rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur-sm"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </h3>
            <ul className="mt-2 space-y-1.5 text-[11px] text-slate-700">
              {group.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SkillsWindow;

