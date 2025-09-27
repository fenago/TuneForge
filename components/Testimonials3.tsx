import Image from "next/image";
import { StaticImageData } from "next/image";
import { Card, CardContent } from "./ui/card";

// TuneForge Testimonials: Social proof from diverse user types
const list: {
  username?: string;
  name: string;
  role: string;
  text: string;
  img?: string | StaticImageData;
}[] = [
  {
    username: "aisha_creates",
    name: "Aisha Chen",
    role: "Content Creator",
    text: "TuneForge has completely changed my workflow. I can now create amazing soundtracks for my videos in minutes! The quality is incredible and my audience loves the unique music.",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
  },
  {
    username: "elena_gamedev",
    name: "Elena Rodriguez",
    role: "Indie Game Developer",
    text: "As an indie game dev, music was always a huge bottleneck for me. TuneForge is a lifesaver - I can generate perfect ambient tracks and sound effects that match my game's mood perfectly.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    username: "john_synth",
    name: "John 'Synth' Williams",
    role: "Music Producer",
    text: "I was skeptical about AI music at first, but the quality is just incredible. TuneForge has become a core part of my creative process - it's like having an infinite source of inspiration.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
];

// TuneForge Testimonial Card
const Testimonial = ({ i }: { i: number }) => {
  const testimonial = list[i];

  if (!testimonial) return null;

  return (
    <li key={i}>
      <Card className="group h-full cursor-pointer hover:scale-105 transition-all duration-500">
        <CardContent className="p-8 flex flex-col h-full">
          {/* Quote Icon */}
          <div className="mb-6 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-tuneforge-blue-violet/20 group-hover:text-tuneforge-blue-violet/40 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </div>

          {/* Testimonial Text */}
          <blockquote className="relative flex-1 mb-6">
            <p className="font-inter text-gray-700 group-hover:text-gray-800 leading-relaxed text-lg transition-colors duration-300">
              "{testimonial.text}"
            </p>
          </blockquote>

          {/* Author Info */}
          <figcaption className="flex items-center gap-4">
            <div className="overflow-hidden rounded-full shrink-0 group-hover:scale-110 transition-transform duration-300">
              {testimonial.img ? (
                <Image
                  className="w-14 h-14 rounded-full object-cover group-hover:brightness-110 transition-all duration-300"
                  src={testimonial.img}
                  alt={`${testimonial.name}'s testimonial for TuneForge`}
                  width={56}
                  height={56}
                />
              ) : (
                <span className="w-14 h-14 rounded-full flex justify-center items-center text-xl font-medium bg-tuneforge-gradient text-white group-hover:animate-pulse">
                  {testimonial.name.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="flex-1 group-hover:translate-x-1 transition-transform duration-300">
              <div className="font-inter font-semibold text-gray-900 group-hover:text-tuneforge-blue-violet transition-colors duration-300">
                {testimonial.name}
              </div>
              <div className="font-inter text-sm text-tuneforge-blue-violet group-hover:text-tuneforge-medium-purple transition-colors duration-300">
                {testimonial.role}
              </div>
              {testimonial.username && (
                <div className="font-inter text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                  @{testimonial.username}
                </div>
              )}
            </div>
          </figcaption>
        </CardContent>
      </Card>
    </li>
  );
};

const Testimonials3 = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24" id="testimonials">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-dm-serif font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
            Loved by Creators Everywhere
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 cursor-default">
            Don't just take our word for it. Here's what real creators are saying about TuneForge 
            and how it's transformed their creative process.
          </p>
        </div>

        {/* Testimonials Grid */}
        <ul
          role="list"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
        >
          {[...Array(3)].map((e, i) => (
            <Testimonial key={i} i={i} />
          ))}
        </ul>

        {/* Bottom Stats */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-tuneforge-gradient rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-tuneforge-medium-purple rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-tuneforge-slate-blue rounded-full border-2 border-white"></div>
            </div>
            <p className="font-inter text-gray-700 font-medium">
              Join 10,000+ creators making amazing music
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials3;
