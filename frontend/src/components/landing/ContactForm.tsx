"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/shared";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-white">Inquiry Received</h4>
        <p className="text-sm text-zinc-400 max-w-sm">
          Thank you for reaching out. Team VisionMinds will respond to your regulatory inquiry shortly.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            placeholder="Inspector Rajesh Kumar"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Official Email
          </label>
          <input
            type="email"
            required
            placeholder="rajesh@nic.in"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          Subject / Organization
        </label>
        <input
          type="text"
          required
          placeholder="Legal Metrology Department Inquiry"
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          Message
        </label>
        <textarea
          rows={4}
          required
          placeholder="Describe your inquiry or requirement..."
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      <Button variant="glow" type="submit" className="w-full justify-center">
        <Send className="w-4 h-4 mr-2 text-zinc-950" />
        <span>Submit Inquiry</span>
      </Button>
    </form>
  );
}
