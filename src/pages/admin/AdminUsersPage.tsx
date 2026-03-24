import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, UserResponse, PageResponse } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Shield, CheckCircle, XCircle, Edit, Mail, Calendar, MapPin, Briefcase, Eye } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    active: true,
    role: "CANDIDATE"
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => {
      console.log("Fetching admin users...");
      return api.get<ApiResponse<UserResponse[]>>("/api/v1/admin/users")
        .then(r => {
          console.log("Admin users response:", r.data);
          return r.data.data;
        })
        .catch(err => {
          console.error("Error fetching admin users:", err);
          throw err;
        });
    },
  });

  const activate = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/admin/users/${id}/activate`),
    onSuccess: () => { 
      toast.success("User activated"); 
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditDialogOpen(false);
    },
  });

  const deactivate = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/admin/users/${id}/deactivate`),
    onSuccess: () => { 
      toast.success("User deactivated"); 
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditDialogOpen(false);
    },
  });

  const openEditDialog = (user: UserResponse) => {
    setSelectedUser(user);
    setEditForm({
      active: user.active,
      role: user.role
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedUser) return;
    
    if (editForm.active !== selectedUser.active) {
      if (editForm.active) {
        activate.mutate(selectedUser.id);
      } else {
        deactivate.mutate(selectedUser.id);
      }
    } else {
      toast.info("No changes made");
      setEditDialogOpen(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage platform users and their access</p>
        </div>

        {isLoading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

        {error && (
          <div className="text-center py-10">
            <p className="text-destructive font-medium">Error loading users</p>
            <p className="text-sm text-muted-foreground mt-1">Please check the console for details</p>
          </div>
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <EmptyState icon={<Users className="w-8 h-8 text-primary" />} title="No users found" />
        )}

        <div className="space-y-3">
          {data?.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: i * 0.02 }}>
              <Card className="hover:shadow-soft transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {user.username?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{user.username}</h3>
                          <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          <Badge variant={user.active ? "secondary" : "destructive"} className="gap-1 text-xs">
                            {user.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {user.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.fullName && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{user.fullName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(user)}
                        className="gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Edit User Status Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedUser && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {selectedUser.username?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{selectedUser.username}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <Select value={editForm.active.toString()} onValueChange={(value) => setEditForm(prev => ({ ...prev, active: value === 'true' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="false">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CANDIDATE">Candidate</SelectItem>
                        <SelectItem value="EMPLOYER">Employer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpdateStatus}
                  disabled={activate.isPending || deactivate.isPending}
                  className="flex-1"
                >
                  {activate.isPending || deactivate.isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AdminUsersPage;
