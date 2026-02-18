'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BenefitDetail {
  id?: string;
  full_description?: string;
  coverage_summary?: string;
  inclusions?: string[];
  exclusions?: string[];
  conditions?: string[];
  network_required?: boolean;
  room_type?: string;
  room_upgrade_cost?: number;
  icd10_codes?: string[];
  tariff_codes?: string[];
}

interface Props {
  benefitName: string;
  benefitId: string;
  details: BenefitDetail | null;
  onSave: (details: BenefitDetail) => void;
  onClose: () => void;
}

export function BenefitDetailEditor({ benefitName, benefitId, details, onSave, onClose }: Props) {
  const [expanded, setExpanded] = useState<string[]>(['description']);
  const [formData, setFormData] = useState<BenefitDetail>(details || {});

  const toggleSection = (section: string) => {
    setExpanded(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const addToList = (field: keyof BenefitDetail, value: string) => {
    if (!value.trim()) return;
    const currentList = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: [...currentList, value.trim()]
    });
  };

  const removeFromList = (field: keyof BenefitDetail, index: number) => {
    const currentList = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: currentList.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📝 {benefitName} - Comprehensive Details</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)}>Save All Changes</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Description Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('description')}
            className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50"
          >
            <span>📄 Full Description</span>
            <span>{expanded.includes('description') ? '▼' : '▶'}</span>
          </button>
          {expanded.includes('description') && (
            <div className="p-4 space-y-3 border-t">
              <div>
                <label className="text-sm font-medium">Full Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  rows={4}
                  value={formData.full_description || ''}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                  placeholder="Detailed description of what this benefit covers..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Coverage Summary (for members)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  rows={2}
                  value={formData.coverage_summary || ''}
                  onChange={(e) => setFormData({ ...formData, coverage_summary: e.target.value })}
                  placeholder="Short summary for member portal..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Inclusions Section */}
        <InclusionsEditor
          inclusions={formData.inclusions || []}
          onAdd={(value) => addToList('inclusions', value)}
          onRemove={(index) => removeFromList('inclusions', index)}
          expanded={expanded.includes('inclusions')}
          onToggle={() => toggleSection('inclusions')}
        />

        {/* Exclusions Section */}
        <ExclusionsEditor
          exclusions={formData.exclusions || []}
          onAdd={(value) => addToList('exclusions', value)}
          onRemove={(index) => removeFromList('exclusions', index)}
          expanded={expanded.includes('exclusions')}
          onToggle={() => toggleSection('exclusions')}
        />

        {/* Conditions Section */}
        <ConditionsEditor
          conditions={formData.conditions || []}
          onAdd={(value) => addToList('conditions', value)}
          onRemove={(index) => removeFromList('conditions', index)}
          expanded={expanded.includes('conditions')}
          onToggle={() => toggleSection('conditions')}
        />

      </CardContent>
    </Card>
  );
}

function InclusionsEditor({ inclusions, onAdd, onRemove, expanded, onToggle }: any) {
  const [newItem, setNewItem] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50"
      >
        <span>✅ What IS Covered (Inclusions)</span>
        <span className="text-sm text-gray-500 mr-2">{inclusions.length} items</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="p-4 space-y-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Add inclusion (e.g., Ward fees, Theatre costs)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onAdd(newItem);
                  setNewItem('');
                }
              }}
            />
            <Button onClick={() => { onAdd(newItem); setNewItem(''); }}>Add</Button>
          </div>
          <div className="space-y-2">
            {inclusions.map((item: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">✓ {item}</span>
                <Button size="sm" variant="outline" onClick={() => onRemove(index)}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExclusionsEditor({ exclusions, onAdd, onRemove, expanded, onToggle }: any) {
  const [newItem, setNewItem] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50"
      >
        <span>❌ What is NOT Covered (Exclusions)</span>
        <span className="text-sm text-gray-500 mr-2">{exclusions.length} items</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="p-4 space-y-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Add exclusion (e.g., Cosmetic procedures)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onAdd(newItem);
                  setNewItem('');
                }
              }}
            />
            <Button onClick={() => { onAdd(newItem); setNewItem(''); }}>Add</Button>
          </div>
          <div className="space-y-2">
            {exclusions.map((item: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm">✗ {item}</span>
                <Button size="sm" variant="outline" onClick={() => onRemove(index)}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConditionsEditor({ conditions, onAdd, onRemove, expanded, onToggle }: any) {
  const [newItem, setNewItem] = useState('');

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50"
      >
        <span>⚠️ Conditions & Requirements</span>
        <span className="text-sm text-gray-500 mr-2">{conditions.length} items</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="p-4 space-y-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Add condition (e.g., Pre-authorization required)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onAdd(newItem);
                  setNewItem('');
                }
              }}
            />
            <Button onClick={() => { onAdd(newItem); setNewItem(''); }}>Add</Button>
          </div>
          <div className="space-y-2">
            {conditions.map((item: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm">⚠ {item}</span>
                <Button size="sm" variant="outline" onClick={() => onRemove(index)}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
