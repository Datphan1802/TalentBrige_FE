import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Shield, ArrowRight, Search, Building2, Sparkles, TrendingUp, Clock, MapPin, Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <PageTransition>
      {/* Hero Section with Background */}
      <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
        {/* Background Pattern with WebP Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/UI_image_web_job.webp" 
            alt="Background"
            className="w-full h-full object-cover opacity-10"
            onError={(e) => {
              // Fallback to gradient patterns if image not found
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Fallback gradient patterns */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-16 pb-20">
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            
            {/* Hero Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-8"
            >
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-soft-lg border border-primary/10">
                <Briefcase className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            {/* Hero Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 max-w-4xl"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
                Find Your
                <span className="text-primary block">Dream Job</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                Connect with top companies and opportunities. Modern recruitment platform built for the future of work.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" className="font-semibold shadow-soft group px-8 py-3 text-lg">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="font-semibold px-8 py-3 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4">
                  {role === "CANDIDATE" && (
                    <Link to="/jobs">
                      <Button size="lg" className="font-semibold shadow-soft group px-8 py-3 text-lg">
                        <Search className="w-5 h-5 mr-2" />
                        Browse Jobs
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                  {role === "EMPLOYER" && (
                    <Link to="/employer/jobs">
                      <Button size="lg" className="font-semibold shadow-soft group px-8 py-3 text-lg">
                        <Building2 className="w-5 h-5 mr-2" />
                        My Jobs
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                  {role === "ADMIN" && (
                    <Link to="/admin/jobs">
                      <Button size="lg" className="font-semibold shadow-soft group px-8 py-3 text-lg">
                        <Shield className="w-5 h-5 mr-2" />
                        Admin Panel
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">TalentBridge?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make your job search and hiring process seamless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Search, 
                title: "Smart Job Matching", 
                desc: "AI-powered recommendations based on your skills and preferences",
                color: "from-blue-500/20 to-blue-500/5"
              },
              { 
                icon: Building2, 
                title: "Top Companies", 
                desc: "Connect with verified employers and industry leaders",
                color: "from-green-500/20 to-green-500/5"
              },
              { 
                icon: Clock, 
                title: "Quick Apply", 
                desc: "One-click applications with your professional profile",
                color: "from-purple-500/20 to-purple-500/5"
              },
              { 
                icon: MapPin, 
                title: "Remote & Local", 
                desc: "Find opportunities that match your location preferences",
                color: "from-orange-500/20 to-orange-500/5"
              },
              { 
                icon: TrendingUp, 
                title: "Career Growth", 
                desc: "Track your applications and interview progress",
                color: "from-pink-500/20 to-pink-500/5"
              },
              { 
                icon: Star, 
                title: "Verified Reviews", 
                desc: "Real reviews from employees and candidates",
                color: "from-yellow-500/20 to-yellow-500/5"
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="h-full p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Jobs" },
              { number: "5K+", label: "Companies" },
              { number: "50K+", label: "Candidates" },
              { number: "95%", label: "Success Rate" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-12 border border-primary/20">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join thousands of professionals who found their dream job through TalentBridge
              </p>
              {!isAuthenticated ? (
                <Link to="/register">
                  <Button size="lg" className="font-semibold shadow-soft group px-8 py-4 text-lg">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Link to={role === "CANDIDATE" ? "/jobs" : role === "EMPLOYER" ? "/employer/jobs" : "/admin/jobs"}>
                  <Button size="lg" className="font-semibold shadow-soft group px-8 py-4 text-lg">
                    Continue to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Index;
