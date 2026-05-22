import { CollabManager } from "@/components/collabs/CollabManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CollabsPage() {
  return (
    <div>
      <PageHeader
        title="YouTuber Collaborations"
        description="Track creator deals, costs, status, and links."
      />
      <CollabManager />
    </div>
  );
}
