// Synthetic, presentation-ready dataset for the Predictive Intelligence dashboard.
// All values are deterministic and contain NO real user data. Safe for demos.

export interface TrajectoryPoint {
  month: string;
  health: number;
  financial: number;
  mental: number;
  productivity: number;
  momentum: number;
}

export const trajectoryData: TrajectoryPoint[] = [
  { month: 'Jan', health: 62, financial: 58, mental: 55, productivity: 60, momentum: 59 },
  { month: 'Feb', health: 64, financial: 60, mental: 57, productivity: 63, momentum: 61 },
  { month: 'Mar', health: 67, financial: 61, mental: 60, productivity: 66, momentum: 64 },
  { month: 'Apr', health: 65, financial: 63, mental: 58, productivity: 68, momentum: 64 },
  { month: 'May', health: 70, financial: 66, mental: 63, productivity: 71, momentum: 68 },
  { month: 'Jun', health: 73, financial: 68, mental: 66, productivity: 74, momentum: 71 },
  { month: 'Jul', health: 75, financial: 70, mental: 69, productivity: 76, momentum: 73 },
  { month: 'Aug', health: 78, financial: 72, mental: 72, productivity: 78, momentum: 76 },
  { month: 'Sep', health: 80, financial: 74, mental: 75, productivity: 80, momentum: 78 },
  { month: 'Oct', health: 82, financial: 76, mental: 77, productivity: 82, momentum: 80 },
  { month: 'Nov', health: 84, financial: 78, mental: 79, productivity: 84, momentum: 82 },
  { month: 'Dec', health: 86, financial: 80, mental: 81, productivity: 86, momentum: 84 },
];

export interface RiskCluster {
  label: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  trend: number; // +/- %
  confidence: number; // 0-1
}

export const healthRiskClusters: RiskCluster[] = [
  { label: 'Sedentary escalation', count: 1284, severity: 'high', trend: 8.2, confidence: 0.87 },
  { label: 'Sleep deterioration', count: 962, severity: 'medium', trend: 4.1, confidence: 0.81 },
  { label: 'Burnout trajectory', count: 743, severity: 'high', trend: 12.6, confidence: 0.84 },
  { label: 'Cardiovascular risk pattern', count: 412, severity: 'high', trend: 3.4, confidence: 0.78 },
  { label: 'Stress escalation', count: 1620, severity: 'medium', trend: 6.7, confidence: 0.83 },
  { label: 'Recovery instability', count: 538, severity: 'low', trend: -2.1, confidence: 0.76 },
];

export const financialIndicators: RiskCluster[] = [
  { label: 'Financial anxiety pattern', count: 1146, severity: 'medium', trend: 5.3, confidence: 0.79 },
  { label: 'Savings deterioration likelihood', count: 824, severity: 'high', trend: 9.1, confidence: 0.82 },
  { label: 'Emergency-loan likelihood', count: 392, severity: 'high', trend: 11.4, confidence: 0.74 },
  { label: 'Resilience improvement', count: 1532, severity: 'low', trend: -6.2, confidence: 0.85 },
];

export const insuranceClusters: RiskCluster[] = [
  { label: 'Low-risk responsive cohort', count: 4820, severity: 'low', trend: 3.1, confidence: 0.91 },
  { label: 'Medium-risk monitor cohort', count: 2140, severity: 'medium', trend: 2.4, confidence: 0.86 },
  { label: 'High-risk intervention cohort', count: 612, severity: 'high', trend: 4.7, confidence: 0.83 },
  { label: 'Policy-lapse likelihood', count: 184, severity: 'high', trend: 6.2, confidence: 0.77 },
];

export interface Intervention {
  title: string;
  audience: string;
  impact: number; // estimated lift %
  confidence: number;
  roi: number; // estimated R per user
}

