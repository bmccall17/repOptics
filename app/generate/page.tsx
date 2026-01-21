"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ADR_TEMPLATE, ADR_README, CI_WORKFLOW, CODEOWNERS, README_TEMPLATE, AGENTS_MD_TEMPLATE, BASE_PACKAGE_JSON, TSCONFIG_TEMPLATE, ESLINT_CONFIG_TEMPLATE, VITEST_CONFIG_TEMPLATE, DOCKERFILE_TEMPLATE, DOCKER_COMPOSE_TEMPLATE } from "@/lib/templates";
import Link from "next/link";
import { ArrowLeft, Download, Shield, FileText, CheckCircle, Box, Bot, Server } from "lucide-react";

export default function GeneratePage() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [includeADR, setIncludeADR] = useState(true);
  const [includeCI, setIncludeCI] = useState(true);
  const [includeGovernance, setIncludeGovernance] = useState(true);
  const [includeScaffold, setIncludeScaffold] = useState(false);
  const [includeAIContext, setIncludeAIContext] = useState(false);
  const [includeDocker, setIncludeDocker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-12 text-zinc-50 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        
        <Link href="/" className="flex items-center text-sm text-zinc-400 hover:text-zinc-50">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <div className="space-y-2 text-center">
            <h1 className="text-4xl font-black tracking-tighter">Project Generator</h1>
            <p className="text-zinc-400">Bootstrap a new repository with perfect hygiene from Day 1.</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription className="text-zinc-400">Tell us about what you&apos;re building.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input 
                        id="projectName" 
                        placeholder="my-awesome-service" 
                        className="bg-zinc-950 border-zinc-700 focus:ring-zinc-600"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description" 
                        placeholder="It does things..." 
                        className="bg-zinc-950 border-zinc-700 focus:ring-zinc-600"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
            <CardHeader>
                <CardTitle>Hygiene Modules</CardTitle>
                <CardDescription className="text-zinc-400">Select which best practices to include.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <div className="flex items-start space-x-3">
                    <Checkbox 
                        id="adr" 
                        checked={includeADR} 
                        onCheckedChange={(c) => setIncludeADR(c === true)} 
                        className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="adr" className="font-bold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400"/> Architecture Decision Records (ADRs)
                        </Label>
                        <p className="text-sm text-zinc-400">
                            Includes <code>doc/architecture/decisions</code> folder and a template for decision logging.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Checkbox 
                        id="ci" 
                        checked={includeCI} 
                        onCheckedChange={(c) => setIncludeCI(c === true)} 
                        className="border-zinc-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="ci" className="font-bold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400"/> CI Workflow
                        </Label>
                        <p className="text-sm text-zinc-400">
                             Includes a basic GitHub Actions workflow for testing and linting.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Checkbox 
                        id="gov" 
                        checked={includeGovernance} 
                        onCheckedChange={(c) => setIncludeGovernance(c === true)} 
                        className="border-zinc-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="gov" className="font-bold flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-400"/> Governance Files
                        </Label>
                        <p className="text-sm text-zinc-400">
                            Includes <code>CODEOWNERS</code> and PR templates.
                        </p>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-4">
                    <h3 className="font-semibold mb-4 text-zinc-300">Advanced Setup</h3>
                    <div className="space-y-6">

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="scaffold"
                                checked={includeScaffold}
                                onCheckedChange={(c) => setIncludeScaffold(c === true)}
                                className="border-zinc-600 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="scaffold" className="font-bold flex items-center gap-2">
                                    <Box className="h-4 w-4 text-orange-400"/> Project Scaffold
                                </Label>
                                <p className="text-sm text-zinc-400">
                                    Generates <code>package.json</code>, <code>tsconfig.json</code>, <code>src/</code>, and configures ESLint & Vitest.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="agents"
                                checked={includeAIContext}
                                onCheckedChange={(c) => setIncludeAIContext(c === true)}
                                className="border-zinc-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="agents" className="font-bold flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-teal-400"/> AI Context
                                </Label>
                                <p className="text-sm text-zinc-400">
                                    Adds an <code>AGENTS.md</code> file to guide AI agents on project structure and rules.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="docker"
                                checked={includeDocker}
                                onCheckedChange={(c) => setIncludeDocker(c === true)}
                                className="border-zinc-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="docker" className="font-bold flex items-center gap-2">
                                    <Server className="h-4 w-4 text-cyan-400"/> Infrastructure (Docker)
                                </Label>
                                <p className="text-sm text-zinc-400">
                                    Includes <code>Dockerfile</code> and <code>docker-compose.yml</code>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>

        <Button 
            size="lg" 
            className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold"
            onClick={handleGenerate}
            disabled={isGenerating}
        >
            {isGenerating ? "Bundling..." : (
                <>
                <Download className="mr-2 h-4 w-4" /> Download Starter Kit (.zip)
                </>
            )}
        </Button>
      
      </div>
    </div>
  );
}
