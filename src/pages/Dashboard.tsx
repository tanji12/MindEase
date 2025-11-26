import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Smile, Frown, Heart, Zap, TrendingUp, Music, Book, Quote, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MoodButton from "@/components/MoodButton";
import ContentCard from "@/components/ContentCard";
import { MoodType, ContentType, Content } from "@/data/moodContent";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedContentTypes, setSelectedContentTypes] = useState<Set<ContentType>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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
      const { data } = await supabase
        .from("bookmarks")
        .select("content_id");

      if (data) {
        setBookmarkedIds(new Set(data.map(b => b.content_id)));
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const moods = [
    {
      id: "relax" as MoodType,
      icon: Heart,
      label: "Relax",
      description: "Calm your mind",
      color: "blue",
    },
    {
      id: "sad" as MoodType,
      icon: Frown,
      label: "Sad",
      description: "Find comfort",
      color: "indigo",
    },
    {
      id: "happy" as MoodType,
      icon: Smile,
      label: "Happy",
      description: "Amplify joy",
      color: "yellow",
    },
    {
      id: "stressed" as MoodType,
      icon: Zap,
      label: "Stressed",
      description: "Release tension",
      color: "orange",
    },
    {
      id: "motivated" as MoodType,
      icon: TrendingUp,
      label: "Motivated",
      description: "Take action",
      color: "green",
    },
  ];

  const contentTypeOptions = [
    { id: "music" as ContentType, icon: Music, label: "Music" },
    { id: "book" as ContentType, icon: Book, label: "Books" },
    { id: "quote" as ContentType, icon: Quote, label: "Quotes" },
    { id: "ayat" as ContentType, icon: Book, label: "Ayat" },
  ];

  const handleMoodSelect = (moodId: MoodType) => {
    setSelectedMood(moodId);
    setSelectedContentTypes(new Set());
  };

  const handleContentTypeToggle = (type: ContentType) => {
    setSelectedContentTypes((prev) => {
      const newSet = new Set<ContentType>();
    
      if (prev.has(type)) {
      
        return newSet;
      }

      newSet.add(type);
      return newSet;
    });
  };

  const handleBookmark = async (content: Content) => {
    if (!user) return;

    const isBookmarked = bookmarkedIds.has(content.id);

    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("content_id", content.id);

        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(content.id);
          return newSet;
        });

        toast({
          title: "Removed from bookmarks",
          description: "Content removed from your saved items",
        });
      } else {
        await supabase
          .from("bookmarks")
          .insert([{
            user_id: user.id,
            content_id: content.id,
            content_type: content.type,
            title: content.title,
            description: content.description,
            link: content.link,
            audio_url: content.audioUrl,
            book_content: content.bookContent,
          }]);

        setBookmarkedIds(prev => new Set([...prev, content.id]));

        toast({
          title: "Bookmarked!",
          description: "Content saved to your bookmarks",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  

  const [currentContent, setCurrentContent] = useState<Content[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!selectedMood || selectedContentTypes.size !== 1) {
        setCurrentContent([]);
        return;
      }

      const type = Array.from(selectedContentTypes)[0];

      setCurrentContent([]);
      setLoadingRecommendations(true);
      try {
        const res: any = await (supabase as any)
          .from('admin_content')
          .select('*')
          .eq('mood', selectedMood)
          .eq('content_type', type)
          .order('created_at', { ascending: false });

        const data = res?.data;
        const error = res?.error;

        if (error) {
          console.error('Error fetching recommendations:', error);
          setCurrentContent([]);
        } else {
          const mapped = (data || []).map((row: any) => ({
            id: row.id,
            type: row.content_type as ContentType,
            title: row.title,
            description: row.description || row.body || '',
            link: row.file_url || null,
            audioUrl: row.content_type === 'music' ? row.file_url : undefined,
            bookContent: row.content_type === 'book' ? row.body || row.file_url : undefined,
          }));
          setCurrentContent(mapped);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setCurrentContent([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchContent();
  }, [selectedMood, selectedContentTypes]);

  if (authLoading) {
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How are you feeling today?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your current mood to discover personalized content designed to support your emotional well-being
            </p>
          </div>

          {/* Mood Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {moods.map((mood) => (
              <MoodButton
                key={mood.id}
                icon={mood.icon}
                label={mood.label}
                description={mood.description}
                color={mood.color}
                isSelected={selectedMood === mood.id}
                onClick={() => handleMoodSelect(mood.id)}
              />
            ))}
          </div>

          {/* Content Type Selection */}
          {selectedMood && (
            <div className="animate-in fade-in duration-500 mb-12">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Choose Avaiable Option
                </h2>
                <p className="text-muted-foreground">
                  Choose One type to see personalized recommendations
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {contentTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedContentTypes.has(option.id);
                    return (
                      <Button
                        key={option.id}
                        onClick={() => handleContentTypeToggle(option.id)}
                        variant="outline"
                        className={cn(
                          "h-24 flex flex-col items-center justify-center gap-2 smooth-transition",
                          isSelected && "border-primary bg-primary/10 shadow-md"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                        <span className={cn("text-sm font-medium", isSelected && "text-primary")}>
                          {option.label}
                        </span>
                      </Button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Content Display */}
          {selectedMood && selectedContentTypes.size === 1 && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Your Recommendations
                </h2>
                <p className="text-muted-foreground">
                  Based on your mood and selected content types
                </p>
              </div>

              {loadingRecommendations ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">Loading recommendations...</h3>
                  <p className="text-muted-foreground">Fetching personalized content for you</p>
                </div>
              ) : currentContent.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentContent.map((content) => (
                    <ContentCard
                      key={content.id}
                      type={content.type}
                      title={content.title}
                      description={content.description}
                      link={content.link}
                      audioUrl={content.audioUrl}
                      bookContent={content.bookContent}
                      isBookmarked={bookmarkedIds.has(content.id)}
                      onBookmark={() => handleBookmark(content)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No content available
                  </h3>
                  <p className="text-muted-foreground">
                    Try selecting different content types
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!selectedMood && (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a mood to get started
              </h3>
              <p className="text-muted-foreground">
                Choose how you're feeling above to see personalized recommendations
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
