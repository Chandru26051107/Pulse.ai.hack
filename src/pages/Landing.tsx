import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Activity,
  TrendingUp,
  Clock,
  Lightbulb,
  Zap,
  ArrowRight,
  ChevronRight,
  BarChart3,
  GitBranch,
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
            <span className="font-bold text-lg tracking-tight">
              pulseflow.ai
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
            <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-bold leading-tight tracking-tight">
              Predict. Explain.
              <br />
              <span className="text-accent">Prepare.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              An internal capacity intelligence platform that monitors
              emergency department conditions in real time, forecasts
              overcrowding before it occurs, and gives operations teams
              the insight to act proactively.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Open Dashboard
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
              How It Works
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              From data to decision in three steps
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Monitor",
                desc: "Operational metrics — arrivals, bed occupancy, staffing levels, and wait times — are ingested and analyzed continuously.",
                step: "01",
              },
              {
                icon: TrendingUp,
                title: "Predict",
                desc: "Machine learning models forecast overcrowding risk at 30 to 180-minute horizons, with confidence scores and lead-time estimates.",
                step: "02",
              },
              {
                icon: Lightbulb,
                title: "Prepare",
                desc: "Understand which factors are driving risk, test operational interventions in the scenario simulator, and act before conditions deteriorate.",
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
              Built for operations teams who need to see what is coming
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Multi-Horizon Forecasting",
                desc: "Risk projections at 30, 60, 90, 120, and 180-minute horizons, with the earliest warning threshold flagged automatically.",
              },
              {
                icon: Lightbulb,
                title: "Explainable Predictions",
                desc: "Top contributing factors ranked by importance, with directional context and plain-language summaries — no black box.",
              },
              {
                icon: GitBranch,
                title: "Scenario Simulator",
                desc: "Model the impact of adding beds, calling in staff, or managing surges — see projected risk change before committing resources.",
              },
              {
                icon: BarChart3,
                title: "Risk Analysis",
                desc: "Visual breakdown of which operational variables are most influential, with drill-down into model reasoning and factor weights.",
              },
              {
                icon: Activity,
                title: "Operational Recommendations",
                desc: "Actionable suggestions tied to current conditions — staffing adjustments, bed management, discharge workflow optimization.",
              },
              {
                icon: Clock,
                title: "Live Simulation",
                desc: "Deterministic scenarios that walk through escalating conditions and intervention outcomes — repeatable and consistent.",
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
              See the System in Action
            </h2>
            <p className="text-muted-foreground mb-8">
              The full monitoring, prediction, explanation, and intervention
              workflow — available now for your team.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Open Dashboard
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
              <span className="font-bold text-sm">pulseflow.ai</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 max-w-md text-right">
              Internal operational tool. Predictions are model-derived estimates
              and should be verified with clinical and administrative staff
              before informing decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
