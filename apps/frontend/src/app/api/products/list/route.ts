import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all published products from the database
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, code, monthly_premium')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform to match the expected format
    const formattedProducts = (products || []).map((product) => ({
      id: product.code,
      name: product.name,
      price: product.monthly_premium ? parseFloat(product.monthly_premium) : 0,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
