import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import * as authApi from "../../api/auth";
import { useAuth } from "../../context/auth-context";
import { buildDashboardUrl } from "../../lib/workspace";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  if (!user) return null;

  const dashboardUrl = buildDashboardUrl(user);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--e-border)] webpath-surface-glass px-6">
      <div className="container mx-auto flex items-center h-14 justify-between ">
        <div className="flex items-center gap-10">
          <Link
            to={dashboardUrl}
            className="text-lg font-semibold text-[var(--e-text)]"
          >
            WebPath
          </Link>
          <ul className="hidden items-center gap-4 md:flex">
            <li>
              <Link
                to={dashboardUrl}
                className="text-sm font-medium text-[var(--e-text-muted)] hover:text-[var(--e-text)]"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" className="h-8 w-10 border-[var(--e-border)] bg-[var(--e-surface)] p-0 hover:bg-[var(--e-hover)]">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex h-8 items-center gap-2 border-none bg-transparent px-2 shadow-none hover:bg-[var(--e-hover)]"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={buildDashboardUrl(user, { tab: "profile" })} className="flex cursor-pointer items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={buildDashboardUrl(user, { tab: "settings" })} className="flex cursor-pointer items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
