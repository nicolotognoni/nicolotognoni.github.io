import { contactChannels } from '../data/content';

const ContactWindow = () => {
  return (
    <div className="space-y-4 p-4 text-[11px] leading-5 text-slate-900">
      <header>
        <h2 className="text-sm font-semibold">Let's work together</h2>
        <p className="text-[11px] text-slate-500">
          I'm open to analytics, backend engineering, and data-driven collaborations.
        </p>
      </header>

      <ul className="space-y-2.5">
        {contactChannels.map((channel) => (
          <li key={channel.label}>
            <a
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-[11px] text-slate-700 shadow-sm transition hover:border-aqua-300 hover:text-aqua-600"
            >
              <span className="font-medium text-slate-600">{channel.label}</span>
              <span>{channel.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactWindow;

