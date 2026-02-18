'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProcedureCode {
  id?: string;
  code_type: string;
  code: string;
  code_description?: string;
  is_covered: boolean;
  coverage_percentage?: number;
  max_amount?: number;
}

interface Props {
  codes: ProcedureCode[];
  onAddCode: (code: ProcedureCode) => void;
  onRemoveCode: (codeId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

export function ProcedureCodesEditor({
  codes,
  onAddCode,
  onRemoveCode,
  expanded,
  onToggle,
}: Props) {
  const [newCode, setNewCode] = useState({
    code_type: 'ICD10',
    code: '',
    code_description: '',
    is_covered: true,
    coverage_percentage: 100,
  });

  const handleAdd = () => {
    if (!newCode.code.trim()) return;
    onAddCode(newCode as ProcedureCode);
    setNewCode({
      code_type: 'ICD10',
      code: '',
      code_description: '',
      is_covered: true,
      coverage_percentage: 100,
    });
  };

  const icd10Codes = codes.filter(c => c.code_type === 'ICD10');
  const tariffCodes = codes.filter(c => c.code_type === 'TARIFF');
  const otherCodes = codes.filter(c => c.code_type !== 'ICD10' && c.code_type !== 'TARIFF');

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50"
      >
        <span>🔢 Procedure Codes</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{codes.length} codes</span>
          <span>{expanded ? '▼' : '▶'}</span>
        </div>
      </button>
      {expanded && (
        <div className="p-4 space-y-4 border-t">
          {/* Add Code Form */}
          <div className="border rounded p-3 space-y-3">
            <h4 className="font-medium">Add Procedure Code</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Code Type</label>
                <select
                  value={newCode.code_type}
                  onChange={(e) => setNewCode({ ...newCode, code_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                >
                  <option value="ICD10">ICD-10</option>
                  <option value="TARIFF">Tariff Code</option>
                  <option value="CPT">CPT Code</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Code *</label>
                <Input
                  placeholder="e.g., Z41.1"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Code description"
                  value={newCode.code_description}
                  onChange={(e) => setNewCode({ ...newCode, code_description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Coverage %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newCode.coverage_percentage}
                  onChange={(e) => setNewCode({ ...newCode, coverage_percentage: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCode.is_covered}
                    onChange={(e) => setNewCode({ ...newCode, is_covered: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">Covered</span>
                </label>
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">+ Add Code</Button>
          </div>

          {/* ICD-10 Codes */}
          {icd10Codes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">ICD-10 Codes ({icd10Codes.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {icd10Codes.map((code, index) => (
                  <CodeItem key={code.id || index} code={code} onRemove={onRemoveCode} />
                ))}
              </div>
            </div>
          )}

          {/* Tariff Codes */}
          {tariffCodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Tariff Codes ({tariffCodes.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tariffCodes.map((code, index) => (
                  <CodeItem key={code.id || index} code={code} onRemove={onRemoveCode} />
                ))}
              </div>
            </div>
          )}

          {/* Other Codes */}
          {otherCodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Other Codes ({otherCodes.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {otherCodes.map((code, index) => (
                  <CodeItem key={code.id || index} code={code} onRemove={onRemoveCode} />
                ))}
              </div>
            </div>
          )}

          {codes.length === 0 && (
            <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">No procedure codes added yet</p>
          )}
        </div>
      )}
    </div>
  );
}

function CodeItem({ code, onRemove }: { code: ProcedureCode; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-start justify-between p-3 bg-gray-50 rounded">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium">{code.code}</span>
          <span className={`text-xs px-2 py-1 rounded ${code.is_covered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {code.is_covered ? 'Covered' : 'Excluded'}
          </span>
          {code.coverage_percentage && code.coverage_percentage < 100 && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {code.coverage_percentage}%
            </span>
          )}
        </div>
        {code.code_description && (
          <p className="text-sm text-gray-600 mt-1">{code.code_description}</p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => code.id && onRemove(code.id)}
      >
        Remove
      </Button>
    </div>
  );
}
