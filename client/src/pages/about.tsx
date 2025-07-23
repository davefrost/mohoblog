import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import travelBackground from "@/assets/travel-background.svg";
import campervanCard from "@/assets/campervan-card.svg";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={travelBackground} 
            alt="Travel landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">About Our Journey</h1>
          <p className="text-xl max-w-2xl mx-auto drop-shadow-md">
            The story behind Adventures on Wheels and the people who make it happen
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Meet the Adventure Team</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Hi there! We're John and Sarah, and this is our trusty companion Max. Three years ago, we made the bold decision to sell our house, buy a motorhome, and hit the road full-time.
              </p>
              <p className="text-muted-foreground text-lg mb-6">
                What started as a one-year adventure has turned into a lifestyle we can't imagine giving up. From the stunning national parks to the quirky roadside attractions, we've discovered that home isn't a place—it's wherever we park our wheels.
              </p>
              <p className="text-muted-foreground text-lg mb-8">
                Through this blog, we share our experiences, the lessons we've learned, and the incredible people we've met along the way. Join us as we continue exploring this beautiful country, one mile at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button>Get In Touch</Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://instagram.com/adventuresonwheels', '_blank')}
                >
                  Follow Our Journey
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={campervanCard} 
                  alt="Our motorhome adventure" 
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-accent p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-white font-bold text-2xl">50+</div>
                  <div className="text-white text-sm">States Visited</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">States Visited</h3>
                <p className="text-muted-foreground">
                  From coast to coast, we've explored the diverse landscapes of America
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">100k+</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Miles Traveled</h3>
                <p className="text-muted-foreground">
                  Every mile has been an adventure, filled with memories and discoveries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Years on Road</h3>
                <p className="text-muted-foreground">
                  What started as a one-year plan has become our way of life
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Story */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Story</h2>
            
            <div className="space-y-8">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Badge className="mr-3">2021</Badge>
                    <h3 className="text-xl font-semibold">The Big Decision</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    After years of dreaming about life on the road, we finally took the plunge. We sold our house, downsized our belongings, and purchased our first motorhome. It was scary, exciting, and liberating all at once.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Badge className="mr-3">2022</Badge>
                    <h3 className="text-xl font-semibold">First Year Adventures</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Our first year was a whirlwind of discovery. We learned about RV maintenance the hard way, found our favorite camping spots, and started documenting our journey. Max adapted quickly to life on the road, becoming our best travel companion.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Badge className="mr-3">2023</Badge>
                    <h3 className="text-xl font-semibold">Building Community</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We started this blog to share our experiences and connect with other travelers. The response has been incredible, and we've made lifelong friends through our shared love of adventure and the open road.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Badge className="mr-3">2024</Badge>
                    <h3 className="text-xl font-semibold">The Journey Continues</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Now in our third year, we're still discovering new places, meeting amazing people, and learning valuable lessons. This blog has become more than just a travel diary—it's a way to inspire others to pursue their own adventures.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Your Adventure?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Whether you're dreaming of life on the road or just love following along with our journey, we'd love to connect with you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg">Get In Touch</Button>
              </Link>
              <Button variant="outline" size="lg">Follow Our Journey</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
