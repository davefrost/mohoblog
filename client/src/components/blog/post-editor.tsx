import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Save, Eye } from "lucide-react";
import { insertPostSchema, POST_CATEGORIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { InsertPost, PostWithAuthor } from "@shared/schema";
import SimpleRichEditor from "@/components/ui/simple-rich-editor";

interface PostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editingPost?: PostWithAuthor | null;
}

export default function PostEditor({ isOpen, onClose, editingPost }: PostEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertPost>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      category: "adventures",
      authorId: "",
      isPublished: false,
    },
  });

  // Reset form when editingPost changes
  useEffect(() => {
    if (editingPost) {
      form.reset({
        title: editingPost.title || "",
        slug: editingPost.slug || "",
        excerpt: editingPost.excerpt || "",
        content: editingPost.content || "",
        featuredImage: editingPost.featuredImage || "",
        category: editingPost.category || "adventures",
        authorId: editingPost.authorId || "",
        isPublished: Boolean(editingPost.isPublished),
      });
      setFeaturedImage(editingPost.featuredImage || null);
    } else {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        category: "adventures",
        authorId: "",
        isPublished: false,
      });
      setFeaturedImage(null);
    }
  }, [editingPost, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
      const method = editingPost ? "PATCH" : "POST";
      
      // Generate slug from title if not provided
      if (!data.slug) {
        data.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: editingPost ? "Post updated successfully!" : "Post created successfully!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/admin"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error saving post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await response.json();
      setFeaturedImage(url);
      form.setValue('featuredImage', url);
      
      toast({
        title: "Image uploaded successfully!",
        description: "Your featured image has been set.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: InsertPost) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setFeaturedImage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPost ? "Edit Post" : "Create New Post"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                className="mt-1"
                placeholder="Enter post title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                className="mt-1"
                placeholder="auto-generated-from-title"
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={POST_CATEGORIES.ADVENTURES}>Motorhome Adventures</SelectItem>
                <SelectItem value={POST_CATEGORIES.MECHANICAL}>Mechanical Issues</SelectItem>
                <SelectItem value={POST_CATEGORIES.DOG}>The Dog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...form.register("excerpt")}
              className="mt-1"
              rows={3}
              placeholder="Brief description of the post..."
            />
          </div>

          <div>
            <Label>Featured Image</Label>
            <div className="mt-1">
              {featuredImage ? (
                <div className="relative">
                  <img 
                    src={featuredImage} 
                    alt="Featured" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFeaturedImage(null);
                      form.setValue('featuredImage', '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {isUploading ? "Uploading..." : "Click to upload featured image"}
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <div className="mt-1">
              <SimpleRichEditor
                content={form.watch("content") || ""}
                onChange={(content) => form.setValue("content", content)}
                placeholder="Write your adventure story here..."
              />
            </div>
            {form.formState.errors.content && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={Boolean(form.watch("isPublished"))}
              onCheckedChange={(checked) => form.setValue("isPublished", checked)}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPost ? "Update Post" : "Create Post"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
