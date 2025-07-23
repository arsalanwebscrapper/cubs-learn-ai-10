import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Users, Award, Globe, BookOpen, Gamepad2, Trophy, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-children.jpg";
import cubsMascot from "@/assets/cubs-mascot.png";
import teachersGroup from "@/assets/teachers-group.jpg";

const HomePage = () => {
  const ageGroups = [
    {
      title: "Early Cubs",
      age: "3-5 years",
      description: "Playful learning adventures for tiny tots",
      color: "bg-cubs-warm",
      icon: "🐻",
      courses: 12
    },
    {
      title: "Junior Cubs", 
      age: "6-8 years",
      description: "Interactive lessons to spark curiosity",
      color: "bg-cubs-light-blue",
      icon: "🎨",
      courses: 18
    },
    {
      title: "Senior Cubs",
      age: "9-12 years", 
      description: "Advanced skills for growing minds",
      color: "bg-gradient-to-br from-primary/10 to-primary/20",
      icon: "🚀",
      courses: 24
    },
    {
      title: "Super Cubs",
      age: "13+ years",
      description: "Future-ready skills for teenagers",
      color: "bg-gradient-to-br from-secondary/10 to-secondary/20", 
      icon: "⭐",
      courses: 30
    }
  ];

  const features = [
    {
      title: "Interactive Lessons",
      description: "Engaging content that makes learning fun",
      icon: Play,
      color: "text-primary"
    },
    {
      title: "Real-Time Rewards",
      description: "Instant recognition for achievements",
      icon: Trophy,
      color: "text-secondary"
    },
    {
      title: "Virtual Classrooms", 
      description: "Connect with peers and teachers online",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Fun Quizzes & Leaderboards",
      description: "Gamified assessments and friendly competition",
      icon: Gamepad2,
      color: "text-secondary"
    }
  ];

  const educators = [
    {
      name: "Dr. Sarah Johnson",
      subject: "Mathematics & Logic",
      experience: "8+ years",
      rating: 4.9,
      students: 1200
    },
    {
      name: "Prof. Mike Chen",
      subject: "Science & Technology", 
      experience: "12+ years",
      rating: 4.8,
      students: 980
    },
    {
      name: "Ms. Emily Rodriguez",
      subject: "Language Arts",
      experience: "6+ years", 
      rating: 4.9,
      students: 850
    }
  ];

  const testimonials = [
    {
      name: "Jennifer Martinez",
      child: "Alex (8 years)",
      text: "My son's confidence in math has skyrocketed! The interactive games make learning so enjoyable.",
      rating: 5,
      location: "California, USA"
    },
    {
      name: "David Thompson", 
      child: "Emma (10 years)",
      text: "StudyCubs has transformed how my daughter approaches learning. She actually looks forward to study time!",
      rating: 5,
      location: "London, UK"
    },
    {
      name: "Priya Sharma",
      child: "Arjun (6 years)",
      text: "The personalized approach really works. Teachers understand each child's unique learning style.",
      rating: 5,
      location: "Mumbai, India"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={cubsMascot} alt="StudyCubs Mascot" className="w-10 h-10" />
              <span className="text-2xl font-batangas font-bold text-primary">StudyCubs</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#programs" className="text-foreground hover:text-primary transition-colors">Programs</Link>
              <Link to="#educators" className="text-foreground hover:text-primary transition-colors">Educators</Link>
              <Link to="#about" className="text-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/auth" className="text-foreground hover:text-primary transition-colors">Login</Link>
              <Button asChild variant="cubs" size="sm">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-batangas font-bold text-foreground leading-tight">
                  We are building <span className="text-primary">future cubs</span> at StudyCubs
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Empowering learners with future-ready skills in a playful, personalized environment.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="#programs">Explore Programs</Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/auth">Book a Free Class</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-secondary text-secondary" />
                  <span>10,000+ Happy Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span>20+ Countries</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Happy children learning" 
                className="rounded-2xl shadow-cubs w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 bg-secondary text-white px-6 py-3 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">Trusted by 10,000+ parents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Courses Section */}
      <section id="programs" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-batangas font-bold text-foreground mb-4">
              Explore <span className="text-primary">Courses</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Age-appropriate learning programs designed to nurture young minds at every stage
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {ageGroups.map((group, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-cubs hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className={`absolute inset-0 ${group.color}`}></div>
                <CardHeader className="relative z-10 text-center pb-4">
                  <div className="text-4xl mb-3">{group.icon}</div>
                  <CardTitle className="text-xl font-batangas">{group.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit mx-auto">{group.age}</Badge>
                </CardHeader>
                <CardContent className="relative z-10 text-center">
                  <CardDescription className="text-foreground/80 mb-4">
                    {group.description}
                  </CardDescription>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{group.courses} courses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Play to Learn Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-batangas font-bold text-foreground mb-4">
              Play to <span className="text-secondary">Learn</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Gamified learning experiences that make education exciting and engaging
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-cubs hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg font-batangas">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Educators Section */}
      <section id="educators" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-batangas font-bold text-foreground mb-4">
              Quality <span className="text-primary">Educators</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn from certified teachers who are passionate about nurturing young minds
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {educators.map((educator, index) => (
              <Card key={index} className="text-center border-0 shadow-cubs hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary overflow-hidden">
                    <img src={teachersGroup} alt={educator.name} className="w-full h-full object-cover" />
                  </div>
                  <CardTitle className="text-lg font-batangas">{educator.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">{educator.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                    <span className="text-sm font-medium ml-2">{educator.rating}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{educator.experience}</span>
                    <span>{educator.students}+ students</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Parent Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-batangas font-bold text-foreground mb-4">
              Parent <span className="text-secondary">Trust</span>
            </h2>
            <div className="bg-primary/10 text-primary px-8 py-4 rounded-full inline-flex items-center space-x-3 mb-8">
              <Heart className="w-6 h-6" />
              <span className="text-lg font-semibold">Trusted by 10,000+ parents around the world</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-cubs hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>Parent of {testimonial.child}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic mb-3">"{testimonial.text}"</p>
                  <p className="text-sm text-primary font-medium">{testimonial.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact & Reach Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-batangas font-bold text-foreground mb-8">
              Our Global <span className="text-primary">Impact</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-batangas font-bold text-primary mb-2">100+</div>
                <div className="text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-batangas font-bold text-secondary mb-2">40+</div>
                <div className="text-muted-foreground">Expert Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-batangas font-bold text-primary mb-2">20+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-batangas font-bold text-secondary mb-2">10K+</div>
                <div className="text-muted-foreground">Happy Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-batangas font-bold mb-6">
            Ready to start your cub's learning journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of parents who trust StudyCubs to nurture their children's potential
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="xl" asChild>
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="xl" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="#programs">View Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img src={cubsMascot} alt="StudyCubs" className="w-8 h-8" />
                <span className="text-xl font-batangas font-bold">StudyCubs</span>
              </div>
              <p className="text-background/80 mb-4">
                Building future cubs with personalized, engaging learning experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-background/80">
                <li><Link to="#" className="hover:text-background transition-colors">Early Cubs (3-5)</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Junior Cubs (6-8)</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Senior Cubs (9-12)</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Super Cubs (13+)</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-background/80">
                <li><Link to="#" className="hover:text-background transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-background/80">
                <li><Link to="#" className="hover:text-background transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">FAQs</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-background transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-background/60">
            <p>&copy; 2024 StudyCubs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;