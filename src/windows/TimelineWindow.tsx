import { timeline } from '../data/content';

const TimelineWindow = () => {
  return (
    <div className="h-full overflow-y-auto p-4 text-[11px] leading-5 text-slate-900">
      <header className="mb-4">
        <h2 className="text-sm font-semibold">Career &amp; Education Timeline</h2>
        <p className="text-[11px] text-slate-500">
          Key roles and academic milestones across analytics, backend engineering, and business.
        </p>
      </header>

      <ol className="relative ml-3 border-l border-slate-200 pl-5">
        {timeline.map((entry) => (
          <li key={entry.title} className="mb-6 last:mb-0">
            <span className="absolute -left-2.5 mt-1 h-2 w-2 rounded-full border border-white bg-aqua-500" />
            <div className="flex flex-col gap-1.5">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">
                  {entry.title}
                </h3>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  {entry.period}
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {entry.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default TimelineWindow;

