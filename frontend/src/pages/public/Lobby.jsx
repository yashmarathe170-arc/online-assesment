import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen, Award, CheckCircle, Star, Loader2, Menu } from 'lucide-react';
import api from '../../utils/api.js';

export const Lobby = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data } = await api.get('/courses?limit=3');
        setFeaturedCourses(data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <div className="min-h-screen bg-warm-ivory dark:bg-forest-dark text-charcoal dark:text-sand flex flex-col justify-between transition-colors duration-300">
      
      {/* LUMINA HEADER NAVBAR */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-forest/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-forest dark:bg-gold rounded-xl flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white dark:text-forest-dark" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-forest dark:text-gold uppercase font-poppins">
            Lumina Academic
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold opacity-75 hover:opacity-100 hover:text-forest dark:hover:text-gold transition-colors font-inter">
            Explore Courses
          </Link>
          <Link to="/login" className="text-sm font-semibold opacity-75 hover:opacity-100 hover:text-forest dark:hover:text-gold transition-colors font-inter">
            Sign In
          </Link>
          <Link to="/register" className="premium-btn-primary py-2 px-5 text-xs">
            Apply
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-cream/40 text-slate-600">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto text-center px-6 py-20 sm:py-24 flex flex-col justify-center items-center">
          {/* Tag Pill */}
          <span className="px-4 py-1.5 bg-sage/10 text-forest dark:text-gold dark:bg-gold/10 text-[9px] font-bold uppercase tracking-widest rounded-full mb-6 font-inter border border-forest/5 dark:border-gold/10">
            ✦ NEW: PARTNERSHIP IN LEARNING
          </span>
          
          <h1 className="text-4xl sm:text-5.5xl font-extrabold tracking-tight leading-tight text-forest dark:text-white max-w-3xl font-poppins">
            Elevate your expertise with refined precision.
          </h1>
          
          <p className="text-charcoal/85 dark:text-sand/65 max-w-2xl text-sm sm:text-base mt-6 leading-relaxed font-inter">
            Access high-fidelity courses curated by global thought leaders. Experience a platform where academic rigor meets modern digital efficiency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/register" className="premium-btn-primary flex items-center justify-center gap-1.5 px-8">
              <span>Explore Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="premium-btn-secondary px-8 border border-forest/15 hover:border-forest/30">
              View Curriculum
            </Link>
          </div>

          {/* COMPUTER DISPLAY MOCKUP WITH GLASS OVERLAY */}
          <div className="w-full max-w-3xl mt-16 relative rounded-2xl overflow-hidden border border-forest/10 dark:border-white/10 shadow-[0_20px_50px_-20px_rgba(28,67,50,0.15)]">
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000" 
              alt="Lumina Academic Workspace" 
              className="w-full object-cover aspect-[16/9]"
            />
            {/* Ambient shadow gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest/50 to-transparent pointer-events-none" />
            
            {/* Glass Overlay widget */}
            <div className="absolute bottom-6 left-6 p-4 rounded-xl border border-white/20 bg-white/20 dark:bg-black/35 backdrop-blur-md flex items-center gap-3 text-left">
              <div className="h-9 w-9 bg-forest dark:bg-gold rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle className="h-5 w-5 text-white dark:text-forest-dark" />
              </div>
              <div>
                <h4 className="font-extrabold text-[11px] text-white tracking-wide uppercase">Progress Tracking</h4>
                <p className="text-[10px] text-white/80 mt-0.5">Real-time mastery insights</p>
              </div>
            </div>
          </div>
        </section>

        {/* SIGNATURE PATHWAYS (FEATURED COURSES) */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-forest/5 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-2.5xl font-extrabold text-forest dark:text-white font-poppins">Signature Pathways</h2>
            <p className="text-xs text-charcoal/80 dark:text-sand/55 mt-2">Specially curated for executive performance</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 text-forest dark:text-gold animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((c) => (
                <div key={c._id} className="premium-card premium-card-hover overflow-hidden flex flex-col justify-between p-0 border border-forest/5 dark:border-white/5 rounded-[18px]">
                  <img
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                    alt={c.title}
                    className="h-44 w-full object-cover rounded-t-[18px]"
                  />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-sage tracking-wider dark:text-gold/80 bg-sage/5 px-2 py-0.5 rounded border border-sage/10">
                        STRATEGY
                      </span>
                      <h3 className="font-bold text-sm text-forest dark:text-sand mt-3.5 line-clamp-1 leading-snug font-poppins">
                        {c.title}
                      </h3>
                      <p className="text-xs opacity-85 mt-2.5 line-clamp-3 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-forest/5 dark:border-white/5 flex items-center justify-between text-xs">
                      <span className="opacity-80 font-medium">By {c.instructor?.name}</span>
                      <Link to="/login" className="text-forest dark:text-gold font-bold hover:underline">
                        Enroll
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SOCIAL PROOF STATS BAR */}
        <section className="bg-cream/45 dark:bg-forest-dark/30 border-y border-forest/5 dark:border-white/5 py-12 text-center">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
            <h3 className="font-extrabold text-base text-forest dark:text-white font-poppins leading-relaxed sm:text-left">
              Loved by professionals at the world's most innovative teams.
            </h3>
            <div className="border-t sm:border-t-0 sm:border-l border-forest/10 dark:border-white/10 pt-6 sm:pt-0">
              <span className="text-3xl font-extrabold text-forest dark:text-gold block">98%</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mt-1">COMPLETION</span>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-forest/10 dark:border-white/10 pt-6 sm:pt-0">
              <span className="text-3xl font-extrabold text-forest dark:text-gold block">50k+</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mt-1">STUDENTS</span>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="premium-card p-10 sm:p-12 border border-forest/5 dark:border-white/5 bg-white dark:bg-surface-dark shadow-[0_10px_45px_rgba(28,67,50,0.015)] rounded-[24px]">
            <p className="text-base sm:text-lg opacity-85 leading-relaxed italic text-charcoal dark:text-sand">
              "The level of instructional design in Lumina's courses is unparalleled. It's not just about content; it's about the cognitive flow and the elegant environment that makes deep focus effortless."
            </p>
            <div className="flex flex-col items-center justify-center gap-3.5 mt-8 pt-6 border-t border-forest/5 dark:border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" 
                alt="Sarah Jenkins" 
                className="h-11 w-11 rounded-full object-cover border border-forest/10" 
              />
              <div>
                <h4 className="font-extrabold text-xs text-forest dark:text-gold">Sarah Jenkins</h4>
                <span className="text-[10px] opacity-80 block mt-0.5 uppercase tracking-wider font-semibold">Director of UX, Chevron Tech</span>
              </div>
            </div>
          </div>
        </section>

        {/* READY TO TRANSCEND (CTA BLOCK) */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="bg-forest dark:bg-surface-dark rounded-[24px] px-8 py-14 sm:py-16 text-center text-white border border-white/5 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(168,191,168,0.15)_0px,transparent_50%)]" />
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-extrabold font-poppins leading-tight">
                Ready to transcend the ordinary?
              </h2>
              <p className="text-xs text-white/70 mt-4 leading-relaxed font-inter">
                Join an elite circle of lifelong learners. Start your premium education journey today with a 14-day discovery pass.
              </p>
              <Link to="/register" className="premium-btn-primary bg-white text-forest hover:bg-slate-100 mt-8 py-3 px-8 text-xs font-bold shadow-md">
                Get Started Now
              </Link>
              <span className="text-[10px] text-white/40 mt-4 block">No credit card required.</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-16 border-t border-forest/5 dark:border-white/5 bg-cream/20 dark:bg-forest-dark/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <span className="font-extrabold text-sm uppercase tracking-wider text-forest dark:text-gold">Lumina</span>
            <p className="text-[11px] opacity-80 mt-4 leading-relaxed max-w-sm">
              Redefining academic excellence through digital craftsmanship and instructional integrity.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-[10px] uppercase text-slate-700 tracking-wider mb-4">Platform</h5>
            <ul className="space-y-2 text-xs opacity-85">
              <li><Link to="/login" className="hover:underline">Courses</Link></li>
              <li><Link to="/login" className="hover:underline">Enterprise</Link></li>
              <li><Link to="/login" className="hover:underline">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[10px] uppercase text-slate-700 tracking-wider mb-4">Resources</h5>
            <ul className="space-y-2 text-xs opacity-85">
              <li><Link to="/" className="hover:underline">About Us</Link></li>
              <li><Link to="/" className="hover:underline">Inquiry</Link></li>
              <li><Link to="/" className="hover:underline">Partners</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-forest/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] opacity-75">
          <span>© 2026 Lumina Academic. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:underline">Privacy</Link>
            <Link to="/" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Lobby;
