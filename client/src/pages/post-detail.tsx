import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mountain, Wrench, Heart, Eye, Calendar, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { PostWithAuthor } from "@shared/schema";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: post, isLoading, error } = useQuery<PostWithAuthor>({
    queryKey: ["/api/posts/slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/slug/${slug}`);
      if (!response.ok) throw new Error('Post not found');
      return response.json();
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'adventures':
        return <Mountain className="h-4 w-4" />;
      case 'mechanical':
        return <Wrench className="h-4 w-4" />;
      case 'dog':
        return <Heart className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'adventures':
        return 'Motorhome Adventures';
      case 'mechanical':
        return 'Mechanical Issues';
      case 'dog':
        return 'The Dog';
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge 
              variant="secondary" 
              className={`post-category-${post.category}`}
            >
              {getCategoryIcon(post.category)}
              <span className="ml-2">{getCategoryLabel(post.category)}</span>
            </Badge>
            <div className="flex items-center text-muted-foreground text-sm">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.views} views</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                {post.author?.firstName} {post.author?.lastName}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(post.createdAt!).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 font-medium">
              {post.excerpt}
            </p>
          )}
          
          <div 
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Post Actions */}
        {user?.isAdmin && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                Edit Post
              </Button>
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                Delete Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
