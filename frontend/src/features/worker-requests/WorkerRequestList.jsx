import WorkerRequestListCard from "./WorkerRequestListCard";

export default function WorkerRequestList({ requests = [] }) {
  if (!requests.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
        No requests match your current filters.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {requests.map((request) => (
        <WorkerRequestListCard key={request.id} request={request} />
      ))}
    </div>
  );
}
