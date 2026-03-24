"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NeonShimmerBorder } from "@/components/neon-shimmer-border"
import { IMessageDemo } from "@/components/imessage-demo"
import { LandingSections } from "@/components/landing-sections"
import { useRef } from "react"

export default function Page() {
  const demoRef = useRef<HTMLElement>(null)

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen">
        {/* Video Container */}
        <div className="absolute inset-3 overflow-hidden rounded-2xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="/images/39ac4a1d00fe62912ef5445b3325389a7cb588d5.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-neutral-900/40" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, #f43f8f 0%, #f97316 100%)", mixBlendMode: "multiply" }} />
        </div>

        {/* Neon Shimmer Border */}
        <NeonShimmerBorder />

        {/* Logo — top left */}
        <div className="absolute top-0 left-0 z-20">
          <div className="rounded-br-[28px] bg-background p-3 pr-4 pb-4">
            <Image
              src="/images/teammate-logo.png"
              alt="Teammate Logo"
              width={56}
              height={56}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Docs button — top right */}
        <div className="absolute top-0 right-0 z-20">
          <div className="rounded-bl-[28px] bg-background p-3 pl-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="shimmer-button rounded-md border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              asChild
            >
              <a href="https://github.com/notandruu/teammate" target="_blank" rel="noopener noreferrer">
                Learn more
              </a>
            </Button>
          </div>
        </div>

        {/* Scroll indicator — bottom right */}
        <button
          onClick={scrollToDemo}
          className="absolute bottom-10 right-10 z-10 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Scroll down"
        >
          <svg width="28" height="42" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="26" height="40" rx="13" stroke="white" strokeWidth="1.5"/>
            <rect x="12.25" y="8" width="3.5" height="7" rx="1.75" fill="white">
              <animate attributeName="y" values="8;16;8" dur="1.6s" repeatCount="indefinite" calcMode="ease-in-out"/>
              <animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite" calcMode="ease-in-out"/>
            </rect>
          </svg>
        </button>

        {/* Hero Copy — bottom left */}
        <div className="absolute bottom-12 left-12 z-10 max-w-md">
          <h1 className="font-serif text-3xl font-normal leading-tight text-white/90 md:text-4xl">
            Bring sports betting
            <br />
            into your group chat
            <br />
            with AI agents.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Sync with friends, propose bets, vote, and auto-execute on Polymarket. All over iMessage.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={scrollToDemo}
              className="rounded-full border border-white bg-transparent px-5 py-2 text-sm text-white hover:bg-white hover:text-neutral-900"
            >
              See how it works
            </Button>
            <Button
              className="rounded-full bg-white px-5 py-2 text-sm text-neutral-900 hover:bg-white/90"
              asChild
            >
              <a href="https://github.com/notandruu/teammate" target="_blank" rel="noopener noreferrer">
                Add to iMessage
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        ref={demoRef}
        className="bg-background py-24 px-5 flex flex-col items-center"
      >
        <div className="mb-12 text-center max-w-md">
          <p className="font-serif text-2xl font-normal leading-snug text-foreground">
            The best part about betting isn't making money. It's doing it with friends.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Teammate turns your iMessage group chat into a mini hedge fund. No app required.
          </p>
        </div>
        <IMessageDemo />
      </section>

      {/* Landing Sections */}
      <LandingSections onScrollToDemo={scrollToDemo} />
    </main>
  )
}
