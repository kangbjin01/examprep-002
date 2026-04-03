"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  BarChart3,
  Library,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-store";
import { useStats } from "@/lib/stats-store";
import { fetchAllQuestions } from "@/lib/questions";
import { pb } from "@/lib/pocketbase";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: BookOpen },
  { href: "/mock-exam", label: "Mock Exam", icon: Clock },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/question-bank", label: "Question Bank", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refresh } = useAuth();

  const { loadFromPB } = useStats();

  useEffect(() => {
    refresh();
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }
    // Load data from PocketBase
    loadFromPB();
    fetchAllQuestions();
  }, [refresh, router, loadFromPB]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            ExamPrep
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.name || user?.email}
            </span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </nav>

        {/* Mobile bottom nav */}
        <nav className="flex border-t border-border md:hidden">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
