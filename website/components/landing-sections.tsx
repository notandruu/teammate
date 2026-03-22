"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

function useSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return { ref, inView }
}

function HowItWorks({ onScrollToDemo }: { onScrollToDemo: () => void }) {
  const { ref, inView } = useSection()

  const steps = [
    {
      number: "01",
      label: "Add teammate to your group chat",
      body: "Run teammate on your Mac. It watches your iMessage threads and stays silent until there's betting intent.",
    },
    {
      number: "02",
      label: "Pool money and propose a bet",
      body: "Anyone can deposit funds and propose a bet in plain English. No commands, no syntax. Just text how you'd normally text.",
    },
    {
      number: "03",
      label: "Vote and auto-execute",
      body: "2/3 majority triggers an automatic trade on Polymarket. Winnings split proportionally when the market resolves.",
    },
  ]

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-32">
      <motion.p
        variants={fadeIn}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.5 }}
        className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        How it works
      </motion.p>
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="font-serif text-3xl font-normal leading-snug text-foreground md:text-4xl text-balance"
      >
        Three steps from group chat
        <br />
        to winning payout.
      </motion.h2>

      <div className="mt-16 grid gap-px border border-border bg-border md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
            className="flex flex-col gap-6 bg-background p-8"
          >
            <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
            <div>
              <p className="text-base font-medium text-foreground">{step.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FeatureStatement() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Conversation-native
            </p>
            <h2 className="font-serif text-3xl font-normal leading-snug text-foreground md:text-4xl text-balance">
              The interface is your group chat.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-6"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your friends are already texting about the game. teammate lives inside that same thread. Every deposit, proposal, and vote is just a text message. No app to download, no link to open, no UI to navigate.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Natural language parsing means you say things however you'd naturally text them. "lfg" counts as a yes vote. "im out" counts as a no. teammate understands your group chat's language.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const { ref, inView } = useSection()

  const features = [
    {
      name: "Pool-based betting",
      description: "Everyone contributes to a shared pool. Stakes and winnings scale with each person's share automatically.",
    },
    {
      name: "Democratic votes",
      description: "Propose any bet. 2/3 weighted majority required, weighted by how much you put in. Skin in the game matters.",
    },
    {
      name: "Polymarket execution",
      description: "Bets execute directly on Polymarket's prediction markets. Real odds, real liquidity, real payouts in USDC.",
    },
    {
      name: "Zero commands",
      description: "Claude Haiku parses every message. Normal chat is ignored. Betting intent triggers the right action every time.",
    },
  ]

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-32">
      <motion.p
        variants={fadeIn}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.5 }}
        className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        Features
      </motion.p>
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mb-16 font-serif text-3xl font-normal leading-snug text-foreground md:text-4xl text-balance"
      >
        Built for how friends actually bet.
      </motion.h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f, i) => (
          <motion.div
            key={f.name}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.09 }}
            className="rounded-lg border border-border bg-card p-7"
          >
            <p className="text-sm font-medium text-foreground">{f.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function BrandStatement() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-36 text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl font-normal leading-tight text-foreground md:text-5xl text-balance"
        >
          The best part about betting isn't making money. It's doing it with friends.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground"
        >
          teammate turns your iMessage group chat into a mini hedge fund. No app required.
        </motion.p>
      </div>
    </section>
  )
}


function CallToAction({ onScrollToDemo }: { onScrollToDemo: () => void }) {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-36">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.7 }}
            className="font-serif text-4xl font-normal leading-tight text-foreground md:text-5xl text-balance"
          >
            Bet with your
            <br />
            group chat tonight.
          </motion.h2>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex gap-3"
          >
            <Button
              onClick={onScrollToDemo}
              size="lg"
              variant="outline"
              className="gap-2 rounded-full px-7 py-5 text-sm"
            >
              Watch demo
            </Button>
            <Button
              size="lg"
              className="gap-2 rounded-full border border-foreground bg-transparent px-7 py-5 text-sm text-foreground hover:bg-foreground hover:text-background"
              asChild
            >
              <a href="https://github.com/notandruu/teammate" target="_blank" rel="noopener noreferrer">
                Get started
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">teammate</span>
        <a
          href="https://github.com/notandruu/teammate"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          github.com/notandruu/teammate
        </a>
      </div>
    </footer>
  )
}

export function LandingSections({ onScrollToDemo }: { onScrollToDemo: () => void }) {
  return (
    <>
      <HowItWorks onScrollToDemo={onScrollToDemo} />
      <FeatureStatement />
      <FeaturesGrid />
      <BrandStatement />
      <CallToAction onScrollToDemo={onScrollToDemo} />
      <Footer />
    </>
  )
}
