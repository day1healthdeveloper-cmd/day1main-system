'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PolicyDocumentViewer } from '@/components/policy/PolicyDocumentViewer';

interface Product {
  id: string;
  name: string;
  code: string;
  slug: string;
  category: string;
  regime: 'medical_scheme' | 'insurance';
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';
  description: string;
  price_single: number;
  price_couple: number;
  price_per_child: number;
  price_range_min: number;
  price_range_max: number;
  age_restriction: string;
  monthlyPremium: number;
  coverAmount: number;
  createdBy: string;
  createdDate: string;
  approvals: { role: string; status: 'pending' | 'approved' | 'rejected'; date?: string }[];
  benefits?: Benefit[];
}

interface Benefit {
  id: string;
  name: string;
  type: string;
  description: string;
  cover_amount: number;
  waiting_period_days: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingProduct, setViewingProduct] = useState<{ id: string; name: string } | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      
      // Fetch benefits for each product
      const productsWithBenefits = await Promise.all(
        (data.products || []).map(async (p: any) => {
          const benefitsResponse = await fetch(`/api/admin/products/${p.id}/benefits`);
          const benefitsData = await benefitsResponse.json();
          
          return {
            id: p.id,
            name: p.name,
            code: p.code,
            slug: p.slug,
            category: p.category,
            regime: p.regime,
            status: p.status,
            description: p.description,
            price_single: p.price_single || 0,
            price_couple: p.price_couple || 0,
            price_per_child: p.price_per_child || 0,
            price_range_min: p.price_range_min || 0,
            price_range_max: p.price_range_max || 0,
            age_restriction: p.age_restriction || 'All ages',
            monthlyPremium: p.monthly_premium || 0,
            coverAmount: p.cover_amount || 0,
            createdBy: p.created_by || 'System',
            createdDate: p.created_at,
            approvals: [],
            benefits: benefitsData.benefits || []
          };
        })
      );
      
      setProducts(productsWithBenefits);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  if (loading || dataLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusBadge = (status: Product['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</span>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Policy Creator</h1>
            <p className="text-gray-600 mt-1">Create and manage product catalog with benefit rules</p>
          </div>
          <Button onClick={() => router.push('/admin/products/new')}>+ Create New Product</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>All products and their approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        {getStatusBadge(product.status)}
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      )}
                      
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Single</p>
                          <p className="font-medium text-blue-600">R{product.price_single?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Couple</p>
                          <p className="font-medium text-blue-600">R{product.price_couple?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Per Child</p>
                          <p className="font-medium text-blue-600">R{product.price_per_child?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price Range</p>
                          <p className="font-medium">R{product.price_range_min?.toLocaleString()} - R{product.price_range_max?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Age Restriction: </span>
                          <span className="font-medium">{product.age_restriction}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Benefits: </span>
                          <span className="font-medium">{product.benefits?.length || 0}</span>
                        </div>
                      </div>

                      {/* Benefits Section - Expandable */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="mt-4">
                          <button
                            onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {expandedProduct === product.id ? '▼' : '▶'} 
                            View {product.benefits.length} Benefits
                          </button>
                          
                          {expandedProduct === product.id && (
                            <div className="mt-3 space-y-2 bg-gray-50 p-4 rounded-lg">
                              {product.benefits.map((benefit, idx) => (
                                <div key={idx} className="border-l-4 border-blue-500 pl-3 py-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{benefit.name}</p>
                                      <p className="text-xs text-gray-600 mt-1">{benefit.description}</p>
                                      <div className="flex gap-4 mt-2 text-xs">
                                        {benefit.cover_amount && (
                                          <span className="text-green-700 font-medium">
                                            Cover: R{parseFloat(benefit.cover_amount.toString()).toLocaleString()}
                                          </span>
                                        )}
                                        {benefit.waiting_period_days > 0 && (
                                          <span className="text-orange-700">
                                            {benefit.waiting_period_days >= 365 ? `${Math.round(benefit.waiting_period_days / 30)} months waiting period` : benefit.waiting_period_days >= 30 ? `${Math.round(benefit.waiting_period_days / 30)} month${Math.round(benefit.waiting_period_days / 30) > 1 ? 's' : ''} waiting period` : `${benefit.waiting_period_days} days waiting period`}
                                          </span>
                                        )}
                                        {benefit.waiting_period_days === 0 && (
                                          <span className="text-green-700 font-medium">
                                            Immediate cover
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                      {benefit.type}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-medium text-gray-700">Approvals:</p>
                        {product.approvals.map((approval, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">{approval.role}:</span>
                            <span className={`font-medium ${approval.status === 'approved' ? 'text-green-600' : approval.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {approval.status.toUpperCase()}
                            </span>
                            {approval.date && <span className="text-gray-500">({new Date(approval.date).toLocaleDateString()})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/products/${product.id}/benefits`)}>
                        Configure Plan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setViewingProduct({ id: product.id, name: product.name })}>
                        View Details
                      </Button>
                      {product.status === 'pending_approval' && <Button size="sm">Review</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {viewingProduct && (
        <PolicyDocumentViewer
          productId={viewingProduct.id}
          productName={viewingProduct.name}
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </SidebarLayout>
  );
}
