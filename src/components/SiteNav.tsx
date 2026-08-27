import type { Route } from "../lib/useHashRoute";

const LINKS: { route: Route; href: string; label: string }[] = [
  { route: "home", href: "#/", label: "เครื่องคำนวณ" },
  { route: "math-logic", href: "#/math-logic", label: "หลักการทางคณิตศาสตร์" },
  { route: "dev-story", href: "#/dev-story", label: "เบื้องหลังการพัฒนา" },
  { route: "log-decoder", href: "#/log-decoder", label: "Log-Decoder: ถอดรหัสลอการิทึม" },
];

interface SiteNavProps {
  active: Route;
}

export function SiteNav({ active }: SiteNavProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const isActive = link.route === active;
        return (
          <a
            key={link.route}
            href={link.href}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-transparent text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
