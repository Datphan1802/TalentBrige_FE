import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Shield, ArrowRight, Search, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-8 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Briefcase className="w-10 h-10 text-primary" />
        </motion.div>

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Connect talent with
            <span className="text-primary"> opportunity</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Find your next role or hire the best candidates on the modern recruitment platform built for teams.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register">
              <Button size="lg" className="font-semibold shadow-soft group px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            {role === "CANDIDATE" && (
              <Link to="/jobs">
                <Button size="lg" className="font-semibold shadow-soft group">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Jobs
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
            {role === "EMPLOYER" && (
              <Link to="/employer/jobs">
                <Button size="lg" className="font-semibold shadow-soft group">
                  <Building2 className="w-4 h-4 mr-2" />
                  My Jobs
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
            {role === "ADMIN" && (
              <Link to="/admin/jobs">
                <Button size="lg" className="font-semibold shadow-soft group">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Feature cards */}
        {!isAuthenticated && (
          <div className="grid sm:grid-cols-3 gap-4 pt-8 max-w-3xl w-full">
            {[
              { icon: Search, title: "Smart Search", desc: "Find jobs matching your skills and experience" },
              { icon: Building2, title: "Top Companies", desc: "Connect with leading employers worldwide" },
              { icon: Sparkles, title: "Quick Apply", desc: "One-click applications with your profile" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Index;
