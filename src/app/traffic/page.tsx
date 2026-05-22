import { TrafficCsvUpload } from "@/components/traffic/TrafficCsvUpload";

export default function TrafficPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Data Upload</h1>
        <p className="mt-1 text-zinc-400">
          Upload website traffic CSV. The chart on the dashboard updates for the whole team.
        </p>
      </header>
      <TrafficCsvUpload />
    </div>
  );
}
