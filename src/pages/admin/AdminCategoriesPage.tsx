import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, CategoryResponse, CategoryRequest } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CategoryRequest>({ name: "", description: "" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<ApiResponse<CategoryResponse[]>>("/api/v1/admin/categories").then(r => r.data.data),
  });

  const create = useMutation({
    mutationFn: (data: CategoryRequest) => api.post("/api/v1/admin/categories", data),
    onSuccess: () => { toast.success("Category created"); setOpen(false); setForm({ name: "", description: "" }); queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/admin/categories/${id}`),
    onSuccess: () => { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage job categories</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="shadow-soft font-medium"><Plus className="w-4 h-4 mr-1.5" />Add Category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <Button type="submit" disabled={create.isPending} className="w-full shadow-soft">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading && <p className="text-muted-foreground">Loading...</p>}

        {!isLoading && (!categories || categories.length === 0) && (
          <EmptyState icon={<FolderOpen className="w-8 h-8 text-primary" />} title="No categories" description="Create your first category to organize job posts." />
        )}

        <div className="space-y-2">
          {categories?.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
              <Card className="hover:shadow-soft transition-shadow duration-200">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(cat.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminCategoriesPage;
