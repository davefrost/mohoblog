import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2, Mountain, Wrench, Heart } from "lucide-react";
import { Link } from "wouter";
import type { PostWithAuthor } from "@shared/schema";

interface PostCardProps {
  post: PostWithAuthor;
  onEdit?: (post: PostWithAuthor) => void;
  onDelete?: (postId: number) => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
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
        return 'Adventures';
      case 'mechanical':
        return 'Mechanical';
      case 'dog':
        return 'The Dog';
      default:
        return category;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.featuredImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={`post-category-${post.category}`}
          >
            {getCategoryIcon(post.category)}
            <span className="ml-1">{getCategoryLabel(post.category)}</span>
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(post.createdAt!).toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
          <Link href={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground text-sm">
            <Eye className="h-4 w-4 mr-1" />
            <span>{post.views}</span>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(post)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
