import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { Card, Select, EmptyState, ErrorState } from '../components/ui';
import { MapPin, AlertCircle, Hexagon, Activity, RefreshCw, Filter, Eye, EyeOff } from 'lucide-react';
import { KpiCard, KpiCardSkeleton } from '../components/dashboard/KpiCard';
import { CycleStatusCard } from '../components/dashboard/CycleStatusCard';
import { KeralaMap } from '../components/dashboard/KeralaMap';
import { DiseaseTrendsChart } from '../components/dashboard/DiseaseTrendsChart';
import { TemporalSignals } from '../components/dashboard/TemporalSignals';
import { ClusterDetailPanel } from '../components/dashboard/ClusterDetailPanel';
import { AlertsList } from '../components/dashboard/AlertsList';
import { AdvisoryPanel } from '../components/dashboard/AdvisoryPanel';
import { fetchDashboardSummary, fetchCurrentCycle } from '../api';
import { fetchTaluks } from '../api/geography';
import { fetchDiseaseTrends, fetchTemporalSignals, fetchAlerts, fetchAdvisory } from '../api/intelligence';
import type { SelectOption } from '../components/ui';
import type { DashboardSummary, MapFilters, SurveillanceCycle, VisualizationMode, DiseaseTrends, TemporalSignal, Cluster, Alert, Advisory, ViewMode } from '../types';

