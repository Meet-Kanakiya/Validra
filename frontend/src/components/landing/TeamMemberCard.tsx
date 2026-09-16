import * as React from "react";
import { ShieldCheck, Users } from "lucide-react";
import { TeamMember } from "@/types/landing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, GithubIcon } from "@/components/shared";

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="flex flex-col justify-between border-slate-200 bg-white shadow-xs rounded-xl group p-6">
      <div>
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-700 transition-colors">
              <Users className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 group-hover:text-green-800 transition-colors">
                {member.name}
              </CardTitle>
              <div className="text-xs font-medium text-green-700">
                {member.role}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
            {member.domain}
          </div>

          <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {member.bio}
          </CardDescription>
        </CardHeader>
      </div>

      <CardContent className="p-0 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Smart India Hackathon 2026</span>
        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 text-xs transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Code</span>
          </a>
        )}
      </CardContent>
    </Card>
  );
}
