export type MoodType = "relax" | "sad" | "happy" | "stressed" | "motivated";

export type ContentType = "music" | "book" | "quote" | "tilawat" | "ayat";

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  link?: string;
  audioUrl?: string;
  tilawatContent?: string;
  bookContent?: string;
}

