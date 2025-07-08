import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mountain, Wrench, Heart, Eye, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { PostWithAuthor } from "@shared/schema";

export default function Landing() {
  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
  });

  const featuredPosts = posts?.slice(0, 3) || [];

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
    <>
      {/* Hero Section */}
      <section className="relative h-96 hero-gradient flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Adventures on Wheels</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Following our journey with Derek, our motorhome, sharing the highs, lows, and everything in between
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-white"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Reading
          </Button>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Recent Adventures</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Catch up on our latest journeys, discoveries, and lessons learned on the road
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full h-48 bg-muted animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-3"></div>
                    <div className="h-6 bg-muted rounded animate-pulse mb-3"></div>
                    <div className="h-16 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
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
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{post.views}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">About Our Journey</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Hi there! We're John and Sarah, and this is our trusty companion Max. Three years ago, we made the bold decision to sell our house, buy a motorhome, and hit the road full-time.
              </p>
              <p className="text-muted-foreground text-lg mb-6">
                What started as a one-year adventure has turned into a lifestyle we can't imagine giving up. From the stunning national parks to the quirky roadside attractions, we've discovered that home isn't a place—it's wherever we park our wheels.
              </p>
              <p className="text-muted-foreground text-lg mb-8">
                Through this blog, we share our experiences, the lessons we've learned, and the incredible people we've met along the way. Join us as we continue exploring this beautiful country, one mile at a time.
              </p>
              <div className="flex space-x-4">
                <Button>Our Story</Button>
                <Button variant="outline">Get In Touch</Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl bg-muted h-96 w-full"></div>
              <div className="absolute -bottom-6 -right-6 bg-accent p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-white font-bold text-2xl">50+</div>
                  <div className="text-white text-sm">States Visited</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
