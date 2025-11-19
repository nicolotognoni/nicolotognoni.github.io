import { profile } from '../data/content';

const AboutWindow = () => {
  return (
    <div className="space-y-4 p-4 text-[11px] leading-5 text-slate-900">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{profile.name}</h2>
        <p className="text-[11px] text-slate-500">{profile.title}</p>
        <p className="mt-1.5 text-[11px] text-slate-500">{profile.location}</p>
      </div>

      <p className="leading-relaxed text-slate-700">{profile.mission}</p>

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Highlights
        </h3>
        <ul className="mt-2 space-y-1.5 text-[11px] text-slate-700">
          {profile.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-aqua-400" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AboutWindow;

