import Link from "next/link";
import { ArrowRight, BookOpen, BarChart3, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: BookOpen,
    title: "Bluebook-Style Interface",
    description:
      "Split-pane layout, question navigator, and test tools designed to mirror the real exam experience.",
  },
  {
    icon: Target,
    title: "SAT & ACT Coverage",
    description:
      "Reading and Writing passages, vocabulary, grammar, punctuation, and rhetoric questions across multiple exam sets.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your accuracy trends, identify weak areas, and focus your study time where it matters most.",
  },
];

const examSections = [
  {
    exam: "SAT",
    sections: [
      "Reading & Writing - Module 1",
      "Reading & Writing - Module 2",
      "Vocabulary & Grammar",
    ],
  },
  {
    exam: "ACT",
    sections: ["English (Grammar & Rhetoric)", "Reading Comprehension"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-xl font-bold tracking-tight">ExamPrep</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Master SAT & ACT
            <br />
            <span className="text-muted-foreground">English.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Practice with a test interface that feels like the real thing.
            Instant feedback, detailed explanations, and analytics to track your
            progress.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Start Practicing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight">
            Everything you need to prepare.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Coverage */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight">
            Comprehensive exam coverage.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {examSections.map((item) => (
              <div
                key={item.exam}
                className="rounded-xl border border-border p-6 space-y-4"
              >
                <h3 className="text-xl font-bold">{item.exam}</h3>
                <ul className="space-y-2.5">
                  {item.sections.map((section) => (
                    <li
                      key={section}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-foreground" />
                      {section}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Interface Preview */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight">
            A test interface that feels real.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Inspired by the Bluebook app &mdash; split-pane passages, question
            navigator, option eliminator, and mark-for-review.
          </p>
          <div className="mt-10 rounded-xl border border-border overflow-hidden">
            {/* Mock UI preview */}
            <div className="border-b border-border bg-muted px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="font-medium">Reading Comprehension</span>
              <span className="font-mono text-muted-foreground">23:45</span>
              <span className="text-muted-foreground">Highlight &middot; Notes</span>
            </div>
            <div className="grid md:grid-cols-2 min-h-[280px]">
              <div className="border-r border-border p-6 text-sm text-muted-foreground leading-relaxed">
                <p>
                  The Arctic fox is one of nature&apos;s most remarkable
                  survivors. Unlike most animals that migrate to warmer climates
                  during winter, the Arctic fox thrives in temperatures as low as
                  minus 50 degrees Celsius...
                </p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm font-medium">
                  According to the passage, which adaptation helps the Arctic fox
                  survive periods without food?
                </p>
                <div className="space-y-2">
                  {[
                    "A) Changing fur color",
                    "B) Compact body shape",
                    "C) Reducing its metabolic rate",
                    "D) Fur on the soles of its feet",
                  ].map((choice, i) => (
                    <div
                      key={choice}
                      className={`rounded-lg border px-4 py-2.5 text-sm ${
                        i === 2
                          ? "border-foreground bg-foreground text-background font-medium"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {choice}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-muted px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">&larr; Back</span>
              <span className="rounded-md bg-foreground text-background px-3 py-1 font-medium">
                Question 3 of 10
              </span>
              <span className="text-muted-foreground">Next &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to start practicing?
          </h2>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>ExamPrep</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
