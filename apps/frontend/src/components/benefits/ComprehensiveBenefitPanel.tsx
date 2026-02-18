'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  benefitId: string;
  benefitName: string;
}

export function ComprehensiveBenefitPanel({ benefitId, benefitName }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'network' | 'codes' | 'exclusions' | 'conditions' | 'authorization'>('details');
  
  // Benefit Details State
  const [details, setDetails] = useState<any>(null);
  const [fullDescription, setFullDescription] = useState('');
  const [coverageSummary, setCoverageSummary] = useState('');
  
  // Network Providers State
  const [networkProviders, setNetworkProviders] = useState<any[]>([]);
  const [newProvider, setNewProvider] = useState({ name: '', type: '', location: '' });
  
  // Procedure Codes State
  const [procedureCodes, setProcedureCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState({ code: '', type: '', description: '' });
  
  // Exclusions State
  const [exclusions, setExclusions] = useState<any[]>([]);
  const [newExclusion, setNewExclusion] = useState({ description: '', category: '' });
  
  // Conditions State
  const [conditions, setConditions] = useState<any[]>([]);
  const [newCondition, setNewCondition] = useState({ description: '', type: '' });
  
  // Authorization Rules State
  const [authRules, setAuthRules] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, [benefitId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel
      const [detailsRes, networkRes, codesRes, exclusionsRes, conditionsRes, authRes] = await Promise.all([
        fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/details`, { headers }),
        fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/network-providers`, { headers }),
        fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/procedure-codes`, { headers }),
        fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/exclusions`, { headers }),
        fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/conditions`, { headers }),
        fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/authorization-rules`, { headers }),
      ]);

      if (detailsRes.ok) {
        const data = await detailsRes.json();
        setDetails(data);
        setFullDescription(data?.full_description || '');
        setCoverageSummary(data?.coverage_summary || '');
      }
      if (networkRes.ok) setNetworkProviders(await networkRes.json());
      if (codesRes.ok) setProcedureCodes(await codesRes.json());
      if (exclusionsRes.ok) setExclusions(await exclusionsRes.json());
      if (conditionsRes.ok) setConditions(await conditionsRes.json());
      if (authRes.ok) setAuthRules(await authRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/details`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_description: fullDescription,
          coverage_summary: coverageSummary,
        }),
      });
      alert('Details saved successfully');
      fetchAllData();
    } catch (error) {
      console.error('Failed to save details:', error);
      alert('Failed to save details');
    }
  };

  const addNetworkProvider = async () => {
    if (!newProvider.name || !newProvider.type) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/network-providers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProvider),
      });
      setNewProvider({ name: '', type: '', location: '' });
      fetchAllData();
    } catch (error) {
      console.error('Failed to add provider:', error);
    }
  };

  const deleteNetworkProvider = async (providerId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/network-providers/${providerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete provider:', error);
    }
  };

  const addProcedureCode = async () => {
    if (!newCode.code || !newCode.type) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/procedure-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCode),
      });
      setNewCode({ code: '', type: '', description: '' });
      fetchAllData();
    } catch (error) {
      console.error('Failed to add code:', error);
    }
  };

  const deleteProcedureCode = async (codeId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/procedure-codes/${codeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete code:', error);
    }
  };

  const addExclusion = async () => {
    if (!newExclusion.description) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/exclusions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExclusion),
      });
      setNewExclusion({ description: '', category: '' });
      fetchAllData();
    } catch (error) {
      console.error('Failed to add exclusion:', error);
    }
  };

  const deleteExclusion = async (exclusionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/exclusions/${exclusionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete exclusion:', error);
    }
  };

  const addCondition = async () => {
    if (!newCondition.description) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/${benefitId}/conditions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCondition),
      });
      setNewCondition({ description: '', type: '' });
      fetchAllData();
    } catch (error) {
      console.error('Failed to add condition:', error);
    }
  };

  const deleteCondition = async (conditionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/v1/products/benefits/conditions/${conditionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete condition:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading comprehensive details...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'details' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('details')}
        >
          📝 Details
        </Button>
        <Button
          variant={activeTab === 'network' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('network')}
        >
          🏥 Network ({networkProviders.length})
        </Button>
        <Button
          variant={activeTab === 'codes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('codes')}
        >
          🔢 Codes ({procedureCodes.length})
        </Button>
        <Button
          variant={activeTab === 'exclusions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('exclusions')}
        >
          ⛔ Exclusions ({exclusions.length})
        </Button>
        <Button
          variant={activeTab === 'conditions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('conditions')}
        >
          📋 Conditions ({conditions.length})
        </Button>
        <Button
          variant={activeTab === 'authorization' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('authorization')}
        >
          ✅ Authorization
        </Button>
      </div>

      {activeTab === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Benefit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Description</label>
              <textarea
                value={fullDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFullDescription(e.target.value)}
                placeholder="Complete description of this benefit..."
                rows={6}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Coverage Summary</label>
              <textarea
                value={coverageSummary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoverageSummary(e.target.value)}
                placeholder="Brief summary of what's covered..."
                rows={3}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
            </div>
            <Button onClick={saveDetails}>Save Details</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'network' && (
        <Card>
          <CardHeader>
            <CardTitle>Network Providers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Provider name"
                value={newProvider.name}
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
              />
              <select
                value={newProvider.type}
                onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select type</option>
                <option value="hospital">Hospital</option>
                <option value="doctor">Doctor</option>
                <option value="specialist">Specialist</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="lab">Laboratory</option>
              </select>
              <Input
                placeholder="Location"
                value={newProvider.location}
                onChange={(e) => setNewProvider({ ...newProvider, location: e.target.value })}
              />
            </div>
            <Button onClick={addNetworkProvider} size="sm">Add Provider</Button>

            <div className="space-y-2 mt-4">
              {networkProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{provider.provider_name}</p>
                    <p className="text-sm text-gray-600">{provider.provider_type} • {provider.location}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteNetworkProvider(provider.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {networkProviders.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No network providers added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'codes' && (
        <Card>
          <CardHeader>
            <CardTitle>Procedure Codes (ICD-10 / Tariff)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Code"
                value={newCode.code}
                onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
              />
              <select
                value={newCode.type}
                onChange={(e) => setNewCode({ ...newCode, type: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select type</option>
                <option value="icd10">ICD-10</option>
                <option value="tariff">Tariff Code</option>
                <option value="nappi">NAPPI Code</option>
              </select>
              <Input
                placeholder="Description"
                value={newCode.description}
                onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
              />
            </div>
            <Button onClick={addProcedureCode} size="sm">Add Code</Button>

            <div className="space-y-2 mt-4">
              {procedureCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{code.code} <span className="text-xs bg-gray-100 px-2 py-1 rounded">{code.code_type}</span></p>
                    <p className="text-sm text-gray-600">{code.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProcedureCode(code.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {procedureCodes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No procedure codes added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'exclusions' && (
        <Card>
          <CardHeader>
            <CardTitle>Benefit Exclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Exclusion description"
                value={newExclusion.description}
                onChange={(e) => setNewExclusion({ ...newExclusion, description: e.target.value })}
              />
              <select
                value={newExclusion.category}
                onChange={(e) => setNewExclusion({ ...newExclusion, category: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select category</option>
                <option value="general">General</option>
                <option value="pre_existing">Pre-existing Conditions</option>
                <option value="cosmetic">Cosmetic</option>
                <option value="experimental">Experimental</option>
              </select>
            </div>
            <Button onClick={addExclusion} size="sm">Add Exclusion</Button>

            <div className="space-y-2 mt-4">
              {exclusions.map((exclusion) => (
                <div key={exclusion.id} className="flex items-center justify-between p-3 border rounded bg-red-50">
                  <div>
                    <p className="font-medium">{exclusion.exclusion_description}</p>
                    {exclusion.category && (
                      <span className="text-xs bg-red-100 px-2 py-1 rounded">{exclusion.category}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteExclusion(exclusion.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {exclusions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No exclusions added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'conditions' && (
        <Card>
          <CardHeader>
            <CardTitle>Benefit Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Condition description"
                value={newCondition.description}
                onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
              />
              <select
                value={newCondition.type}
                onChange={(e) => setNewCondition({ ...newCondition, type: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select type</option>
                <option value="eligibility">Eligibility</option>
                <option value="usage">Usage</option>
                <option value="documentation">Documentation</option>
                <option value="approval">Approval</option>
              </select>
            </div>
            <Button onClick={addCondition} size="sm">Add Condition</Button>

            <div className="space-y-2 mt-4">
              {conditions.map((condition) => (
                <div key={condition.id} className="flex items-center justify-between p-3 border rounded bg-yellow-50">
                  <div>
                    <p className="font-medium">{condition.condition_description}</p>
                    {condition.condition_type && (
                      <span className="text-xs bg-yellow-100 px-2 py-1 rounded">{condition.condition_type}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCondition(condition.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {conditions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No conditions added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'authorization' && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-Authorization Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Authorization rules configuration coming soon...</p>
            {authRules && (
              <pre className="mt-4 p-4 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(authRules, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
