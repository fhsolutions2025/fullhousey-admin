import RGSForm from "@/components/RGSForm";
import RGSList from "@/components/RGSList";

export default function RGSAdminPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🎯 Rule Governance System (RGS)</h1>
      <p className="mb-8 text-sm text-gray-600">
        Use this admin panel to manage game rules for backend logic. Rules added here are auto-linked to MongoDB.
      </p>
      
      <RGSForm />
      <RGSList />
    </div>
  );
}
