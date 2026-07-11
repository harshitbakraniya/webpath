import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChartArea,
  CreditCard,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { getWorkspaceSlug } from "../../lib/workspace";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { cn } from "../../lib/utils";

const navTabs = [
  { id: "sites", label: "Sites", icon: LayoutDashboard },
  // { id: "settings", label: "General Settings", icon: Globe },
  { id: "team", label: "Team", icon: Users },
  { id: "usage", label: "Usage", icon: ChartArea },
  { id: "billing", label: "Billing", icon: CreditCard },
  // { id: "profile", label: "Profile", icon: User },
];

export function SiteTabsBar() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const workspace = searchParams.get("workspace");
  const activeTab = searchParams.get("tab") ?? "sites";

  useEffect(() => {
    if (!user) return;
    const slug = getWorkspaceSlug(user);
    const next = new URLSearchParams(searchParams);

    if (workspace !== slug) {
      next.set("workspace", slug);
    }

    if (!searchParams.get("tab")) {
      next.set("tab", "sites");
    }

    next.delete("site");

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [user, workspace, searchParams, setSearchParams]);

  const openTab = (tabId: string) => {
    if (!user) return;
    setSearchParams({ workspace: getWorkspaceSlug(user), tab: tabId });
  };

  if (!user) return null;

  return (
    <aside className="flex w-64 shrink-0 flex-col p-1">
      <WorkspaceSwitcher />

      <nav className="flex-1 space-y-0.5 overflow-y-auto py-4">
        {navTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => openTab(id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-[var(--palette-reversed-grey)] text-[var(--palette-bright-grey)] dark:bg-[var(--palette-bright-grey)] dark:text-[var(--palette-reversed-grey)]"
                : "text-[var(--e-text-muted)] hover:bg-[var(--e-hover)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
