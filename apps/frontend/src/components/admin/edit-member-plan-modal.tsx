'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
}

interface EditMemberPlanModalProps {
  member: {
    id: string;
    memberNumber: string;
    firstName: string;
    lastName: string;
    product: string;
    planId: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditMemberPlanModal({ member, isOpen, onClose, onSave }: EditMemberPlanModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState(member.planId || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPlanId) {
      alert('Please select a plan');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlanId }),
      });

      if (!response.ok) throw new Error('Failed to update member');

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to update member:', error);
      alert('Failed to update member plan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Assign Plan</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Member</p>
          <p className="font-medium">{member.firstName} {member.lastName}</p>
          <p className="text-sm text-gray-500">{member.memberNumber}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Current Plan</p>
          <p className="text-sm">{member.product || 'No plan assigned'}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select New Plan</label>
          {loading ? (
            <p className="text-sm text-gray-500">Loading plans...</p>
          ) : (
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Plan --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedPlanId}>
            {saving ? 'Saving...' : 'Save Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
