import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">MindEase — Mind Relaxer</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Find peace and tranquility through guided content tailored to your mood.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MindEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
