import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface WaitingPeriodTimelineProps {
  memberStartDate: string;
  daysSinceStart: number;
  waitingPeriodDays: number;
  waitingPeriodPassed: boolean;
  waitingPeriodEndDate: string;
  preExistingExclusionDays?: number;
  preExistingExclusionPassed?: boolean;
  preExistingExclusionEndDate?: string;
}

export function WaitingPeriodTimeline({
  memberStartDate,
  daysSinceStart,
  waitingPeriodDays,
  waitingPeriodPassed,
  waitingPeriodEndDate,
  preExistingExclusionDays = 0,
  preExistingExclusionPassed = true,
  preExistingExclusionEndDate
}: WaitingPeriodTimelineProps) {
  const startDate = new Date(memberStartDate);
  const today = new Date();
  const waitingEndDate = new Date(waitingPeriodEndDate);
  const preExistingEndDate = preExistingExclusionEndDate ? new Date(preExistingExclusionEndDate) : null;

  // Calculate timeline milestones
  const milestones = [
    {
      label: 'Membership Start',
      date: startDate,
      status: 'completed' as const,
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  if (waitingPeriodDays > 0) {
    milestones.push({
      label: `General Waiting Period (${waitingPeriodDays} days)`,
      date: waitingEndDate,
      status: waitingPeriodPassed ? 'completed' as const : 'pending' as const,
      icon: waitingPeriodPassed ? CheckCircle : Clock,
      color: waitingPeriodPassed ? 'text-green-600' : 'text-orange-600'
    });
  }

  if (preExistingExclusionDays > 0 && preExistingEndDate) {
    milestones.push({
      label: `Pre-Existing Exclusion (${preExistingExclusionDays} days)`,
      date: preExistingEndDate,
      status: preExistingExclusionPassed ? 'completed' as const : 'blocked' as const,
      icon: preExistingExclusionPassed ? CheckCircle : XCircle,
      color: preExistingExclusionPassed ? 'text-green-600' : 'text-red-600'
    });
  }

  // Sort milestones by date
  milestones.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Coverage Timeline</h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />
        
        {/* Milestones */}
        <div className="space-y-6">
          {milestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const isPast = milestone.date <= today;
            
            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-100' :
                  milestone.status === 'blocked' ? 'bg-red-100' :
                  'bg-orange-100'
                }`}>
                  <Icon className={`w-4 h-4 ${milestone.color}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    milestone.status === 'completed' ? 'text-gray-900' :
                    milestone.status === 'blocked' ? 'text-red-900' :
                    'text-orange-900'
                  }`}>
                    {milestone.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {milestone.date.toLocaleDateString('en-ZA', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {!isPast && milestone.status !== 'completed' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.ceil((milestone.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Current position indicator */}
          <div className="relative flex items-start gap-4">
            <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-blue-900">Today</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {today.toLocaleDateString('en-ZA', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Day {daysSinceStart} of membership
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-600">Member Since</p>
            <p className="font-medium">{startDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Days Active</p>
            <p className="font-medium">{daysSinceStart} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
