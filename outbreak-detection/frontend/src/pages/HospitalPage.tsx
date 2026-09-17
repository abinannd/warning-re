import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Select, Input, Textarea, Button, LoadingState, ErrorState, EmptyState } from '../components/ui';
import { fetchDistricts, fetchTaluks, fetchCurrentCycle, submitHospitalReport, validateHospitalReport } from '../api';
import type { District, Taluk, SurveillanceCycle, HospitalReport, SubmissionReceipt } from '../types';

export function HospitalPage() {
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [disease, setDisease] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [newCases, setNewCases] = useState('');
  const [activeCases, setActiveCases] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [cycle, setCycle] = useState<SurveillanceCycle | null>(null);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingTaluks, setLoadingTaluks] = useState(false);
  const [loadingCycle, setLoadingCycle] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<SubmissionReceipt | null>(null);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'district':
        if (!value) return 'District is required';
        return undefined;
      case 'taluk':
        if (!value) return 'Taluk is required';
        return undefined;
      case 'disease':
        if (!value) return 'Disease is required';
        return undefined;
      case 'reportDate':
        if (!value) return 'Report Date is required';
        return undefined;
      case 'newCases':
        if (!value) return 'New Cases is required';
        const num = Number(value);
        if (isNaN(num)) return 'New Cases must be a number';
        if (num < 0) return 'New Cases must be non-negative';
        if (!Number.isInteger(num)) return 'New Cases must be a whole number';
        return undefined;
      case 'activeCases':
        if (value) {
          const num = Number(value);
          if (isNaN(num)) return 'Active Cases must be a number';
          if (num < 0) return 'Active Cases must be non-negative';
          if (!Number.isInteger(num)) return 'Active Cases must be a whole number';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  };

  const handleChange = (name: string, value: string) => {
    switch (name) {
      case 'district':
        setDistrict(value);
        if (value === '') setTaluk('');
        break;
      case 'taluk':
        setTaluk(value);
        break;
      case 'disease':
        setDisease(value);
        break;
      case 'reportDate':
        setReportDate(value);
        break;
      case 'newCases':
        setNewCases(value);
        break;
      case 'activeCases':
        setActiveCases(value);
        break;
      case 'remarks':
        setRemarks(value);
        break;
    }
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    const fields = ['district', 'taluk', 'disease', 'reportDate', 'newCases', 'activeCases'];
    fields.forEach(name => {
      const value = name === 'district' ? district :
                    name === 'taluk' ? taluk :
                    name === 'disease' ? disease :
                    name === 'reportDate' ? reportDate :
                    name === 'newCases' ? newCases :
                    activeCases;
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    return !hasErrors;
  };

  const loadDistricts = useCallback(async () => {
    setLoadingDistricts(true);
    try {
      const data = await fetchDistricts();
      setDistricts(data);
    } catch (err) {
      console.error('Failed to load districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const loadTaluks = useCallback(async (districtId: string) => {
    setLoadingTaluks(true);
    setTaluks([]);
    try {
      const data = await fetchTaluks(districtId);
      setTaluks(data);
    } catch (err) {
      console.error('Failed to load taluks:', err);
    } finally {
      setLoadingTaluks(false);
    }
  }, []);

  const loadCycle = useCallback(async () => {
    setLoadingCycle(true);
    try {
      const data = await fetchCurrentCycle();
      setCycle(data);
    } catch (err) {
      console.error('Failed to load surveillance cycle:', err);
    } finally {
      setLoadingCycle(false);
    }
  }, []);

  useEffect(() => {
    loadDistricts();
    loadCycle();
  }, [loadDistricts, loadCycle]);

  useEffect(() => {
    if (district) {
      loadTaluks(district);
    } else {
      setTaluks([]);
      setTaluk('');
    }
  }, [district, loadTaluks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    if (!cycle || cycle.status === 'CYCLE_CLOSED') {
      setSubmitError('Surveillance reporting for this cycle is closed.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const report: HospitalReport = {
        districtId: district,
        talukId: taluk,
        disease,
        reportDate,
        newCases: Number(newCases),
        activeCases: activeCases ? Number(activeCases) : 0,
        remarks: remarks || undefined,
      };

      const validation = await validateHospitalReport(report);
      const receipt = await submitHospitalReport(validation);
      setSubmissionReceipt(receipt);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError('Unable to submit surveillance report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReport = () => {
    setDistrict('');
    setTaluk('');
    setDisease('');
    setReportDate('');
    setNewCases('');
    setActiveCases('');
    setRemarks('');
    setErrors({});
    setTouched({});
    setSubmissionReceipt(null);
    setSubmitError(null);
  };

  const diseaseOptions = [
    { value: '', label: 'Select Disease' },
    { value: 'dengue', label: 'Dengue' },
    { value: 'malaria', label: 'Malaria' },
    { value: 'chikungunya', label: 'Chikungunya' },
    { value: 'leptospirosis', label: 'Leptospirosis' },
    { value: 'hepatitis', label: 'Hepatitis' },
    { value: 'typhoid', label: 'Typhoid' },
  ];

  if (submissionReceipt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900">Hospital Surveillance Portal</h1>
            <p className="text-lg text-neutral-500">Daily Disease Surveillance Reporting</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info" size="sm">🔒 Secure</Badge>
            <Badge variant="neutral" size="sm">📋 Aggregated Data Only</Badge>
          </div>
        </header>

        <Card className="border-l-4 border-success-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success-700">
              <span className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Report Submitted Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-500">Report ID</dt>
                <dd className="font-mono font-medium text-neutral-900">{submissionReceipt.reportId}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Surveillance Cycle</dt>
                <dd className="font-medium text-neutral-900">{submissionReceipt.cycleId}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">District</dt>
                <dd className="font-medium text-neutral-900">{submissionReceipt.district}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Taluk</dt>
                <dd className="font-medium text-neutral-900">{submissionReceipt.taluk}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Disease</dt>
                <dd className="font-medium text-neutral-900 capitalize">{submissionReceipt.disease}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">New Cases</dt>
                <dd className="font-medium text-neutral-900">{submissionReceipt.newCases}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Status</dt>
                <dd>
                  <Badge variant="success" dot>{submissionReceipt.status}</Badge>
                </dd>
              </div>
            </dl>
            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={handleNewReport} fullWidth>
                Submit Another Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }));
  const talukOptions = taluks.map(t => ({ value: t.id, label: t.name }));
  const cycleIsOpen = cycle?.status === 'OPEN_FOR_REPORTING';
  const cycleIsClosed = cycle?.status === 'CYCLE_CLOSED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Hospital Surveillance Portal</h1>
          <p className="text-lg text-neutral-500">Daily Disease Surveillance Reporting</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" size="sm">🔒 Secure</Badge>
          <Badge variant="neutral" size="sm">📋 Aggregated Data Only</Badge>
        </div>
      </header>

      {loadingCycle ? (
        <Card>
          <CardContent>
            <LoadingState message="Loading surveillance cycle..." size="md" />
          </CardContent>
        </Card>
      ) : cycle ? (
        <Card className={`border-l-4 ${cycleIsClosed ? 'border-error-500' : 'border-primary-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Today's Surveillance Cycle</CardTitle>
              <CardDescription className="text-sm">
                {new Date(cycle.startTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })} IST →
                {new Date(cycle.endTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })} IST NEXT DAY
              </CardDescription>
            </div>
            <Badge
              variant={cycleIsOpen ? 'success' : cycle?.status === 'PROCESSING' ? 'warning' : cycle?.status === 'ANALYSIS_READY' ? 'info' : 'error'}
              dot
              size="md"
            >
              {cycle?.status?.replace(/_/g, ' ')}
            </Badge>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="text-neutral-500">Cycle ID</dt>
                <dd className="font-mono font-medium text-neutral-900">{cycle.id}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Reports Received</dt>
                <dd className="font-medium text-neutral-900">{cycle.reportsReceived}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Reporting Taluks</dt>
                <dd className="font-medium text-neutral-900">{cycle.taluksReporting}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Last Updated</dt>
                <dd className="font-medium text-neutral-900">
                  {new Date(cycle.lastUpdate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <ErrorState
              title="Cycle information unavailable"
              message="Unable to load surveillance cycle information. Please try again."
              onRetry={loadCycle}
              retryLabel="Retry"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reporting Facility</CardTitle>
          <CardDescription>
            Select the district and taluk for this surveillance report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingDistricts ? (
            <LoadingState message="Loading districts..." size="md" />
          ) : districts.length === 0 ? (
            <EmptyState
              title="No districts available"
              description="Unable to load district data from the surveillance system."
              action={{ label: 'Retry', onClick: loadDistricts }}
            />
          ) : (
            <>
              <Select
                label="District"
                value={district}
                onChange={(e) => handleChange('district', e.target.value)}
                onBlur={(e) => handleBlur('district', e.target.value)}
                placeholder="Select District"
                options={[{ value: '', label: 'Select District' }, ...districtOptions]}
                required
                error={touched.district ? errors.district : undefined}
                disabled={loadingDistricts}
              />
              <Select
                label="Taluk"
                value={taluk}
                onChange={(e) => handleChange('taluk', e.target.value)}
                onBlur={(e) => handleBlur('taluk', e.target.value)}
                placeholder="Select Taluk"
                options={[{ value: '', label: 'Select Taluk' }, ...talukOptions]}
                required
                disabled={!district || loadingTaluks}
                error={touched.taluk ? errors.taluk : undefined}
              />
              {loadingTaluks && (
                <p className="text-xs text-neutral-500">Loading taluks...</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disease Surveillance</CardTitle>
          <CardDescription>
            Select the disease and report date for this surveillance entry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Disease"
            value={disease}
            onChange={(e) => handleChange('disease', e.target.value)}
            onBlur={(e) => handleBlur('disease', e.target.value)}
            placeholder="Select Disease"
            options={diseaseOptions}
            required
            error={touched.disease ? errors.disease : undefined}
          />
          <Input
            label="Report Date"
            type="date"
            value={reportDate}
            onChange={(e) => handleChange('reportDate', e.target.value)}
            onBlur={(e) => handleBlur('reportDate', e.target.value)}
            required
            error={touched.reportDate ? errors.reportDate : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>
            Enter the case counts for this surveillance report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="New Cases"
            type="number"
            min="0"
            value={newCases}
            onChange={(e) => handleChange('newCases', e.target.value)}
            onBlur={(e) => handleBlur('newCases', e.target.value)}
            required
            helperText="Enter the total number of newly reported cases."
            error={touched.newCases ? errors.newCases : undefined}
          />
          <Input
            label="Active Cases"
            type="number"
            min="0"
            value={activeCases}
            onChange={(e) => handleChange('activeCases', e.target.value)}
            onBlur={(e) => handleBlur('activeCases', e.target.value)}
            helperText="Enter the current number of active cases, if available."
            error={touched.activeCases ? errors.activeCases : undefined}
          />
          <p className="text-xs text-neutral-500">
            Aggregated case counts only. Do not enter patient names, phone numbers, addresses,
            or other personally identifiable information.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remarks (Optional)</CardTitle>
          <CardDescription>
            Add any relevant surveillance notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Remarks"
            placeholder="Add any relevant surveillance notes..."
            value={remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            helperText="Surveillance-relevant information only. Do not include patient identifiers."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Report</CardTitle>
          <CardDescription>
            Review the information above and submit the surveillance report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting || cycleIsClosed || !cycleIsOpen}
            >
              {submitting ? 'Submitting...' : '📤 Submit Surveillance Report'}
            </Button>
            {cycleIsClosed && (
              <p className="mt-2 text-sm text-neutral-500 text-center">
                Surveillance reporting for this cycle is closed.
              </p>
            )}
            {!cycleIsOpen && !cycleIsClosed && (
              <p className="mt-2 text-sm text-neutral-500 text-center">
                Reporting is not currently available for this surveillance cycle.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}