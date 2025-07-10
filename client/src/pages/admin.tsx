import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  FileText, 
  Users, 
  Mail, 
  Eye, 
  Edit2, 
  Trash2,
  Settings,
  BarChart3
} from "lucide-react";
import type { PostWithAuthor, ContactSubmission } from "@shared/schema";
import PostEditor from "@/components/blog/post-editor";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [user, toast]);

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/admin"],
    enabled: !!user?.isAdmin,
  });

  const { data: contactSubmissions, isLoading: contactLoading } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact-submissions"],
    enabled: !!user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user?.isAdmin,
  });

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPosts = posts?.length || 0;
  const publishedPosts = posts?.filter(p => p.isPublished).length || 0;
  const draftPosts = totalPosts - publishedPosts;
  const unreadMessages = contactSubmissions?.filter(c => !c.isRead).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your blog posts, users, and site settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Posts</p>
                  <p className="text-2xl font-bold text-foreground">{totalPosts}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Published</p>
                  <p className="text-2xl font-bold text-foreground">{publishedPosts}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Drafts</p>
                  <p className="text-2xl font-bold text-foreground">{draftPosts}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Edit2 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground">{unreadMessages}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Posts Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Posts</span>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setEditingPost(null);
                    setIsPostEditorOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts?.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={post.isPublished ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.views} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingPost(post);
                            setIsPostEditorOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {posts?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No posts yet. Create your first post!
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {contactLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {contactSubmissions?.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">
                          {submission.firstName} {submission.lastName}
                        </h3>
                        {!submission.isRead && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {submission.subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(submission.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {contactSubmissions?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No messages yet.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>New Post</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {
                    // Show users management section
                    document.getElementById('users-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span>Manage Users</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management Section */}
        <div className="mt-8" id="users-section">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {users?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.isAdmin ? "default" : "secondary"} className="text-xs">
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              await fetch(`/api/users/${user.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isAdmin: !user.isAdmin }),
                              });
                              window.location.reload(); // Simple refresh for now
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to update user",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              await fetch(`/api/users/${user.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isActive: !user.isActive }),
                              });
                              window.location.reload(); // Simple refresh for now
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to update user",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {users?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No users found.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Post Editor Dialog */}
        <PostEditor
          isOpen={isPostEditorOpen}
          onClose={() => {
            setIsPostEditorOpen(false);
            setEditingPost(null);
          }}
          editingPost={editingPost}
        />
      </div>
    </div>
  );
}
