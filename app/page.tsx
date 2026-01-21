"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Search } from "lucide-react";

export default function Home() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repo) return;
    
    // Simple validation
    if (!repo.includes("/")) {
      alert("Please enter a valid owner/repo (e.g., facebook/react)");
      return;
    }

    setLoading(true);
    // Redirect to the dashboard page with the repo as a query param or path
    // Format: /report/owner/repo
    router.push(`/report/${repo}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-950">
              <Github className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            repOptics
          </h1>
          <p className="text-zinc-400">
            Developer hygiene optics for the modern Product Manager.
            <br />
            Scan your repo. Face the truth.
          </p>
        </div>

        <form onSubmit={handleScan} className="flex flex-col space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="repo" className="text-sm font-medium text-zinc-400">
              Repository (owner/repo)
            </label>
            <div className="relative">
              <Input
                id="repo"
                placeholder="e.g. facebook/react"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500">
              * Works best with public repos. For private repos, use the CLI (Coming Soon).
            </p>
          </div>
          <Button type="submit" disabled={loading} size="lg" className="bg-white text-black hover:bg-zinc-200">
            {loading ? "Scanning..." : "Scan Repo"}
          </Button>
        </form>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-left text-sm text-zinc-400">
          <p className="font-medium text-zinc-200 mb-1">Why use this?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Find missing ADRs & architecture docs.</li>
            <li>Verify delivery hygiene (CI, PR templates).</li>
            <li>Get a prioritized todo list to fix it.</li>
          </ul>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">Or start fresh</span>
            </div>
        </div>

        <Button 
            variant="outline" 
            className="w-full border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900"
            onClick={() => router.push("/generate")}
        >
            Generate New Project Starter
        </Button>
      </div>
    </main>
  );
}
