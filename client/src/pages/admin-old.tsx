import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  FileText, 
  Users, 
  Mail, 
  Eye, 
  Edit2, 
  Trash2,
  BarChart3
} from "lucide-react";
import type { PostWithAuthor, ContactSubmission } from "@shared/schema";
import PostEditor from "@/components/blog/post-editor";
import UserManagement from "@/components/admin/user-management";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";

export default function Admin() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics'>('dashboard');

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/admin"],
    enabled: !!user?.isAdmin,
  });

  const { data: contactSubmissions, isLoading: contactLoading } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact-submissions"],
    enabled: !!user?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/admin"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleEditPost = (post: PostWithAuthor) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deleteMutation.mutate(postId);
    }
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditingPost(null);
    setIsEditorOpen(false);
  };

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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleNewPost}
              className="flex flex-col items-center justify-center h-24 space-y-2"
            >
              <Plus className="h-8 w-8" />
              <span>New Post</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('users')}
              className="flex flex-col items-center justify-center h-24 space-y-2"
            >
              <Users className="h-8 w-8" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('analytics')}
              className="flex flex-col items-center justify-center h-24 space-y-2"
            >
              <BarChart3 className="h-8 w-8" />
              <span>Analytics</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className="flex-1"
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className="flex-1"
            >
              Users
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className="flex-1"
            >
              Analytics
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Posts Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Posts</span>
                <Button size="sm" onClick={handleNewPost}>
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
                          onClick={() => handleEditPost(post)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive hover:text-red-800"
                          disabled={deleteMutation.isPending}
                        >
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
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>

      <PostEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        editingPost={editingPost}
      />
    </div>
  );
}
