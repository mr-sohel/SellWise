export const RFM_SEGMENTS = [
  'champion',
  'loyal',
  'potential',
  'new',
  'at_risk',
  'lost',
] as const;

export type RfmSegment = (typeof RFM_SEGMENTS)[number];

export const RFM_SEGMENT_LABELS: Record<RfmSegment, string> = {
  champion: 'Champion',
  loyal: 'Loyal',
  potential: 'Potential',
  new: 'New Customer',
  at_risk: 'At Risk',
  lost: 'Lost',
};

export const RFM_SEGMENT_DESCRIPTIONS: Record<RfmSegment, string> = {
  champion: 'Best customers who bought recently, buy often, and spend the most',
  loyal: 'Recent and frequent buyers with high spend',
  potential: 'Average customers with moderate engagement',
  new: 'Recently acquired customers with low frequency',
  at_risk: 'Previously active customers who haven\'t purchased recently',
  lost: 'Customers with low recency and frequency — may have churned',
};

export const RFM_SEGMENT_COLORS: Record<RfmSegment, 'violet' | 'info' | 'warning' | 'success' | 'destructive' | 'muted'> = {
  champion: 'violet',
  loyal: 'info',
  potential: 'warning',
  new: 'success',
  at_risk: 'destructive',
  lost: 'muted',
};