const defaultFilters: MapFilters = {
  disease: '',
  date: '',
  district: '',
  taluk: '',
  visualization: 'risk',
};

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cycle, setCycle] = useState<SurveillanceCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);
  const [trends, setTrends] = useState<DiseaseTrends | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [signals, setSignals] = useState<TemporalSignal[] | null>(null);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsError, setSignalsError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode['type']>('public');
  const trendsRequestRef = useRef(0);
  const signalsRequestRef = useRef(0);
  const alertsRequestRef = useRef(0);
  const advisoryRequestRef = useRef(0);

  const diseaseOptions = [
    { value: '', label: 'All Diseases' },
    { value: 'dengue', label: 'Dengue' },
    { value: 'malaria', label: 'Malaria' },
    { value: 'chikungunya', label: 'Chikungunya' },
    { value: 'leptospirosis', label: 'Leptospirosis' },
    { value: 'hepatitis', label: 'Hepatitis' },
    { value: 'typhoid', label: 'Typhoid' },
  ];

  const visualizationOptions: { value: VisualizationMode; label: string }[] = [
    { value: 'risk', label: 'Risk' },
    { value: 'intensity', label: 'Case Intensity' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'clusters', label: 'Clusters' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'epicentre', label: 'Estimated Potential Epicentre' },
  ];

  const districtOptions = [
    { value: '', label: 'All Districts' },
    { value: 'thiruvananthapuram', label: 'Thiruvananthapuram' },
    { value: 'kollam', label: 'Kollam' },
    { value: 'pathanamthitta', label: 'Pathanamthitta' },
    { value: 'alappuzha', label: 'Alappuzha' },
    { value: 'kottayam', label: 'Kottayam' },
    { value: 'idukki', label: 'Idukki' },
    { value: 'ernakulam', label: 'Ernakulam' },
    { value: 'thrissur', label: 'Thrissur' },
    { value: 'palakkad', label: 'Palakkad' },
    { value: 'malappuram', label: 'Malappuram' },
    { value: 'kozhikode', label: 'Kozhikode' },
    { value: 'wayanad', label: 'Wayanad' },
    { value: 'kannur', label: 'Kannur' },
    { value: 'kasaragod', label: 'Kasaragod' },
  ];

  const [talukOptions, setTalukOptions] = useState<SelectOption[]>([]);
  const [talukLoading, setTalukLoading] = useState(false);
  const [talukError, setTalukError] = useState<string | null>(null);
  const talukRequestRef = useRef(0);

  useEffect(() => {
    const requestId = talukRequestRef.current + 1;
    talukRequestRef.current = requestId;
    let active = true;

    if (!filters.district) {
      setTalukOptions([]);
      setTalukLoading(false);
      setTalukError(null);
      return;
    }

    setTalukLoading(true);
    setTalukError(null);

    void fetchTaluks(filters.district)
      .then((taluks) => {
        if (!active || requestId !== talukRequestRef.current) return;

        const districtTaluks = taluks.filter((taluk) => taluk.districtId === filters.district);
        setTalukOptions(
          districtTaluks.map((taluk): SelectOption => ({
            value: taluk.id,
            label: taluk.name,
          })),
        );
        setTalukLoading(false);
      })
      .catch(() => {
        if (!active || requestId !== talukRequestRef.current) return;

        setTalukOptions([]);
        setTalukError('Unable to load taluk options. Please select another district.');
        setTalukLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.district]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, cycleData] = await Promise.all([
        fetchDashboardSummary(),
        fetchCurrentCycle(),
      ]);
      setSummary(summaryData);
      setCycle(cycleData);
    } catch (err) {
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const requestId = trendsRequestRef.current + 1;
    trendsRequestRef.current = requestId;
    let active = true;

    const disease = filters.disease || 'dengue';
    const district = filters.district || undefined;
    const taluk = filters.taluk || undefined;

    setTrendsLoading(true);
    setTrendsError(null);

    void fetchDiseaseTrends({
      disease,
      district,
      taluk,
      period: trendPeriod,
    })
      .then((data) => {
        if (!active || requestId !== trendsRequestRef.current) return;
        setTrends(data);
        setTrendsLoading(false);
      })
      .catch(() => {
        if (!active || requestId !== trendsRequestRef.current) return;
        setTrends(null);
        setTrendsError('Unable to load disease trends.');
        setTrendsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.disease, filters.district, filters.taluk, trendPeriod]);

  useEffect(() => {
    const requestId = signalsRequestRef.current + 1;
    signalsRequestRef.current = requestId;
    let active = true;

    const disease = filters.disease || undefined;
    const district = filters.district || undefined;

    setSignalsLoading(true);
    setSignalsError(null);

    void fetchTemporalSignals({ disease, district })
      .then((data) => {
        if (!active || requestId !== signalsRequestRef.current) return;
        setSignals(data);
        setSignalsLoading(false);
      })
      .catch(() => {
        if (!active || requestId !== signalsRequestRef.current) return;
        setSignals(null);
        setSignalsError('Unable to load temporal signals.');
        setSignalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.disease, filters.district]);

  useEffect(() => {
    const requestId = alertsRequestRef.current + 1;
    alertsRequestRef.current = requestId;
    let active = true;

    const disease = filters.disease || undefined;
    const district = filters.district || undefined;

    setAlertsLoading(true);
    setAlertsError(null);

    void fetchAlerts({ disease, district, limit: 20 })
      .then((data) => {
        if (!active || requestId !== alertsRequestRef.current) return;
        setAlerts(data);
        setAlertsLoading(false);
      })
      .catch(() => {
        if (!active || requestId !== alertsRequestRef.current) return;
        setAlerts(null);
        setAlertsError('Unable to load public health alerts.');
        setAlertsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.disease, filters.district]);

  useEffect(() => {
    const requestId = advisoryRequestRef.current + 1;
    advisoryRequestRef.current = requestId;
    let active = true;

    setAdvisoryLoading(true);
    setAdvisoryError(null);

    void fetchAdvisory()
      .then((data) => {
        if (!active || requestId !== advisoryRequestRef.current) return;
        setAdvisory(data);
        setAdvisoryLoading(false);
      })
      .catch(() => {
        if (!active || requestId !== advisoryRequestRef.current) return;
        setAdvisory(null);
        setAdvisoryError('Unable to load public health advisory.');
        setAdvisoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <CycleStatusCard loading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={error}
        onRetry={handleRefresh}
      />
    );
  }

  if (!summary) {
    return (
      <EmptyState
        title="No data available"
        description="No surveillance data available for the current period."
        action={{ label: 'Retry', onClick: handleRefresh }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Overview</h2>
          <p className="text-neutral-500 mt-1">Surveillance summary for the current cycle</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-lg" role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'public'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-pressed={viewMode === 'public'}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Public</span>
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-pressed={viewMode === 'detailed'}
            >
              <EyeOff className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Detailed</span>
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key performance indicators">
        <KpiCard
          title="Active Surveillance"
          value={`${summary.activeSurveillance.districts} Districts`}
          subtitle={`${summary.activeSurveillance.taluks} Taluks`}
          icon={Activity}
          status="normal"
        />
        <KpiCard
          title="Reporting Taluks"
          value={summary.reportingTaluks}
          icon={MapPin}
          status="normal"
        />
        <KpiCard
          title="Active Signals"
          value={summary.activeSignals}
          icon={AlertCircle}
          status={summary.activeSignals > 10 ? 'warning' : summary.activeSignals > 0 ? 'normal' : 'normal'}
        />
        <KpiCard
          title="Candidate Clusters"
          value={summary.candidateClusters}
          icon={Hexagon}
          status={summary.candidateClusters > 5 ? 'critical' : summary.candidateClusters > 0 ? 'warning' : 'normal'}
        />
      </div>

      <CycleStatusCard cycle={cycle} />

      <div className="space-y-6">
        <section aria-labelledby="map-controls-heading">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 id="map-controls-heading" className="text-lg font-semibold text-neutral-900">Map Controls</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="disease-filter" className="sr-only">Disease</label>
              <Select
                id="disease-filter"
                options={diseaseOptions}
                value={filters.disease}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters((prev: MapFilters) => ({ ...prev, disease: e.target.value }))}
                placeholder="All Diseases"
                className="w-auto min-w-[180px]"
              />
              <label htmlFor="district-filter" className="sr-only">District</label>
              <Select
                id="district-filter"
                options={districtOptions}
                value={filters.district}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters((prev: MapFilters) => ({ ...prev, district: e.target.value, taluk: '' }))}
                placeholder="All Districts"
                className="w-auto min-w-[180px]"
              />
              <label htmlFor="taluk-filter" className="sr-only">Taluk</label>
              <Select
                id="taluk-filter"
                options={talukOptions}
                value={filters.taluk}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters((prev: MapFilters) => ({ ...prev, taluk: e.target.value }))}
                placeholder={talukLoading ? 'Loading taluks...' : talukError ? 'Taluk options unavailable' : filters.district ? 'All Taluks' : 'Select a district first'}
                disabled={!filters.district || talukLoading || Boolean(talukError)}
                helperText={talukLoading ? 'Loading taluk options...' : !talukError && filters.district && talukOptions.length === 0 ? 'No taluks available for this district.' : undefined}
                error={talukError ?? undefined}
                className="w-auto min-w-[180px]"
              />
              {viewMode === 'detailed' && (
                <>
                  <label htmlFor="visualization-filter" className="sr-only">Visualization</label>
                  <Select
                    id="visualization-filter"
                    options={visualizationOptions}
                    value={filters.visualization}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters((prev: MapFilters) => ({ ...prev, visualization: e.target.value as VisualizationMode }))}
                    placeholder="Risk"
                    className="w-auto min-w-[160px]"
                  />
                  <label htmlFor="period-filter" className="sr-only">Time Period</label>
                  <Select
                    id="period-filter"
                    options={[
                      { value: '7d', label: 'Last 7 Days' },
                      { value: '30d', label: 'Last 30 Days' },
                      { value: '90d', label: 'Last 90 Days' },
                    ]}
                    value={trendPeriod}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setTrendPeriod(e.target.value as '7d' | '30d' | '90d')}
                    placeholder="30 Days"
                    className="w-auto min-w-[140px]"
                  />
                </>
              )}
              <button
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                onClick={() => setFilters({
                  disease: '',
                  date: '',
                  district: '',
                  taluk: '',
                  visualization: 'risk',
                })}
              >
                <Filter size={16} aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="aspect-video bg-neutral-100 relative kerala-map-shell">
              <KeralaMap
                selectedDistrictId={filters.district}
                selectedTalukId={filters.taluk}
                selectedDisease={filters.disease}
                selectedDate={filters.date}
                visualizationMode={filters.visualization}
                onDistrictSelect={(districtId) =>
                  setFilters((prev: MapFilters) => ({ ...prev, district: districtId, taluk: '' }))
                }
                onTalukSelect={(talukId) =>
                  setFilters((prev: MapFilters) => ({ ...prev, taluk: talukId }))
                }
                onClusterSelect={setSelectedCluster}
                selectedClusterId={selectedCluster?.id}
              />
            </div>
          </Card>
        </section>

        {viewMode === 'detailed' && (
          <>
            <section aria-labelledby="trends-heading" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 id="trends-heading" className="text-lg font-semibold text-neutral-900">Disease Activity Over Time</h3>
                <div className="flex items-center gap-2">
                  <label htmlFor="trends-disease" className="sr-only">Disease for trends</label>
                  <Select
                    id="trends-disease"
                    options={diseaseOptions.filter((o) => o.value)}
                    value={filters.disease || 'dengue'}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters((prev: MapFilters) => ({ ...prev, disease: e.target.value }))}
                    className="w-auto min-w-[160px]"
                  />
                  <label htmlFor="trends-period" className="sr-only">Period</label>
                  <Select
                    id="trends-period"
                    options={[
                      { value: '7d', label: '7 Days' },
                      { value: '30d', label: '30 Days' },
                      { value: '90d', label: '90 Days' },
                    ]}
                    value={trendPeriod}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setTrendPeriod(e.target.value as '7d' | '30d' | '90d')}
                    className="w-auto min-w-[120px]"
                  />
                </div>
              </div>
              <DiseaseTrendsChart data={trends} loading={trendsLoading} error={trendsError} />
            </section>

            <section aria-labelledby="signals-heading" className="space-y-4">
              <h3 id="signals-heading" className="text-lg font-semibold text-neutral-900">Temporal Signals</h3>
              <TemporalSignals signals={signals} loading={signalsLoading} error={signalsError} />
            </section>

            <section aria-labelledby="alerts-heading" className="space-y-4">
              <h3 id="alerts-heading" className="text-lg font-semibold text-neutral-900">Public Health Alerts</h3>
              <Card padding="md">
                <AlertsList alerts={alerts} loading={alertsLoading} error={alertsError} />
              </Card>
            </section>
          </>
        )}

        <section aria-labelledby="advisory-heading" className="space-y-4">
          <h3 id="advisory-heading" className="text-lg font-semibold text-neutral-900">Public Health Advisory</h3>
          <AdvisoryPanel advisory={advisory} loading={advisoryLoading} error={advisoryError} />
        </section>
      </div>
      <ClusterDetailPanel cluster={selectedCluster} onClose={() => setSelectedCluster(null)} />
    </div>
  );
}