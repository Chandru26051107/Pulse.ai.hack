import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Activity,
  TrendingUp,
  Clock,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  BarChart3,
  GitBranch,
  Shield,
  Database,
  Cpu,
  Bell,
  Users,
  Bed,
  Stethoscope,
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
            onClick={() => navigate("/auth")}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Sign In
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
              Internal Operations Platform
            </div>

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
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent/5 transition-colors no-underline"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics Strip */}
      <section className="py-8 px-6 border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-6 text-center">
            {[
              { icon: Bed, value: "Up to 10,000", label: "Bed capacity modeled" },
              { icon: Users, value: "Up to 8,000", label: "Staff positions tracked" },
              { icon: Clock, value: "30–180 min", label: "Prediction horizon" },
              { icon: Stethoscope, value: "5 Risk Levels", label: "From LOW to CRITICAL" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <item.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
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
                desc: "Operational metrics — arrivals, bed occupancy, staffing levels, and wait times — are ingested and analyzed continuously across all departments.",
                step: "01",
              },
              {
                icon: TrendingUp,
                title: "Predict",
                desc: "Machine learning models forecast overcrowding risk at 30 to 180-minute horizons, with confidence scores and lead-time estimates for each prediction.",
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

      {/* About / System Details */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-[family-name:var(--font-playfair)] font-bold">
              About the System
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
              pulseflow.ai is an internal decision-support platform designed
              for hospital operations teams. It combines real-time monitoring
              with predictive analytics to help staff anticipate and respond
              to emergency department overcrowding before it impacts patient
              care.
            </p>
          </motion.div>

          {/* Architecture overview */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Database,
                title: "Data Ingestion",
                desc: "Arrival volumes, bed occupancy rates, staffing levels, patient wait times, admission and discharge flows, and ambulance dispatch data are collected and processed in real time.",
              },
              {
                icon: Cpu,
                title: "Prediction Engine",
                desc: "A Random Forest classifier trained on historical patterns evaluates 15 engineered features to produce overcrowding probability scores across multiple time horizons.",
              },
              {
                icon: BarChart3,
                title: "Risk Analysis",
                desc: "Each prediction is decomposed into contributing factors — arrival rate, bed pressure, staff availability — so operators understand why risk is elevated, not just that it is.",
              },
              {
                icon: GitBranch,
                title: "Scenario Simulation",
                desc: "Before committing resources, teams can model the projected impact of adding beds, adjusting staffing, or managing surge conditions through the interactive simulator.",
              },
              {
                icon: Bell,
                title: "Early Warning",
                desc: "When risk crosses configured thresholds, the system surfaces alerts with lead times, allowing operations to prepare interventions 30 to 180 minutes before overcrowding occurs.",
              },
              {
                icon: Lightbulb,
                title: "Operational Guidance",
                desc: "Rule-based recommendations — bed preparation, staffing adjustments, discharge workflow reviews — are generated from current conditions to support decision-making.",
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

          {/* Tech details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="vintage-card rounded-xl p-8 bg-card"
          >
            <h3 className="text-lg font-[family-name:var(--font-playfair)] font-bold mb-4">
              Technical Details
            </h3>
            <div className="grid grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p><strong className="text-foreground">Model:</strong> Random Forest (200 trees, max depth 12)</p>
                <p><strong className="text-foreground">Baseline:</strong> Logistic Regression for comparison</p>
                <p><strong className="text-foreground">Features:</strong> 15 engineered operational metrics</p>
              </div>
              <div className="space-y-2">
                <p><strong className="text-foreground">Horizons:</strong> 30, 60, 90, 120, 180 minutes</p>
                <p><strong className="text-foreground">Risk Bands:</strong> LOW, MODERATE, HIGH, CRITICAL</p>
                <p><strong className="text-foreground">Explainability:</strong> Feature importance ranking</p>
              </div>
              <div className="space-y-2">
                <p><strong className="text-foreground">Data:</strong> Synthetic hospital operations data</p>
                <p><strong className="text-foreground">Scale:</strong> 2,000–10,000 beds modeled</p>
                <p><strong className="text-foreground">Response:</strong> Real-time dashboard updates</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-4">
              Predictions are model-derived estimates. Operational decisions should
              be verified with clinical and administrative staff before implementation.
            </p>
          </motion.div>
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
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Open Dashboard
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="vintage-divider mb-8" />
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <span className="font-[family-name:var(--font-playfair)] font-bold text-base">
                pulseflow.ai
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-lg">
              An internal capacity intelligence platform for hospital operations teams.
              Predictions are model-derived estimates and should be verified with
              clinical and administrative staff before informing decisions.
            </p>
            <div className="vintage-divider w-32 my-2" />
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} pulseflow.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
