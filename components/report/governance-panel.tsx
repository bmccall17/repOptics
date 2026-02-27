import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Shield, Book, Bot, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { RepoEvidence } from "@/lib/scanner";

interface GovernancePanelProps {
  evidence: RepoEvidence;
}

function GuardrailItem({ label, enabled, details }: { label: string; enabled: boolean; details: string }) {
  return (
    <div className={cn(
      "p-4 rounded-lg border text-center",
      enabled
        ? "border-green-900/50 bg-green-950/20"
        : "border-zinc-800 bg-zinc-950"
    )}>
      <div className="flex justify-center mb-2">
        {enabled ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-zinc-600" />
        )}
      </div>
      <div className={cn("text-sm font-medium", enabled ? "text-green-400" : "text-zinc-500")}>
        {label}
      </div>
      <div className="text-xs text-zinc-500 mt-1">{details}</div>
    </div>
  );
}

export function GovernancePanel({ evidence }: GovernancePanelProps) {
  return (
    <div className="space-y-6">
      {/* Governance & Compliance */}
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Governance & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Codeowners */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Shield className="h-3 w-3" /> Code Ownership
              </h3>
              {evidence.hasCodeowners ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-xs font-mono text-zinc-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {evidence.codeownersContent}
                </div>
              ) : (
                <div className="p-4 bg-red-950/10 border border-red-900/20 rounded text-red-400 text-sm">
                  Missing CODEOWNERS file.
                </div>
              )}
            </div>

            {/* Contributing & Agents */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Book className="h-3 w-3" /> Contribution Guidelines
                </h3>
                {evidence.hasContributing ? (
                  <div className="flex items-center gap-2 p-2 bg-green-950/10 border border-green-900/20 rounded text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>CONTRIBUTING.md present ({evidence.contributingContent?.length} bytes)</span>
                  </div>
                ) : (
                  <div className="p-2 bg-yellow-950/10 border border-yellow-900/20 rounded text-yellow-400 text-sm">
                    No CONTRIBUTING.md found.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Bot className="h-3 w-3" /> AI Readiness
                </h3>
                {evidence.hasAgents ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
                    <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                      <CheckCircle className="h-4 w-4" /> AGENTS.md detected
                    </div>
                    <div className="text-xs font-mono text-zinc-500 line-clamp-3">
                      {evidence.agentsContent}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> No AGENTS.md found.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Shield className="h-3 w-3" /> Project Governance
                </h3>
                {evidence.hasGovernance ? (
                  <div className="flex items-center gap-2 p-2 bg-green-950/10 border border-green-900/20 rounded text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>GOVERNANCE.md present</span>
                  </div>
                ) : (
                  <div className="p-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> No explicit GOVERNANCE.md found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardrails & Security */}
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Guardrails &amp; Security
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Branch protection, automated scanning, and security features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GuardrailItem
              label="Branch Protection"
              enabled={evidence.guardrails.hasBranchProtection}
              details={evidence.guardrails.hasBranchProtection ? "Enabled" : "Not detected"}
            />
            <GuardrailItem
              label="Required Reviews"
              enabled={evidence.guardrails.requiresReviews}
              details={evidence.guardrails.requiresReviews
                ? `${evidence.guardrails.requiredReviewers} reviewer${evidence.guardrails.requiredReviewers !== 1 ? "s" : ""}`
                : "Not required"}
            />
            <GuardrailItem
              label="CI Status Checks"
              enabled={evidence.guardrails.requiresStatusChecks}
              details={evidence.guardrails.requiresStatusChecks
                ? `${evidence.guardrails.statusChecks.length} check${evidence.guardrails.statusChecks.length !== 1 ? "s" : ""}`
                : "Not required"}
            />
            <GuardrailItem
              label="Dependabot"
              enabled={evidence.guardrails.hasDependabot}
              details={evidence.guardrails.hasDependabot ? "Configured" : "Not found"}
            />
            <GuardrailItem
              label="Secret Scanning"
              enabled={evidence.guardrails.hasSecretScanning}
              details={evidence.guardrails.hasSecretScanning ? "Enabled" : "Not detected"}
            />
            <GuardrailItem
              label="Code Scanning"
              enabled={evidence.guardrails.hasCodeScanning}
              details={evidence.guardrails.hasCodeScanning ? "Workflow found" : "Not found"}
            />
            <GuardrailItem
              label="Snyk"
              enabled={evidence.guardrails.hasSnyk}
              details={evidence.guardrails.hasSnyk ? evidence.guardrails.snykDetails.join(", ") : "Not found"}
            />
          </div>

          {evidence.guardrails.statusChecks.length > 0 && (
            <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded">
              <h4 className="text-xs font-medium text-zinc-400 uppercase mb-2">Required Status Checks</h4>
              <div className="flex flex-wrap gap-2">
                {evidence.guardrails.statusChecks.map((check, i) => (
                  <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300">
                    {check}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
