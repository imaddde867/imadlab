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
      <div className="absolute inset-0 opacity-10" />
      <SEO
        title="About Imad Eddine"
        description="Research Engineer at CoRe (Turku UAS) and architect of AIOP, an on-premises event-driven AI platform, focused on deployable multimodal industrial AI, procedural knowledge extraction, and Privacy-by-Design systems."
        keywords="imad eddine el mouss, research engineer, aiop, core turku uas, industrial ai, procedural knowledge extraction, multimodal data fusion, privacy-by-design"
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
                in Turku University of Applied Sciences, where I am the{' '}
                <span className="font-semibold text-white">
                  architect and principal developer of AIOP
                </span>
                , the on-premises event-driven AI platform that is the integration backbone for
                every industrial pilot module the group runs.
              </p>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Selected Highlights</h2>
              <ul className="space-y-3 text-lg text-white/70 leading-relaxed list-disc pl-6">
                <li>
                  <span className="font-semibold text-white">Patent pending.</span> Named inventor
                  (one of three) on a European patent application filed at the EPO on 10 April
                  2026: adaptive digital content generation based on multimodal data. Applicant:
                  Turku University of Applied Sciences.
                </li>
                <li>
                  <span className="font-semibold text-white">EUR 6.98M Horizon Europe project.</span>{' '}
                  Contributed to the planning of Sensor4Food (HORIZON-CL4), a 21-partner European
                  consortium coordinated by Turku UAS, developing photonic sensing and AI for the
                  poultry value chain across pilot sites in Spain, Italy and Norway (2026-2030).
                </li>
                <li>
                  <span className="font-semibold text-white">Platform ownership.</span> Architect
                  and principal developer of AIOP (Python, NATS JetStream, Docker, FastAPI).
                  Reproducible stress audits: 200 events/s sustained at 0% loss, 10ms p99 latency
                  (and 75 events/s at 5ms p99).
                </li>
                <li>
                  <span className="font-semibold text-white">Technical lead</span> for the group's
                  student engineering portfolio: more than twenty applied-AI R&D projects across a
                  rotating intern cohort.
                </li>
              </ul>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Current Scope</h2>
              <ul className="space-y-3 text-lg text-white/70 leading-relaxed list-disc pl-6">
                <li>
                  Technical architecture ownership for applied research prototypes in industrial AI.
                </li>
                <li>
                  Prototype-to-pilot delivery, with reproducible and validated results, ready for
                  integration on a partner's system.
                </li>
                <li>
                  Privacy-by-design and auditable outputs for safety-critical industrial contexts.
                </li>
                <li>
                  Deliver partner pilots across two funded programmes: TeoÄly (ERDF, ~EUR 320k)
                  and ADINO (Business Finland, ten industrial partners).
                </li>
                <li>
                  Authored the group's EU AI Act position for its industrial offerings:
                  per-offering Annex III exposure and task-level rather than person-level
                  monitoring as a default design rule.
                </li>
              </ul>
            </div>

            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4 text-white">Focus Areas</h2>
              <ul className="space-y-3 text-lg text-white/70 leading-relaxed list-disc pl-6">
                <li>Multimodal industrial intelligence across sensors, machines, logs, and documents.</li>
                <li>Procedural knowledge extraction and knowledge graph construction from industrial documentation.</li>
                <li>Applied LLM systems with evaluation that accounts for how they fail.</li>
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
                It uses local LLM pipelines, schema-aware extraction, and measurable procedural
                fidelity, so industrial decision workflows stay explainable.
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
                  I'm open to working with research teams and industrial R&D partners on
                  multimodal industrial AI, procedural knowledge extraction, and AI systems that
                  have to reach deployment.
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
                    href="mailto:imadeddine200507@gmail.com"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    imadeddine200507@gmail.com
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
