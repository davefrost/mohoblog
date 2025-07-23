import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import CategoryFilter from "@/components/blog/category-filter";
import PostCard from "@/components/blog/post-card";
import PostEditor from "@/components/blog/post-editor";
import { useAuth } from "@/hooks/useAuth";
import type { PostWithAuthor } from "@shared/schema";
import heroMotorhome from "@/assets/hero-motorhome.svg";
import campervanCard from "@/assets/campervan-card.svg";

export default function Home() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);

  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", selectedCategory === 'all' ? undefined : selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'all' 
        ? '/api/posts' 
        : `/api/posts?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const handleEditPost = (post: PostWithAuthor) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditingPost(null);
    setIsEditorOpen(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroMotorhome} 
            alt="Motorhome adventure scene" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Adventures on Wheels</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            Following our journey with Derek, our motorhome, sharing the highs, lows, and everything in between
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-white shadow-lg"
          >
            Start Reading
          </Button>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Featured Posts */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Recent Adventures</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Catch up on our latest journeys, discoveries, and lessons learned on the road
            </p>
          </div>

          {/* Admin Controls */}
          {user?.isAdmin && (
            <div className="mb-8 flex justify-end">
              <Button
                onClick={() => setIsEditorOpen(true)}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          )}

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden">
                  <div className="w-full h-48 bg-muted animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-3"></div>
                    <div className="h-6 bg-muted rounded animate-pulse mb-3"></div>
                    <div className="h-16 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={user?.isAdmin ? handleEditPost : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <img 
                  src={campervanCard} 
                  alt="No adventures yet" 
                  className="w-full h-auto mb-8 rounded-lg shadow-lg"
                />
                <h3 className="text-2xl font-bold text-foreground mb-4">No Adventures Yet</h3>
                <p className="text-muted-foreground mb-6">
                  We're still getting ready for our first adventure! Check back soon for amazing stories and travel tips.
                </p>
                {user?.isAdmin && (
                  <Button
                    onClick={() => setIsEditorOpen(true)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write First Post
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {posts && posts.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-primary py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-blue-100 text-lg mb-8">
            Get notified when we publish new adventures and travel tips
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white"
            />
            <Button className="bg-accent hover:bg-accent/90 text-white">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Post Editor Modal */}
      {user?.isAdmin && (
        <PostEditor
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          editingPost={editingPost}
        />
      )}
    </>
  );
}
