import { TrafficDashboard } from "@/components/traffic/TrafficDashboard";

export default function TrafficPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Website Traffic</h1>
        <p className="mt-1 text-zinc-400">
          Upload traffic CSVs and overlay marketing events as pins on the chart.
        </p>
      </header>
      <TrafficDashboard />
    </div>
  );
}
