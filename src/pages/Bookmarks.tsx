import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkX, Heart, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Bookmarks = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookmarkedContent, setBookmarkedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchBookmarks();
    }
  }, [user, authLoading, navigate]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarkedContent(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading bookmarks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("content_id", contentId);

      if (error) throw error;

      setBookmarkedContent(prev => prev.filter(item => item.content_id !== contentId));
      
      toast({
        title: "Bookmark removed",
        description: "Content removed from bookmarks",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Bookmarks
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Access all your saved content in one place
            </p>
          </div>

          {/* Content Grid */}
          {bookmarkedContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedContent.map((content) => (
                <ContentCard
                  key={content.id}
                  type={content.content_type}
                  title={content.title}
                  description={content.description}
                  link={content.link}
                  audioUrl={content.audio_url}
                  bookContent={content.book_content}
                  isBookmarked={true}
                  onBookmark={() => handleRemoveBookmark(content.content_id)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-muted/30 rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <BookmarkX className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                No bookmarks yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start exploring content in the Dashboard and bookmark your favorites to see them here
              </p>
              <Button asChild>
                <a href="/dashboard" className="inline-flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Go to Dashboard
                </a>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Bookmarks;
