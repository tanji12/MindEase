import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, BookOpen, Music } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-meditation.jpg";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 peaceful-gradient opacity-80"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Your Mental Peace Companion</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                Welcome to <span className="text-primary">MindEase</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                Find tranquility through personalized content. Select your mood and discover calming music, 
                inspiring quotes, Quranic wisdom, and recommended books tailored just for you.
              </p>
              
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <Link to="/dashboard">
                  <Button size="lg" className="smooth-transition hover:scale-105">
                    Get Started
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="smooth-transition">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl animate-pulse"></div>
              <img 
                src={heroImage} 
                alt="Peaceful meditation scene" 
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover smooth-transition hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How MindEase Helps You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience personalized mental wellness through mood-based content recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 smooth-transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mood-Based Selection</h3>
              <p className="text-muted-foreground">
                Choose from Relax, Sad, Happy, Stressed, or Motivated moods to get perfectly matched content
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 smooth-transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Music className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curated Content</h3>
              <p className="text-muted-foreground">
                Access calming music, Quran recitations, motivational quotes, and inspiring book recommendations
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 smooth-transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Favorites</h3>
              <p className="text-muted-foreground">
                Bookmark content you love and build your personal collection of peace-inducing resources
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
