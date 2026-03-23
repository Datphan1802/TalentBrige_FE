import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, AuthResponse, Role } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      api.post<ApiResponse<AuthResponse>>("/api/v1/auth/register", {
        username, email, password, role,
        ...(role === "CANDIDATE" ? { fullName } : {}),
        ...(role === "EMPLOYER" ? { companyName } : {}),
      }),
    onSuccess: (res) => {
      const d = res.data.data;
      login(d.token, d.userId, d.role, d.username);
      if (d.role === "EMPLOYER") navigate("/employer/jobs");
      else navigate("/jobs");
    },
  });

  return (
    <PageTransition>
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md shadow-soft-lg border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>Join TalentBridge and start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} required placeholder="johndoe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>I'm looking to</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CANDIDATE">Find a job</SelectItem>
                    <SelectItem value="EMPLOYER">Hire talent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role === "CANDIDATE" && (
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" />
                </div>
              )}
              {role === "EMPLOYER" && (
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="Acme Inc." />
                </div>
              )}
              {mutation.isError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    {(mutation.error as any)?.response?.data?.message || "Registration failed"}
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full font-semibold shadow-soft" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
