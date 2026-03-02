'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { apiClient } from '@/lib/api-client'; // Removed - backend no longer exists
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
      console.log('[fetchData] Starting fetch for product:', productId, 'tab:', activeTab);
      
      // Fetch product from Supabase
      const productRes = await fetch(`/api/admin/products/${productId}`);
      if (productRes.ok) {
        const productData = await productRes.json();
        setProduct(productData);
      }
      
      // Fetch policy section items
      const sectionsRes = await fetch(`/api/admin/products/${productId}/policy-sections?t=${Date.now()}`);
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        
        console.log('[fetchData] Sections data received:', {
          sectionKeys: Object.keys(sectionsData.sections || {}),
          definitionsCount: sectionsData.sections?.definitions?.length || 0,
          activeTab
        });
        
        // Set section items for current tab
        if (sectionsData.sections && sectionsData.sections[activeTab]) {
          console.log('[fetchData] Setting section items for tab:', activeTab, 'count:', sectionsData.sections[activeTab].length);
          setSectionItems(sectionsData.sections[activeTab]);
        } else {
          console.log('[fetchData] No section items found for tab:', activeTab);
          setSectionItems([]);
        }
        
        // For definitions tab, also set the definitions state for backward compatibility
        if (activeTab === 'definitions' && sectionsData.sections && sectionsData.sections['definitions']) {
          // Convert section items to definition format
          const defs = sectionsData.sections['definitions'].map((item: any) => ({
            id: item.id,
            term: item.title,
            definition: item.content,
            category: 'general',
            display_order: item.display_order
          }));
          console.log('[fetchData] Setting definitions:', defs.length);
          setDefinitions(defs);
        } else if (activeTab === 'definitions') {
          console.log('[fetchData] No definitions found');
          setDefinitions([]);
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
    alert('This feature is temporarily disabled - backend removed');
    return;
    /*
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
    */
  };

  const handleDelete = async (id: string) => {
    alert('This feature is temporarily disabled - backend removed');
    return;
    /*
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
    */
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
    alert('This feature is temporarily disabled - backend removed');
    return;
    /*
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
    */
  };

  const handleUpdateSectionItem = async (itemId: string, data: { title: string; content: string }) => {
    alert('This feature is temporarily disabled - backend removed');
    return;
    /*
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
    */
  };

  const handleDeleteSectionItem = async (itemId: string) => {
    alert('This feature is temporarily disabled - backend removed');
    return;
    /*
    const token = apiClient.getAccessToken();
    await fetch(`http://localhost:3000/api/v1/products/section-items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchData();
    */
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
              <CardTitle>Definitions ({sectionItems.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                In this Policy, unless the context indicates a contrary intention, the following words and expressions bear the meanings assigned to them and cognate expressions bear corresponding meanings
              </p>
            </CardHeader>
            <CardContent>
              <PolicySectionItems
                items={sectionItems}
                onAdd={handleAddSectionItem}
                onUpdate={handleUpdateSectionItem}
                onDelete={handleDeleteSectionItem}
                sectionName="Definitions"
              />
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
