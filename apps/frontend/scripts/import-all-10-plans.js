/**
 * Import All 10 Official Day1Health Plans
 * Run with: node scripts/import-all-10-plans.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// All 10 official plans with complete benefit data
const allPlans = require('./plans-data.json');

async function importAllPlans() {
  console.log('🚀 Starting import of all 10 official plans...\n');

  try {
    // Delete existing products
    console.log('🗑️  Deleting existing products...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Deleted\n');

    let successCount = 0;

    for (const plan of allPlans) {
      try {
        console.log(`  → Importing: ${plan.name}`);
        
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            name: plan.name,
            code: plan.slug.toUpperCase().replace(/-/g, '_'),
            slug: plan.slug,
            category: plan.category,
            regime: 'insurance',
            status: 'published',
            description: plan.description,
            price_single: plan.price_single,
            price_couple: plan.price_couple,
            price_per_child: plan.price_per_child,
            price_range_min: plan.price_range_min,
            price_range_max: plan.price_range_max,
            age_restriction: plan.age_restriction,
            monthly_premium: plan.price_single,
            cover_amount: plan.benefits[0]?.cover_amount || 0
          })
          .select()
          .single();

        if (productError) throw productError;

        const benefitsToInsert = plan.benefits.map(b => ({
          product_id: product.id,
          name: b.name,
          type: b.type,
          description: b.description,
          cover_amount: b.cover_amount || null,
          waiting_period_days: b.waiting_period_days || 0,
          annual_limit: b.annual_limit || null,
          day_1_amount: b.day_1_amount || null,
          day_2_amount: b.day_2_amount || null,
          day_3_amount: b.day_3_amount || null,
          daily_amount_after: b.daily_amount_after || null,
          max_days: b.max_days || null,
          pre_existing_exclusion_days: b.pre_existing_exclusion_days || null,
          family_cover_amount: b.family_cover_amount || null,
          min_age: b.min_age || null,
          principal_amount: b.principal_amount || null,
          spouse_amount: b.spouse_amount || null,
          child_14_amount: b.child_14_amount || null,
          child_6_amount: b.child_6_amount || null,
          child_0_amount: b.child_0_amount || null,
          stillborn_amount: b.stillborn_amount || null,
          default_limit: b.default_limit || null,
          principal_only: b.principal_only || null,
          frequency_months: b.frequency_months || null,
          pre_existing_waiting_days: b.pre_existing_waiting_days || null,
          exclusions: b.exclusions || null
        }));

        const { error: benefitsError } = await supabase
          .from('product_benefits')
          .insert(benefitsToInsert);

        if (benefitsError) throw benefitsError;

        console.log(`    ✅ Imported with ${plan.benefits.length} benefits`);
        successCount++;

      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Successfully imported: ${successCount}/${allPlans.length} plans`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

importAllPlans();
