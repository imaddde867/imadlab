import { useState } from 'react';
import { ArrowUp } from 'lucide-react';

const Contact = () => {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/imaddde867', icon: '⚡' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/imad-eddine-el-mouss-986741262/', icon: '💼' },
    { name: 'Twitter', href: 'https://x.com/Imad1194318', icon: '🐦' },
    { name: 'Email', href: 'mailto:imadeddine200507@gmail.com', icon: '✉️' }
  ];

  return (
    <section className="py-24 px-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-0 w-3/4 h-px bg-white"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1/2 h-px bg-white"></div>
        <div className="absolute left-1/4 top-0 w-px h-2/3 bg-white"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="mb-20 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Let's Build
            <br />
            <span className="text-white/60">Something Amazing</span>
          </h2>
          <div className="w-24 h-1 bg-white/40 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* Contact form */}
          <div className="lg:col-span-7 lg:col-start-1 relative z-10">
            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-white/70">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    
                    placeholder="Your name"
                    className="w-full px-4 py-4 bg-white/[0.03] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all duration-300 relative z-10"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white/70">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-4 bg-white/[0.03] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all duration-300 relative z-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-white/70">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  
                  placeholder="Tell me about your project or just say hello..."
                  rows={6}
                  className="w-full px-4 py-4 bg-white/[0.03] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all duration-300 resize-none relative z-10"
                  required
                />
              </div>

              <button
                type="submit"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/30 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:scale-105"
              >
                <span>Send Message</span>
                <ArrowUp className="w-5 h-5 rotate-45 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
            </form>
          </div>

          {/* Social links and quote */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-12">
            {/* Social links */}
            <div>
              <h3 className="text-2xl font-bold mb-8">Connect With Me</h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="group relative p-4 bg-white/[0.02] border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/[0.05] hover:border-white/30 hover:scale-105"
                    onMouseEnter={() => setHoveredSocial(social.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                  >
                    <div 
                      className={`
                        absolute inset-0 rounded-xl transition-opacity duration-300
                        ${hoveredSocial === social.name 
                          ? 'bg-gradient-to-br from-white/[0.1] to-transparent opacity-100' 
                          : 'opacity-0'
                        }
                      `}
                    />
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2">{social.icon}</div>
                      <div className="text-sm font-medium">{social.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Deming quote */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
              <blockquote className="text-lg font-medium leading-relaxed mb-4">
                "In God we trust. All others must bring data."
              </blockquote>
              <cite className="text-white/60 text-sm font-medium">
                — W. Edwards Deming
              </cite>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © 2024 Imad. Crafted with precision and passion.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
