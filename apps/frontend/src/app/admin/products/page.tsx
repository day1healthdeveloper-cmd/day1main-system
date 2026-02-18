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
  regime: 'medical_scheme' | 'insurance';
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';
  monthlyPremium: number;
  coverAmount: number;
  createdBy: string;
  createdDate: string;
  approvals: { role: string; status: 'pending' | 'approved' | 'rejected'; date?: string }[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingProduct, setViewingProduct] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      
      // Transform API response to match Product interface
      const transformedProducts = data.products?.map((p: any) => ({
        id: p.id,
        name: p.name,
        regime: p.regime,
        status: p.status,
        monthlyPremium: p.monthly_premium || 0,
        coverAmount: p.cover_amount || 0,
        createdBy: p.created_by || 'System',
        createdDate: p.created_at,
        approvals: [], // TODO: Fetch approvals if needed
      })) || [];
      
      setProducts(transformedProducts);
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
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status.replace('_', ' ').toUpperCase()}</span>;
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
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Monthly Premium</p>
                          <p className="font-medium">R{product.monthlyPremium.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cover Amount</p>
                          <p className="font-medium">R{product.coverAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="font-medium">{new Date(product.createdDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
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
