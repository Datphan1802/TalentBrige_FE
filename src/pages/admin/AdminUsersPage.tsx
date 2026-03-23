import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, UserResponse, PageResponse } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Shield, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => api.get<ApiResponse<PageResponse<UserResponse>>>("/api/v1/admin/users", { params: { page, size: 20 } }).then(r => r.data.data),
  });

  const activate = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/admin/users/${id}/activate`),
    onSuccess: () => { toast.success("User activated"); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  const deactivate = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/admin/users/${id}/deactivate`),
    onSuccess: () => { toast.success("User deactivated"); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage platform users and their access</p>
        </div>

        {isLoading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

        {!isLoading && data?.empty && (
          <EmptyState icon={<Users className="w-8 h-8 text-primary" />} title="No users found" />
        )}

        <div className="space-y-2">
          {data?.content?.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: i * 0.02 }}>
              <Card className="hover:shadow-soft transition-shadow duration-200">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user.username?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{user.role}</Badge>
                    <Badge variant={user.active ? "secondary" : "destructive"} className="gap-1 text-xs">
                      {user.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.active ? "Active" : "Inactive"}
                    </Badge>
                    {user.active ? (
                      <Button size="sm" variant="outline" onClick={() => deactivate.mutate(user.id)} className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 text-xs">
                        Deactivate
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => activate.mutate(user.id)} className="shadow-soft text-xs">
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {data && !data.empty && (
          <div className="flex items-center gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" disabled={data.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground font-medium">Page {data.number + 1} of {data.totalPages}</span>
            <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminUsersPage;
