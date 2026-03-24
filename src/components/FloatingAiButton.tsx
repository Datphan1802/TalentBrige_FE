import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const FloatingAiButton = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || role === "ADMIN" || location.pathname === "/ai-assistant") return null;

  return (
    <motion.button
      onClick={() => navigate("/ai-assistant")}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      aria-label="AI Career Assistant"
    >
      <Sparkles className="w-6 h-6" />
    </motion.button>
  );
};

export default FloatingAiButton;
