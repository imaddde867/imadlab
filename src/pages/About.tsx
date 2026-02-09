import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, Mail, FileText } from 'lucide-react';
import Stars from '@/components/Stars';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white section pt-14">
      <Stars />
      <div className="absolute inset-0 opacity-10 animate-subtle-flicker" />
      <SEO
        title="About Imad Eddine"
        description="Research Engineer and internal CTO at CoRe (Turku UAS), focused on deployable multimodal industrial AI, procedural knowledge extraction, and Privacy-by-Design systems."
        keywords="imad eddine el mouss, research engineer, internal cto, core turku uas, industrial ai, procedural knowledge extraction, multimodal data fusion, privacy-by-design"
        schemaType="AboutPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
        tags={['Research Engineer', 'Applied Research', 'Industrial AI']}
      />
      <div className="relative z-10 container-site">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 grid-gap-default">
          <div className="md:col-span-2 space-y-8">
            <div className="py-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                <span className="text-white/90">Imad Eddine El Mouss</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed">
                I am a <span className="font-semibold text-white">Research Engineer</span> at the{' '}
                <a
                  href="https://www.turkuamk.fi/en/research_groups/cognitive-technologies-research-group-core/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:underline"
                >
                  Cognitive Technologies Research Group (CoRe)
                </a>{' '}
                in Turku University of Applied Sciences, where I also operate as{' '}
                <span className="font-semibold text-white">internal CTO</span> for lab
                prototypes, architecture decisions, and engineering delivery quality.
              </p>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Current Scope</h2>
              <ul className="space-y-3 text-lg text-white/70 leading-relaxed list-disc pl-6">
                <li>
                  Technical architecture ownership for applied research prototypes in industrial AI.
                </li>
                <li>
                  Prototype-to-pilot delivery with reproducibility, validation, and integration
                  readiness.
                </li>
                <li>
                  Privacy-by-design and auditable outputs for safety-critical industrial contexts.
                </li>
              </ul>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Focus Areas</h2>
              <ul className="space-y-3 text-lg text-white/70 leading-relaxed list-disc pl-6">
                <li>Multimodal industrial intelligence across sensors, machines, logs, and documents.</li>
                <li>Procedural knowledge extraction and knowledge graph construction from industrial documentation.</li>
                <li>Applied LLM systems with robust evaluation and failure-mode awareness.</li>
                <li>Edge-to-cloud data and ML system design for real operational environments.</li>
              </ul>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Signature Research</h2>
              <p className="text-lg text-white/70 leading-relaxed">
                My thesis,{' '}
                <a
                  href="https://urn.fi/URN:NBN:fi:amk-2025121235460"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:underline"
                >
                  Structured Procedural Knowledge Extraction from Industrial Documentation Using LLMs
                </a>{' '}
                (5/5), introduced{' '}
                <span className="font-semibold text-white">IPKE</span>, a privacy-preserving
                pipeline for extracting procedural knowledge graphs from safety-critical manuals.
              </p>
              <p className="text-lg text-white/70 leading-relaxed mt-4">
                It combines local LLM pipelines, schema-aware extraction, and measurable procedural
                fidelity to support explainable industrial decision workflows.
              </p>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Timeline</h2>
              <ul className="space-y-3 text-lg text-white/70 leading-relaxed list-disc pl-6">
                <li>Jan 2026 to present: Research Engineer, CoRe (Turku UAS).</li>
                <li>Apr 2025 to Aug 2025: Applied AI Intern, CoRe.</li>
                <li>Feb 2025 to Jun 2025: Research Intern, AIS (Turku UAS).</li>
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">
                  Open to collaboration with research teams and industrial R&D partners on
                  multimodal industrial AI, procedural knowledge extraction, and deployable AI
                  systems.
                </p>
                <div className="flex flex-col space-y-3">
                  <a
                    href="https://github.com/imaddde867"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    imaddde867
                  </a>
                  <a
                    href="https://www.linkedin.com/in/imad-eddine-e-986741262"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    Imad Eddine El Mouss
                  </a>
                  <a
                    href="mailto:imad.e.elmouss@turkuamk.fi"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    imad.e.elmouss@turkuamk.fi
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-white/70">
                <p>Location: Turku, Finland</p>
                <p>Affiliation: CoRe, Turku UAS</p>
                <p>Languages: Arabic, French, English, Finnish (A2)</p>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-white/60">Full CV and detailed experience:</p>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30 transition-all"
              >
                <a
                  href="/Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
