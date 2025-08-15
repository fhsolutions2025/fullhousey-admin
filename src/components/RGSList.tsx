import { useEffect, useState } from "react";
import axios from "axios";

interface Rule {
  _id: string;
  title: string;
  description: string;
}

export default function RGSList() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/rgs/get");
      setRules(res.data.rules);
    } catch (error) {
      console.error("❌ Failed to fetch rules:", error);
    }
    setLoading(false);
  };

  const deleteRule = async (id: string) => {
    try {
      const res = await axios.delete(`/api/rgs/delete?id=${id}`);
      if (res.status === 200) {
        setRules(rules.filter((rule) => rule._id !== id));
        setMessage("✅ Rule deleted.");
      }
    } catch (err) {
      console.error("❌ Failed to delete rule:", err);
      setMessage("❌ Error deleting rule.");
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Existing Rules</h2>
      {loading ? (
        <p>Loading...</p>
      ) : rules.length === 0 ? (
        <p>No rules found.</p>
      ) : (
        <ul className="space-y-3">
          {rules.map((rule) => (
            <li key={rule._id} className="border p-4 rounded relative">
              <h3 className="font-bold">{rule.title}</h3>
              <p className="text-sm">{rule.description}</p>
              <button
                onClick={() => deleteRule(rule._id)}
                className="absolute top-2 right-2 text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
