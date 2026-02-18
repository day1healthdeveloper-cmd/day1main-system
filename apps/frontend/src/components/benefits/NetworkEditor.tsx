'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NetworkProvider {
  id?: string;
  provider_name: string;
  provider_type?: string;
  practice_number?: string;
  location?: string;
}

interface Props {
  providers: NetworkProvider[];
  networkRequired: boolean;
  outOfNetworkPercentage?: number;
  onToggleNetwork: (required: boolean) => void;
  onUpdatePercentage: (percentage: number) => void;
  onAddProvider: (provider: NetworkProvider) => void;
  onRemoveProvider: (providerId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

export function NetworkEditor({
  providers,
  networkRequired,
  outOfNetworkPercentage,
  onToggleNetwork,
  onUpdatePercentage,
  onAddProvider,
  onRemoveProvider,
  expanded,
  onToggle,
}: Props) {
  const [newProvider, setNewProvider] = useState({
    provider_name: '',
    provider_type: '',
    practice_number: '',
    location: '',
  });

  const handleAdd = () => {
    if (!newProvider.provider_name.trim()) return;
    onAddProvider(newProvider);
    setNewProvider({
      provider_name: '',
      provider_type: '',
      practice_number: '',
      location: '',
    });
  };

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50"
      >
        <span>🏥 Network Requirements</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{providers.length} providers</span>
          <span>{expanded ? '▼' : '▶'}</span>
        </div>
      </button>
      {expanded && (
        <div className="p-4 space-y-4 border-t">
          {/* Network Toggle */}
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={networkRequired}
                onChange={(e) => onToggleNetwork(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-medium">Network Required</span>
            </label>
          </div>

          {/* Out-of-Network Coverage */}
          {networkRequired && (
            <div className="p-3 bg-gray-50 rounded">
              <label className="text-sm font-medium">Out-of-Network Coverage</label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={outOfNetworkPercentage || 0}
                  onChange={(e) => onUpdatePercentage(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span>% reimbursement</span>
              </div>
            </div>
          )}

          {/* Add Provider Form */}
          <div className="border rounded p-3 space-y-3">
            <h4 className="font-medium">Add Network Provider</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Provider Name *"
                value={newProvider.provider_name}
                onChange={(e) => setNewProvider({ ...newProvider, provider_name: e.target.value })}
              />
              <Input
                placeholder="Type (Hospital, Clinic, etc.)"
                value={newProvider.provider_type}
                onChange={(e) => setNewProvider({ ...newProvider, provider_type: e.target.value })}
              />
              <Input
                placeholder="Practice Number"
                value={newProvider.practice_number}
                onChange={(e) => setNewProvider({ ...newProvider, practice_number: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={newProvider.location}
                onChange={(e) => setNewProvider({ ...newProvider, location: e.target.value })}
              />
            </div>
            <Button onClick={handleAdd} className="w-full">+ Add Provider</Button>
          </div>

          {/* Provider List */}
          <div className="space-y-2">
            <h4 className="font-medium">Approved Providers ({providers.length})</h4>
            {providers.length === 0 ? (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">No providers added yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {providers.map((provider, index) => (
                  <div key={provider.id || index} className="flex items-start justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{provider.provider_name}</p>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        {provider.provider_type && <p>Type: {provider.provider_type}</p>}
                        {provider.practice_number && <p>Practice #: {provider.practice_number}</p>}
                        {provider.location && <p>Location: {provider.location}</p>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => provider.id && onRemoveProvider(provider.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