export const interventions: Intervention[] = [
  { title: 'Sleep recovery 14-day nudge', audience: 'Sleep-decline cohort', impact: 18, confidence: 0.82, roi: 740 },
  { title: 'Movement reward bundle', audience: 'Sedentary escalation', impact: 22, confidence: 0.79, roi: 612 },
  { title: 'Burnout prevention coaching', audience: 'High-stress segment', impact: 27, confidence: 0.84, roi: 1180 },
  { title: 'Financial wellness coaching', audience: 'Anxiety-pattern segment', impact: 15, confidence: 0.71, roi: 540 },
  { title: 'Cardio risk preventive screen', audience: 'Cardio-pattern segment', impact: 31, confidence: 0.86, roi: 2150 },
];

export interface Segment {
  name: string;
  users: number;
  retention: number;
  growth: number;
}

export const userSegments: Segment[] = [
  { name: 'High-discipline', users: 1842, retention: 94, growth: 8.1 },
  { name: 'High-growth', users: 2310, retention: 88, growth: 14.6 },
  { name: 'Burnout-risk', users: 743, retention: 61, growth: -4.2 },
  { name: 'Recovery-success', users: 1126, retention: 90, growth: 11.3 },
  { name: 'Reward-driven', users: 1980, retention: 86, growth: 9.7 },
  { name: 'Consistency archetype', users: 1564, retention: 92, growth: 6.4 },
];

export interface GeoCluster {
  region: string;
  momentum: number;
  burnout: number;
  engagement: number;
}

export const geoClusters: GeoCluster[] = [
  { region: 'Gauteng', momentum: 78, burnout: 32, engagement: 82 },
  { region: 'Western Cape', momentum: 81, burnout: 28, engagement: 85 },
  { region: 'KwaZulu-Natal', momentum: 72, burnout: 38, engagement: 76 },
  { region: 'Eastern Cape', momentum: 68, burnout: 41, engagement: 71 },
  { region: 'Free State', momentum: 70, burnout: 36, engagement: 73 },
  { region: 'North West', momentum: 67, burnout: 39, engagement: 70 },
];

export interface RoiMetric {
  label: string;
  value: string;
  delta: string;
}

export const roiMetrics: RoiMetric[] = [
  { label: 'Projected healthcare savings', value: 'R 18.4M', delta: '+12.3% QoQ' },
  { label: 'Preventable escalation avoided', value: '1,284', delta: '+8.2% QoQ' },
  { label: 'Retention lift', value: '+6.7%', delta: 'vs control' },
  { label: 'Productivity uplift', value: '+9.1%', delta: 'cohort avg' },
  { label: 'Reward responsiveness', value: '73%', delta: '+4.4% MoM' },
  { label: 'Wellness compliance', value: '81%', delta: '+5.6% MoM' },
];

export const headlineKpis = [
  { label: 'Life Momentum Index', value: '78.4', sub: 'platform avg · +3.2 MoM' },
  { label: 'Predictive confidence', value: '0.84', sub: 'ensemble model' },
  { label: 'At-risk cohort', value: '7.6%', sub: '-1.1% vs prior' },
  { label: 'Intervention opportunities', value: '2,418', sub: 'open this week' },
];

export const aiBriefings = [
  {
    title: 'Burnout trajectory accelerating in 25-34 cohort',
    body: 'Composite stress, sleep deterioration, and reduced micro-move completion indicate an 12.6% increase in burnout trajectory within the 25-34 segment over the last 30 days. Recommended intervention: Burnout prevention coaching bundle with sleep recovery nudge. Estimated reach: 743 users. Confidence: 0.84.',
    tag: 'Critical',
  },
  {
    title: 'Cardio risk cluster responding to preventive screen',
    body: 'Cardiovascular-pattern cohort shows a 31% reduction in escalation indicators after preventive screen exposure. Recommended scale-up to medium-risk monitor cohort (2,140 users). Estimated avoided escalation: ~84 events / quarter.',
    tag: 'Opportunity',
  },
  {
    title: 'Financial anxiety stabilising in Western Cape',
    body: 'Financial anxiety pattern declining 6.2% in Western Cape, correlated with reward-driven engagement and consistency archetype growth. Suggested: extend financial wellness coaching to Gauteng (similar profile).',
    tag: 'Trend',
  },
];
