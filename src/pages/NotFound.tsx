import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-primary">404</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
          <a href="/">
            <Button className="shadow-soft">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </a>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
