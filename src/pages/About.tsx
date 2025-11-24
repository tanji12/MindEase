import { Heart, Target, Eye, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 peaceful-gradient">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-primary/20 mb-6">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">About MindEase</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Your Journey to Inner Peace
              </h1>
              <p className="text-lg text-muted-foreground">
                MindEase means "tranquility" in Arabic. We believe everyone deserves moments of peace 
                in their busy lives, and we're here to make that accessible.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide a sanctuary for mental relaxation through carefully curated content 
                  that adapts to your emotional needs. We combine the power of Islamic wisdom, 
                  therapeutic music, and inspiring literature to help you find peace in any moment.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become the go-to companion for millions seeking mental wellness, creating a 
                  world where finding inner peace is just a click away. We envision a community 
                  that supports each other's journey toward emotional balance and spiritual growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Helps */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Mental Relaxation Matters
                </h2>
              </div>

              <div className="space-y-6 text-muted-foreground">
                <p className="leading-relaxed">
                  In today's fast-paced world, stress and anxiety have become constant companions. 
                  Mental health is just as important as physical health, yet we often neglect it 
                  until we feel overwhelmed.
                </p>
                
                <p className="leading-relaxed">
                  <strong className="text-foreground">MindEase</strong> helps you take proactive steps 
                  toward mental wellness by providing resources that match your current emotional state. 
                  Whether you're feeling stressed, sad, or simply want to maintain your happiness, 
                  our platform offers immediate, personalized support.
                </p>

                <div className="bg-card rounded-xl p-6 border border-primary/20 my-8">
                  <h3 className="font-semibold text-foreground mb-3">What makes MindEase different?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Mood-based personalization for relevant content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Integration of Islamic wisdom with modern wellness practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Carefully curated, high-quality content from trusted sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Simple, beautiful interface that promotes calmness</span>
                    </li>
                  </ul>
                </div>

                <p className="leading-relaxed">
                  We believe that taking a few minutes each day for mental relaxation can transform 
                  your life. Start your journey with Sukun today and discover the peace that's 
                  always been within you.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
