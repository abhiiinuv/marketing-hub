import { TrafficCsvUpload } from "@/components/traffic/TrafficCsvUpload";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TrafficPage() {
  return (
    <div>
      <PageHeader
        title="Data Upload"
        description="Upload website traffic CSV. The dashboard chart updates for the whole team."
      />
      <TrafficCsvUpload />
    </div>
  );
}
