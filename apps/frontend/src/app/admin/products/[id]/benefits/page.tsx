'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { PolicySectionItems } from '@/components/policy/PolicySectionItems';

interface Definition {
  id: string;
  term: string;
  definition: string;
  category: string;
  display_order: number;
}

const POLICY_SECTIONS = [
  { id: 'definitions', label: 'Definitions' },
  { id: 'waiting-periods', label: 'Waiting Periods' },
  { id: 'general-provisions', label: 'General Provisions' },
  { id: 'payment-premium', label: 'Payment of Premium' },
  { id: 'exclusions-limitations', label: 'Exclusions & Limitations' },
  { id: 'general-conditions', label: 'General Conditions' },
  { id: 'insuring-section', label: 'Insuring Section' },
  { id: 'funeral-benefit', label: 'Funeral Benefit' },
  { id: 'critical-illness-definitions', label: 'Critical Illness Definitions' },
];

export default function PolicyDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const activeTab = searchParams.get('tab') || 'definitions';

  const [product, setProduct] = useState<any>(null);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [sectionItems, setSectionItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({ term: '', definition: '', category: 'general' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [productId, activeTab]);

  const fetchData = async () => {
    try {
      const token = apiClient.getAccessToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch product
      const productRes = await fetch(`http://localhost:3000/api/v1/products/${productId}`, { headers });
      const productData = await productRes.json();
      setProduct(productData);

      // Fetch definitions
      const defsRes = await fetch(`http://localhost:3000/api/v1/products/${productId}/definitions`, { headers });
      if (defsRes.ok) {
        const defsData = await defsRes.json();
        setDefinitions(defsData);
      }

      // Fetch section items if not on definitions tab
      if (activeTab !== 'definitions') {
        const itemsRes = await fetch(`http://localhost:3000/api/v1/products/${productId}/section-items/${activeTab}`, { headers });
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setSectionItems(itemsData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (def: Definition) => {
    setEditingId(def.id);
    setFormData({ term: def.term, definition: def.definition, category: def.category });
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setEditingId(null);
    setFormData({ term: '', definition: '', category: 'general' });
  };

  const handleSave = async () => {
    if (!formData.term || !formData.definition) {
      alert('Term and definition are required');
      return;
    }

    setSaving(true);
    try {
      const token = apiClient.getAccessToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (editingId) {
        // Update existing
        await fetch(`http://localhost:3000/api/v1/products/definitions/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
        });
      } else {
        // Add new
        await fetch(`http://localhost:3000/api/v1/products/${productId}/definitions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
      }

      setEditingId(null);
      setAddingNew(false);
      setFormData({ term: '', definition: '', category: 'general' });
      fetchData();
      alert('Definition saved successfully');
    } catch (error) {
      console.error('Failed to save definition:', error);
      alert('Failed to save definition');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this definition?')) return;

    try {
      const token = apiClient.getAccessToken();
      await fetch(`http://localhost:3000/api/v1/products/definitions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      fetchData();
      alert('Definition deleted successfully');
    } catch (error) {
      console.error('Failed to delete definition:', error);
      alert('Failed to delete definition');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setAddingNew(false);
    setFormData({ term: '', definition: '', category: 'general' });
  };

  const filteredDefinitions = filterCategory === 'all' 
    ? definitions 
    : definitions.filter(def => def.category === filterCategory);

  const handleAddSectionItem = async (data: { title: string; content: string }) => {
    const token = apiClient.getAccessToken();
    await fetch(`http://localhost:3000/api/v1/products/${productId}/section-items/${activeTab}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    fetchData();
  };

  const handleUpdateSectionItem = async (itemId: string, data: { title: string; content: string }) => {
    const token = apiClient.getAccessToken();
    await fetch(`http://localhost:3000/api/v1/products/section-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    fetchData();
  };

  const handleDeleteSectionItem = async (itemId: string) => {
    const token = apiClient.getAccessToken();
    await fetch(`http://localhost:3000/api/v1/products/section-items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchData();
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')}>
              ← Back to Policy Creator
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">{product?.name} - Policy Document</h1>
            <p className="text-gray-600 mt-1">Configure policy sections and definitions</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {POLICY_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => router.push(`/admin/products/${productId}/benefits?tab=${section.id}`)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'definitions' && (
          <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Definitions ({filteredDefinitions.length})</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  In this Policy, unless the context indicates a contrary intention, the following words and expressions bear the meanings assigned to them and cognate expressions bear corresponding meanings
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded text-sm"
                >
                  <option value="all">All Categories ({definitions.length})</option>
                  <option value="general">General</option>
                  <option value="medical">Medical</option>
                  <option value="legal">Legal</option>
                  <option value="financial">Financial</option>
                </select>
                <Button onClick={handleAddNew} disabled={addingNew || editingId !== null} size="sm">
                  + Add Definition
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {addingNew && (
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold mb-3">Add New Definition</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Term</label>
                      <Input
                        value={formData.term}
                        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                        placeholder="e.g., Accident or Accidental"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded mt-1"
                      >
                        <option value="general">General</option>
                        <option value="medical">Medical</option>
                        <option value="legal">Legal</option>
                        <option value="financial">Financial</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Definition</label>
                      <textarea
                        value={formData.definition}
                        onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                        placeholder="Enter the complete definition..."
                        rows={6}
                        className="w-full px-3 py-2 border rounded mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {filteredDefinitions.map((def) => (
                <div key={def.id} className="border rounded-lg p-4">
                  {editingId === def.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Term</label>
                        <Input
                          value={formData.term}
                          onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded mt-1"
                        >
                          <option value="general">General</option>
                          <option value="medical">Medical</option>
                          <option value="legal">Legal</option>
                          <option value="financial">Financial</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Definition</label>
                        <textarea
                          value={formData.definition}
                          onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 border rounded mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{def.term}</h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">{def.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(def)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(def.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{def.definition}</p>
                    </div>
                  )}
                </div>
              ))}

              {filteredDefinitions.length === 0 && !addingNew && (
                <p className="text-center text-gray-500 py-8">
                  {filterCategory === 'all' 
                    ? 'No definitions added yet. Click "Add Definition" to get started.'
                    : `No ${filterCategory} definitions found.`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Waiting Periods Tab */}
        {activeTab === 'waiting-periods' && (
          <Card>
            <CardHeader>
              <CardTitle>Waiting Periods ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                The Waiting Period is the period subsequent to the Inception Date of the Policy, in which no Benefits will be paid
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Waiting Period Items"
              />
            </CardContent>
          </Card>
        )}

        {/* General Provisions Tab */}
        {activeTab === 'general-provisions' && (
          <Card>
            <CardHeader>
              <CardTitle>General Provisions ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                It is declared and agreed that:
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="General Provisions"
              />
            </CardContent>
          </Card>
        )}

        {/* Payment of Premium Tab */}
        {activeTab === 'payment-premium' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment of Premium ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Terms and conditions for premium payments
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Payment of Premium"
              />
            </CardContent>
          </Card>
        )}

        {/* Exclusions & Limitations Tab */}
        {activeTab === 'exclusions-limitations' && (
          <Card>
            <CardHeader>
              <CardTitle>Exclusions & Limitations ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                The Insurer shall not be liable to pay Compensation for Bodily Injury, Illness, Maternity or Critical Illness in respect of any Insured Person:
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Exclusions and Limitations"
              />
            </CardContent>
          </Card>
        )}

        {/* General Conditions Tab */}
        {activeTab === 'general-conditions' && (
          <Card>
            <CardHeader>
              <CardTitle>General Conditions ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                General terms and conditions of the policy
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="General Conditions"
              />
            </CardContent>
          </Card>
        )}

        {/* Insuring Section Tab */}
        {activeTab === 'insuring-section' && (
          <Card>
            <CardHeader>
              <CardTitle>Insuring Section ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                The following Insurance Cover and Benefits shall be available to the Insured Persons and payable directly to the Service Provider as follows:
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Benefits"
              />
            </CardContent>
          </Card>
        )}

        {/* Funeral Benefit Tab */}
        {activeTab === 'funeral-benefit' && (
          <Card>
            <CardHeader>
              <CardTitle>Funeral Benefit ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                The following Insurance Cover and Benefits shall be available to the Insured Person's estate as follows:
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Funeral Benefits"
              />
            </CardContent>
          </Card>
        )}

        {/* Critical Illness Definitions Tab */}
        {activeTab === 'critical-illness-definitions' && (
          <Card>
            <CardHeader>
              <CardTitle>Critical Illness Definitions ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Definitions of Heart Attack, Stroke and Cancer
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Critical Illness Definitions"
              />
            </CardContent>
          </Card>
        )}

        {/* Other sections - Coming soon */}
        {activeTab !== 'definitions' && activeTab !== 'waiting-periods' && activeTab !== 'general-provisions' && activeTab !== 'payment-premium' && activeTab !== 'exclusions-limitations' && activeTab !== 'general-conditions' && activeTab !== 'insuring-section' && activeTab !== 'funeral-benefit' && activeTab !== 'critical-illness-definitions' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {POLICY_SECTIONS.find(s => s.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600">This section is coming soon.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
