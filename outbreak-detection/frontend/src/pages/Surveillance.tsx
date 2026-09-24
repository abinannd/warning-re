import { useEffect, useState } from "react";
import { getCurrentCycle, getCycleStatus, submitReport, validateReport } from "../api/surveillance";
import type { SurveillanceCycle, CycleStatus, SurveillanceReportRequest, SurveillanceReportResponse } from "../types/surveillance";

export default function Surveillance() {
  const [cycle, setCycle] = useState<SurveillanceCycle | null>(null);
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitResult, setSubmitResult] = useState<SurveillanceReportResponse | null>(null);

  useEffect(() => {
    getCurrentCycle()
      .then((cycleRes) => {
        setCycle(cycleRes);
        return getCycleStatus(cycleRes.id);
      })
      .then((statusRes) => {
        setStatus(statusRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleTestSubmit = async () => {
    try {
      const mockReport: SurveillanceReportRequest = {
        districtId: "thiruvananthapuram",
        talukId: "neyyattinkara",
        disease: "dengue",
        newCases: 5
      };
      const valid = await validateReport(mockReport);
      const res = await submitReport(valid);
      setSubmitResult(res);
    } catch (err: any) {
      alert("Error submitting: " + err.message);
    }
  };

  if (loading) return <div>Loading surveillance data...</div>;
  if (error) return <div>Error loading surveillance: {error}</div>;

  return (
    <div>
      <h1>Surveillance</h1>

      <section style={{ marginBottom: "20px" }}>
        <h2>Current Cycle</h2>
        {cycle ? (
          <pre>{JSON.stringify(cycle, null, 2)}</pre>
        ) : (
          <div>No active cycle.</div>
        )}
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Cycle Status</h2>
        {status ? (
          <pre>{JSON.stringify(status, null, 2)}</pre>
        ) : (
          <div>No status available.</div>
        )}
      </section>

      <section>
        <h2>Test Submission</h2>
        <button onClick={handleTestSubmit}>Submit Mock Report</button>
        {submitResult && (
          <div style={{ marginTop: "10px" }}>
            <h3>Result:</h3>
            <pre>{JSON.stringify(submitResult, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
