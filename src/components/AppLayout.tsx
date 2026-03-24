import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Briefcase, User, Shield, FolderOpen, Users, Search, Menu, X, Home, CalendarIcon, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = isAuthenticated
    ? role === "CANDIDATE"
       ? [
           { to: "/jobs", icon: Search, label: "Browse Jobs" },
           { to: "/my-applications", icon: FolderOpen, label: "My Applications" },
           { to: "/chat", icon: MessageSquare, label: "Messages" },
           { to: "/candidate/profile", icon: User, label: "Profile" },
           { to: "/notifications", icon: Bell, label: "Notifications" },
         ]
      : role === "EMPLOYER"
       ? [
           { to: "/employer/jobs", icon: Briefcase, label: "My Jobs" },
           { to: "/employer/applications", icon: FolderOpen, label: "Applications" },
           { to: "/employer/interviews", icon: CalendarIcon, label: "Interviews" },
           { to: "/chat", icon: MessageSquare, label: "Messages" },
           { to: "/employer/profile", icon: User, label: "Profile" },
           { to: "/notifications", icon: Bell, label: "Notifications" },
         ]
      : role === "ADMIN"
      ? [
          { to: "/admin/jobs", icon: Shield, label: "Pending Jobs" },
          { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
          { to: "/admin/users", icon: Users, label: "Users" },
          { to: "/notifications", icon: Bell, label: "Notifications" },
        ]
      : []
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">TalentBridge</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-accent-foreground">{username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-medium shadow-soft">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for authenticated users */}
        {isAuthenticated && navItems.length > 0 && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] border-r border-border bg-card/50 p-4 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive(item.to)
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-16 left-0 z-50 w-64 h-[calc(100vh-4rem)] border-r border-border bg-card p-4 lg:hidden shadow-soft-lg"
                  >
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <button
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive(item.to)
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </button>
                        </Link>
                      ))}
                    </nav>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto px-4 py-6 max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
