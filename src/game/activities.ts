export type LabActivityId = 'pipeline-recovery'

export interface LabActivityDefinition {
  id: LabActivityId
  label: string
}

export const labActivities: readonly LabActivityDefinition[] = [
  {
    id: 'pipeline-recovery',
    label: 'Run Pipeline Recovery',
  },
]

export const labActivityById = Object.fromEntries(
  labActivities.map((activity) => [activity.id, activity]),
) as Record<LabActivityId, LabActivityDefinition>
