"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-store";
import { pb } from "@/lib/pocketbase";

const navItems = [
  { href: "/t/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/t/classes", label: "Classes", icon: GraduationCap },
  { href: "/t/settings", label: "Settings", icon: Settings },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refresh, isTeacher } = useAuth();

  useEffect(() => {
    refresh();
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }
    if (!isTeacher()) {
      router.push("/dashboard");
    }
  }, [refresh, router, isTeacher]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/t/dashboard" className="text-lg font-bold tracking-tight">
              ExamPrep
            </Link>
            <span className="rounded-md bg-foreground px-2 py-0.5 text-xs font-medium text-background">
              Teacher
            </span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
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
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
