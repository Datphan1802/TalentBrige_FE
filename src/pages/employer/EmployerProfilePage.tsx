import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, EmployerProfileResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Users } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const EmployerProfilePage = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["employer-profile"],
    queryFn: () => api.get<ApiResponse<EmployerProfileResponse>>("/api/v1/employers/profile").then(r => r.data.data),
  });

  const [form, setForm] = useState({
    companyName: "", website: "", description: "", industry: "", companySize: "", address: "",
  });

  const updateProfile = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      return api.put("/api/v1/employers/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("Profile updated"); setEditing(false); queryClient.invalidateQueries({ queryKey: ["employer-profile"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <PageTransition>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your company's public profile</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                if (profile) setForm({
                  companyName: profile.companyName || "", website: profile.website || "",
                  description: profile.description || "", industry: profile.industry || "",
                  companySize: profile.companySize || "", address: profile.address || "",
                });
                setEditing(true);
              }}>Edit</Button>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Company Name</Label><Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Company Size</Label><Input value={form.companySize} onChange={e => setForm(f => ({ ...f, companySize: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateProfile.isPending} className="shadow-soft">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Company</span><span className="font-medium">{profile?.companyName || "—"}</span></div>
                <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Email</span><span className="font-medium">{profile?.email || "—"}</span></div>
                <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Website</span><span className="font-medium">{profile?.website || "—"}</span></div>
                <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Industry</span><span className="font-medium">{profile?.industry || "—"}</span></div>
                <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Size</span><span className="font-medium">{profile?.companySize || "—"}</span></div>
                <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Address</span><span className="font-medium">{profile?.address || "—"}</span></div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="font-medium flex items-center gap-1"><Users className="w-3.5 h-3.5" />{profile?.followerCount || 0}</span>
                </div>
                <div className="pt-1.5"><span className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">Description</span><p className="mt-1 text-foreground leading-relaxed">{profile?.description || "—"}</p></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default EmployerProfilePage;
