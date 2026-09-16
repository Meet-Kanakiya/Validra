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
      <div className="p-8 rounded-xl bg-green-50 border border-green-200 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-white border border-green-200 text-green-700 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-slate-900">Inquiry Received</h4>
        <p className="text-sm text-slate-600 max-w-sm">
          Thank you for reaching out. Team VisionMinds will respond to your regulatory inquiry shortly.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
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
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            placeholder="Inspector Rajesh Kumar"
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Official Email
          </label>
          <input
            type="email"
            required
            placeholder="rajesh@nic.in"
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Subject / Organization
        </label>
        <input
          type="text"
          required
          placeholder="Legal Metrology Department Inquiry"
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Message
        </label>
        <textarea
          rows={4}
          required
          placeholder="Describe your inquiry or requirement..."
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 shadow-xs transition-colors resize-none"
        />
      </div>

      <Button type="submit" className="w-full justify-center bg-green-700 hover:bg-green-800 text-white font-medium shadow-xs">
        <Send className="w-4 h-4 mr-2" />
        <span>Submit Inquiry</span>
      </Button>
    </form>
  );
}
