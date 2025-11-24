import { Bookmark, Music, Book, Quote, Heart, Play, Pause, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useRef } from "react";

interface ContentCardProps {
  type: "music" | "book" | "quote" | "tilawat" | "ayat";
  title: string;
  description: string;
  link?: string;
  audioUrl?: string;
  bookContent?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

const ContentCard = ({ type, title, description, link, audioUrl, bookContent, isBookmarked, onBookmark }: ContentCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const getIcon = () => {
    switch (type) {
      case "music":
      case "tilawat":
        return <Music className="w-5 h-5" />;
      case "book":
        return <Book className="w-5 h-5" />;
      case "quote":
      case "ayat":
        return <Quote className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "music":
        return "Relaxing Music";
      case "book":
        return "Book";
      case "quote":
        return "Quote";
      case "tilawat":
        return "Quran Tilawat";
      case "ayat":
        return "Quranic Ayat";
      default:
        return "Content";
    }
  };

  return (
    <Card className="group hover:shadow-lg smooth-transition border-border hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {getIcon()}
              </div>
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel()}
              </Badge>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {onBookmark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBookmark}
              className="shrink-0"
            >
              <Bookmark className={isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"} />
            </Button>
          )}
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {(type === "music" || type === "tilawat") && audioUrl && (
          <div className="space-y-3">
            <audio 
              ref={audioRef} 
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
            <Button 
              variant="outline" 
              className="w-full group-hover:border-primary smooth-transition"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
          </div>
        )}

        {type === "book" && bookContent && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full group-hover:border-primary smooth-transition">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
              {typeof bookContent === "string" && (bookContent.startsWith("http") || /\.pdf($|\?)/i.test(bookContent)) ? (
                <div className="mt-4">
                  <iframe
                    src={bookContent}
                    title={title}
                    className="w-full h-[70vh] border rounded-md"
                  />
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert mt-4 whitespace-pre-line">
                  {bookContent}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {(type === "quote" || type === "ayat") && !audioUrl && !bookContent && (
          <div className="text-sm text-muted-foreground italic border-l-2 border-primary pl-4 py-2">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentCard;
