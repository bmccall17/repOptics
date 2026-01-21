import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-12 text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24 bg-zinc-800" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-zinc-800" />
          <Skeleton className="h-4 w-48 bg-zinc-800" />
        </div>

        <Skeleton className="h-48 w-full bg-zinc-800 rounded-lg" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 bg-zinc-800 rounded-lg" />
          <Skeleton className="h-32 bg-zinc-800 rounded-lg" />
          <Skeleton className="h-32 bg-zinc-800 rounded-lg" />
          <Skeleton className="h-32 bg-zinc-800 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Skeleton className="h-48 bg-zinc-800 rounded-lg" />
           <Skeleton className="h-48 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
