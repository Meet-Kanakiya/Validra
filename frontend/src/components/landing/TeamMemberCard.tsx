import * as React from "react";
import { ShieldCheck, Users } from "lucide-react";
import { TeamMember } from "@/types/landing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, GithubIcon } from "@/components/shared";

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-300 group">
      <div>
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/30 to-emerald-600/30 border border-zinc-700 flex items-center justify-center text-zinc-200 group-hover:border-emerald-500/50 transition-colors">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white group-hover:text-emerald-300 transition-colors">
                {member.name}
              </CardTitle>
              <div className="text-xs font-medium text-emerald-400">
                {member.role}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-mono text-zinc-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            {member.domain}
          </div>

          <CardDescription className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {member.bio}
          </CardDescription>
        </CardHeader>
      </div>

      <CardContent className="p-0 pt-4 border-t border-zinc-800/70 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400">Smart India Hackathon 2026</span>
        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white inline-flex items-center gap-1 text-xs transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Code</span>
          </a>
        )}
      </CardContent>
    </Card>
  );
}
