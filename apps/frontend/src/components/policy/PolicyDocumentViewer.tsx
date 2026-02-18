'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

interface PolicyDocumentViewerProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyDocumentViewer({ productId, productName, isOpen, onClose }: PolicyDocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [sections, setSections] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      fetchPolicyData();
    }
  }, [isOpen, productId]);

  const fetchPolicyData = async () => {
    try {
      const token = apiClient.getAccessToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch definitions
      const defsRes = await fetch(`http://localhost:3000/api/v1/products/${productId}/definitions`, { headers });
      if (defsRes.ok) {
        const defsData = await defsRes.json();
        setDefinitions(defsData);
      }

      // Fetch all section items
      const sectionTypes = [
        'waiting-periods',
        'general-provisions',
        'payment-premium',
        'exclusions-limitations',
        'general-conditions',
        'insuring-section',
        'funeral-benefit',
        'critical-illness-definitions'
      ];

      const sectionsData: any = {};
      for (const sectionType of sectionTypes) {
        const res = await fetch(`http://localhost:3000/api/v1/products/${productId}/section-items/${sectionType}`, { headers });
        if (res.ok) {
          const data = await res.json();
          sectionsData[sectionType] = data;
        }
      }
      setSections(sectionsData);
    } catch (error) {
      console.error('Failed to fetch policy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupDefinitionsByCategory = () => {
    const grouped: any = {};
    definitions.forEach(def => {
      if (!grouped[def.category]) {
        grouped[def.category] = [];
      }
      grouped[def.category].push(def);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productName} - Policy Document</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">Loading policy document...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const groupedDefinitions = groupDefinitionsByCategory();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{productName} - Policy Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          {/* Definitions Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">1. DEFINITIONS</h2>
            {Object.entries(groupedDefinitions).map(([category, defs]: [string, any]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 capitalize">{category} Terms</h3>
                <div className="space-y-3">
                  {defs.map((def: any) => (
                    <div key={def.id} className="ml-4">
                      <p className="font-semibold text-gray-900">{def.term}</p>
                      <p className="text-gray-700 ml-4">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Waiting Periods */}
          {sections['waiting-periods']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">2. WAITING PERIODS</h2>
              <p className="mb-4 text-gray-700">The Waiting Period is the period subsequent to the Inception Date of the Policy, in which no Benefits will be paid:</p>
              <div className="space-y-2">
                {sections['waiting-periods'].map((item: any) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* General Provisions */}
          {sections['general-provisions']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">3. GENERAL PROVISIONS</h2>
              <p className="mb-4 text-gray-700">It is declared and agreed that:</p>
              <div className="space-y-2">
                {sections['general-provisions'].map((item: any, idx: number) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">3.{idx + 1} {item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment of Premium */}
          {sections['payment-premium']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">4. PAYMENT OF PREMIUM</h2>
              <div className="space-y-2">
                {sections['payment-premium'].map((item: any) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Exclusions & Limitations */}
          {sections['exclusions-limitations']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">5. GENERAL EXCLUSIONS AND LIMITATIONS</h2>
              <p className="mb-4 text-gray-700">The Insurer shall not be liable to pay Compensation for Bodily Injury, Illness, Maternity or Critical Illness in respect of any Insured Person:</p>
              <div className="space-y-2">
                {sections['exclusions-limitations'].map((item: any, idx: number) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">5.{idx + 1} {item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* General Conditions */}
          {sections['general-conditions']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">6. GENERAL CONDITIONS</h2>
              <div className="space-y-2">
                {sections['general-conditions'].map((item: any, idx: number) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">6.{idx + 1} {item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Insuring Section */}
          {sections['insuring-section']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">7. INSURING SECTION</h2>
              <p className="mb-4 text-gray-700">The following Insurance Cover and Benefits shall be available to the Insured Persons and payable directly to the Service Provider as follows:</p>
              <div className="space-y-2">
                {sections['insuring-section'].map((item: any, idx: number) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">7.{idx + 1} {item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Funeral Benefit */}
          {sections['funeral-benefit']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">8. FUNERAL BENEFIT</h2>
              <p className="mb-4 text-gray-700">The following Insurance Cover and Benefits shall be available to the Insured Person's estate as follows:</p>
              <div className="space-y-2">
                {sections['funeral-benefit'].map((item: any, idx: number) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">8.{idx + 1} {item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Critical Illness Definitions */}
          {sections['critical-illness-definitions']?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">9. CRITICAL ILLNESS DEFINITIONS</h2>
              <p className="mb-4 text-gray-700">Definitions of Heart Attack, Stroke and Cancer</p>
              <div className="space-y-2">
                {sections['critical-illness-definitions'].map((item: any, idx: number) => (
                  <div key={item.id} className="ml-4">
                    <p className="font-semibold text-gray-900">9.{idx + 1} {item.title}</p>
                    <p className="text-gray-700 ml-4">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
