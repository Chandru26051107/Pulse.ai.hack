import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Activity,
  Shield,
  TrendingUp,
  Clock,
  Lightbulb,
  Zap,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="font-[family-name:var(--font-playfair)] font-bold text-lg">
              PulseFlow AI
            </span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Open Dashboard
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-8">
              <Shield className="w-3 h-3" />
              Emergency Department Early Warning System
            </div>

            <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-bold leading-tight tracking-tight">
              Predict. Explain.
              <br />
              <span className="text-accent">Prepare.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              PulseFlow AI monitors emergency department capacity in real time,
              predicts overcrowding before it happens, explains why, and helps
              administrators test interventions — all before the waiting room
              fills up.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent/5 transition-colors no-underline"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Loop */}
      <section className="py-16 px-6 bg-card border-y border-border vintage-texture">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-[family-name:var(--font-playfair)] font-bold">
              The Intelligence Loop
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              From data to decisions in three clear steps
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Monitor",
                desc: "Real-time hospital operational metrics — arrivals, beds, staffing, wait times — processed and analyzed continuously.",
                step: "01",
              },
              {
                icon: TrendingUp,
                title: "Predict",
                desc: "AI models forecast overcrowding risk 30–180 minutes ahead, with confidence scores and clear lead times.",
                step: "02",
              },
              {
                icon: Lightbulb,
                title: "Prepare",
                desc: "Understand why risk is rising, test hypothetical interventions in the simulator, and act before overcrowding occurs.",
                step: "03",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="vintage-card bg-background rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-border">
                    {item.step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <item.icon className="w-4.5 h-4.5 text-accent" />
                  </div>
                </div>
                <h3 className="text-lg font-[family-name:var(--font-playfair)] font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-[family-name:var(--font-playfair)] font-bold">
              Capabilities
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Built for hospital command centers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Multi-Horizon Forecasting",
                desc: "Risk predictions at 30, 60, 90, 120, and 180-minute horizons — with the earliest warning threshold clearly flagged.",
              },
              {
                icon: Lightbulb,
                title: "Explainable Predictions",
                desc: "Top contributing factors ranked by importance, with direction and plain-language summaries — no black box.",
              },
              {
                icon: Zap,
                title: "What-if Simulation",
                desc: "Test adding beds, calling in staff, or managing surges — see predicted risk change in real time.",
              },
              {
                icon: Clock,
                title: "Live Demo Mode",
                desc: "Deterministic scenarios that walk through NORMAL → SURGE → CRITICAL → INTERVENTION — repeatable for demos.",
              },
              {
                icon: Shield,
                title: "Synthetic Data Only",
                desc: "No real patient data, no PII. Every metric is generated from realistic hospital operational patterns.",
              },
              {
                icon: Activity,
                title: "Operational Recommendations",
                desc: "Rule-based suggestions tied to current conditions — staffing, bed management, discharge workflow.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-xl border border-border hover:bg-card/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-card border-y border-border vintage-texture">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-[family-name:var(--font-playfair)] font-bold mb-4">
              See the Prediction in Action
            </h2>
            <p className="text-muted-foreground mb-8">
              Experience the full monitoring → prediction → explanation →
              intervention workflow. Interactive demo with synthetic data.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Launch PulseFlow AI
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="vintage-divider mb-6" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="font-[family-name:var(--font-playfair)] font-semibold text-sm">
                PulseFlow AI
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 max-w-md text-right">
              Prototype demonstration using synthetic hospital operations data.
              Predictions are not clinically validated and should not be used as
              a substitute for professional medical or operational judgment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
