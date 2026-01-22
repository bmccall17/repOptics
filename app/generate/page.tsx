"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ADR_TEMPLATE, ADR_README, CI_WORKFLOW, CODEOWNERS, README_TEMPLATE, AGENTS_MD_TEMPLATE, BASE_PACKAGE_JSON, TSCONFIG_TEMPLATE, ESLINT_CONFIG_TEMPLATE, VITEST_CONFIG_TEMPLATE, DOCKERFILE_TEMPLATE, DOCKER_COMPOSE_TEMPLATE } from "@/lib/templates";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Shield, FileText, CheckCircle, Box, Bot, Server, RefreshCw } from "lucide-react";

const STEPS = [
    { id: 1, title: "Identity", description: "Name and describe your project" },
    { id: 2, title: "Codebase", description: "Scaffolding and AI readiness" },
    { id: 3, title: "Governance", description: "Decision tracking and ownership" },
    { id: 4, title: "Operations", description: "CI/CD and Infrastructure" },
    { id: 5, title: "Review", description: "Confirm and generate" }
];

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  // Default values based on "best practice"
  const [includeADR, setIncludeADR] = useState(true);
  const [includeCI, setIncludeCI] = useState(true);
  const [includeGovernance, setIncludeGovernance] = useState(true);
  const [includeScaffold, setIncludeScaffold] = useState(false);
  const [includeAIContext, setIncludeAIContext] = useState(false);
  const [includeDocker, setIncludeDocker] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step === 1 && !projectName) {
      alert("Please enter a project name");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleGenerate = async () => {
    if (!projectName) {
      alert("Please enter a project name");
      return;
    }

    setIsGenerating(true);

    try {
      const zip = new JSZip();

      // README
      const readmeContent = README_TEMPLATE
        .replace("{PROJECT_NAME}", projectName)
        .replace("{DESCRIPTION}", description || "A new project with excellent hygiene.");
      zip.file("README.md", readmeContent);

      // ADRs
      if (includeADR) {
        zip.file("doc/architecture/decisions/README.md", ADR_README);
        const adr1 = ADR_TEMPLATE
          .replace("{NUMBER}", "0001")
          .replace("{TITLE}", "Record Architecture Decisions")
          .replace("{DATE}", new Date().toISOString().split('T')[0])
          .replace("{STATUS}", "Accepted")
          .replace("{CONTEXT}", "We need to record architectural decisions.")
          .replace("{DECISION}", "We will use ADRs.")
          .replace("{CONSEQUENCES}", "We will have a record of our decisions.");
        zip.file("doc/architecture/decisions/0001-record-architecture-decisions.md", adr1);
      }

      // CI
      if (includeCI) {
        zip.file(".github/workflows/ci.yml", CI_WORKFLOW);
      }

      // Governance
      if (includeGovernance) {
        zip.file("CODEOWNERS", CODEOWNERS);
        zip.file(".github/pull_request_template.md", "## Description\n\n## Changes\n\n## Checklist");
      }

      // AI Context
      if (includeAIContext) {
        const agentsMd = AGENTS_MD_TEMPLATE
            .replace("{DESCRIPTION}", description || "A new project.")
            .replace("{PROJECT_NAME}", projectName)
            .replace("{TESTING_FRAMEWORK}", "Vitest");
        zip.file("AGENTS.md", agentsMd);
      }

      // Docker
      if (includeDocker) {
        zip.file("Dockerfile", DOCKERFILE_TEMPLATE);
        zip.file("docker-compose.yml", DOCKER_COMPOSE_TEMPLATE);
      }

      // Project Scaffold
      if (includeScaffold) {
        // Create directory structure
        zip.folder("src");
        zip.folder("src/features");
        zip.folder("src/lib");
        zip.folder("src/components");

        // package.json
        const pkg = JSON.parse(JSON.stringify(BASE_PACKAGE_JSON));
        pkg.name = projectName.toLowerCase().replace(/\s+/g, '-');

        // Add Docker scripts if docker is included
        if (includeDocker) {
            pkg.scripts["docker:up"] = "docker-compose up";
            pkg.scripts["docker:build"] = "docker-compose build";
        }

        zip.file("package.json", JSON.stringify(pkg, null, 2));
        zip.file("tsconfig.json", TSCONFIG_TEMPLATE);
        zip.file("eslint.config.mjs", ESLINT_CONFIG_TEMPLATE);
        zip.file("vitest.config.ts", VITEST_CONFIG_TEMPLATE);

        // Simple index file
        zip.file("src/index.ts", "console.log('Hello World');");
      }

      // Generate Blob
      const content = await zip.generateAsync({ type: "blob" });
      
      // Download Hack
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-starter.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error(err);
      alert("Failed to generate zip");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStepInfo = STEPS.find(s => s.id === step);

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-12 text-zinc-50 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header & Nav */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link href="/" className="flex items-center text-sm text-zinc-400 hover:text-zinc-50 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <div className="text-right hidden md:block">
                <h1 className="text-xl font-bold tracking-tight">Project Generator</h1>
                <p className="text-xs text-zinc-500">Step {step} of {STEPS.length}: {currentStepInfo?.title}</p>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div
                className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
        </div>

        {/* Main Card */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 min-h-[400px] flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl">{currentStepInfo?.title}</CardTitle>
                <CardDescription className="text-zinc-400 text-base">{currentStepInfo?.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow space-y-6 pt-6">
                
                {/* Step 1: Identity */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="projectName" className="text-base">Project Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="projectName"
                                placeholder="my-awesome-service"
                                className="bg-zinc-950 border-zinc-700 focus:ring-zinc-600 text-lg py-6"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                autoFocus
                            />
                            <p className="text-xs text-zinc-500">The name of your repository and project.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What is the purpose of this project?"
                                className="bg-zinc-950 border-zinc-700 focus:ring-zinc-600 min-h-[120px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Codebase */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                         <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => setIncludeScaffold(!includeScaffold)}>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="scaffold"
                                    checked={includeScaffold}
                                    onCheckedChange={(c) => setIncludeScaffold(c === true)}
                                    className="border-zinc-600 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 mt-1"
                                />
                                <div className="grid gap-1.5 leading-none pointer-events-none">
                                    <Label htmlFor="scaffold" className="font-bold flex items-center gap-2 text-lg cursor-pointer">
                                        <Box className="h-5 w-5 text-orange-400"/> Include Starter Code
                                    </Label>
                                    <p className="text-sm text-zinc-400">
                                        Generates a standard TypeScript structure (<code>src/</code>, <code>package.json</code>, etc.) so you can start coding immediately.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => setIncludeAIContext(!includeAIContext)}>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="agents"
                                    checked={includeAIContext}
                                    onCheckedChange={(c) => setIncludeAIContext(c === true)}
                                    className="border-zinc-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 mt-1"
                                />
                                <div className="grid gap-1.5 leading-none pointer-events-none">
                                    <Label htmlFor="agents" className="font-bold flex items-center gap-2 text-lg cursor-pointer">
                                        <Bot className="h-5 w-5 text-teal-400"/> AI Agent Context
                                    </Label>
                                    <p className="text-sm text-zinc-400">
                                        Adds an <code>AGENTS.md</code> file. This acts as a &quot;readme for robots&quot;, helping AI coding assistants understand your project&apos;s rules and structure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Governance */}
                {step === 3 && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => setIncludeADR(!includeADR)}>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="adr"
                                    checked={includeADR}
                                    onCheckedChange={(c) => setIncludeADR(c === true)}
                                    className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
                                />
                                <div className="grid gap-1.5 leading-none pointer-events-none">
                                    <Label htmlFor="adr" className="font-bold flex items-center gap-2 text-lg cursor-pointer">
                                        <FileText className="h-5 w-5 text-blue-400"/> Architecture Decision Records
                                    </Label>
                                    <p className="text-sm text-zinc-400">
                                        Sets up <code>doc/architecture/decisions</code> to track significant design choices over time. Highly recommended for long-lived projects.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => setIncludeGovernance(!includeGovernance)}>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="gov"
                                    checked={includeGovernance}
                                    onCheckedChange={(c) => setIncludeGovernance(c === true)}
                                    className="border-zinc-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 mt-1"
                                />
                                <div className="grid gap-1.5 leading-none pointer-events-none">
                                    <Label htmlFor="gov" className="font-bold flex items-center gap-2 text-lg cursor-pointer">
                                        <Shield className="h-5 w-5 text-purple-400"/> Governance Files
                                    </Label>
                                    <p className="text-sm text-zinc-400">
                                        Includes <code>CODEOWNERS</code> for ownership definitions and Pull Request templates to standardize contributions.
                                    </p>
                                </div>
                            </div>
                        </div>
                     </div>
                )}

                {/* Step 4: Operations */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => setIncludeCI(!includeCI)}>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="ci"
                                    checked={includeCI}
                                    onCheckedChange={(c) => setIncludeCI(c === true)}
                                    className="border-zinc-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 mt-1"
                                />
                                <div className="grid gap-1.5 leading-none pointer-events-none">
                                    <Label htmlFor="ci" className="font-bold flex items-center gap-2 text-lg cursor-pointer">
                                        <CheckCircle className="h-5 w-5 text-green-400"/> CI Workflow (GitHub Actions)
                                    </Label>
                                    <p className="text-sm text-zinc-400">
                                         Adds a standard CI pipeline to run tests and linting on every push.
                                    </p>
                                </div>
                            </div>
                        </div>

                         <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => setIncludeDocker(!includeDocker)}>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="docker"
                                    checked={includeDocker}
                                    onCheckedChange={(c) => setIncludeDocker(c === true)}
                                    className="border-zinc-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600 mt-1"
                                />
                                <div className="grid gap-1.5 leading-none pointer-events-none">
                                    <Label htmlFor="docker" className="font-bold flex items-center gap-2 text-lg cursor-pointer">
                                        <Server className="h-5 w-5 text-cyan-400"/> Docker Infrastructure
                                    </Label>
                                    <p className="text-sm text-zinc-400">
                                        Includes <code>Dockerfile</code> and <code>docker-compose.yml</code> for containerized development and deployment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                 {/* Step 5: Review */}
                 {step === 5 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-zinc-950/50 rounded-lg p-6 border border-zinc-800 space-y-4">
                            <h3 className="font-bold text-lg border-b border-zinc-800 pb-2">Configuration Summary</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-zinc-500 text-sm block">Project</span>
                                    <span className="font-medium text-lg text-zinc-200">{projectName}</span>
                                </div>
                                 <div>
                                    <span className="text-zinc-500 text-sm block">Description</span>
                                    <span className="font-medium text-zinc-200 truncate block">{description || "(No description)"}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-zinc-500 text-sm block mb-2">Selected Modules</span>
                                <div className="flex flex-wrap gap-2">
                                    {includeScaffold && <span className="px-2 py-1 bg-orange-900/30 text-orange-400 border border-orange-900/50 rounded text-xs font-mono">Scaffold</span>}
                                    {includeAIContext && <span className="px-2 py-1 bg-teal-900/30 text-teal-400 border border-teal-900/50 rounded text-xs font-mono">AI Context</span>}
                                    {includeADR && <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded text-xs font-mono">ADRs</span>}
                                    {includeGovernance && <span className="px-2 py-1 bg-purple-900/30 text-purple-400 border border-purple-900/50 rounded text-xs font-mono">Governance</span>}
                                    {includeCI && <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-900/50 rounded text-xs font-mono">CI/CD</span>}
                                    {includeDocker && <span className="px-2 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 rounded text-xs font-mono">Docker</span>}

                                    {!includeScaffold && !includeAIContext && !includeADR && !includeGovernance && !includeCI && !includeDocker && (
                                        <span className="text-zinc-500 italic text-sm">No modules selected (just README)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                 )}

            </CardContent>

            <CardFooter className="flex justify-between border-t border-zinc-800 pt-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1 || isGenerating}
                    className="text-zinc-400 hover:text-zinc-50"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {step < 5 ? (
                     <Button onClick={handleNext} className="bg-white text-zinc-900 hover:bg-zinc-200">
                        Next Step <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                ) : (
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-8"
                    >
                        {isGenerating ? (
                            <>
                             <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Bundling...
                            </>
                        ) : (
                            <>
                            <Download className="mr-2 h-4 w-4" /> Download Starter Kit
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
      
      </div>
    </div>
  );
}
