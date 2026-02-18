import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedLandingPage() {
  console.log('🌱 Seeding Day1Health landing page...');

  try {
    // Get marketing user
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'marketing@day1main.com')
      .single();

    if (!users) {
      console.error('❌ Marketing user not found. Please run seed-marketing-user.ts first');
      process.exit(1);
    }

    const marketingUserId = users.id;

    // Check if landing page already exists
    const { data: existing } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', 'summer-health-2026')
      .single();

    if (existing) {
      console.log('✅ Landing page already exists');
      return;
    }

    // Create the Day1Health landing page
    const landingPageContent = {
      template: 'day1health',
      sections: [
        {
          type: 'plan-slider',
          slides: [
            {
              name: 'Ultra Value Plus Starter',
              price: 189,
              ageRange: 'Ages 18-40',
              bgImage: '/img1.JPG',
              sliderName: 'starter',
              pricing: { spouse: 140, child: 70 },
              benefits: [
                {
                  title: 'Accident Cover',
                  icon: '🚗',
                  details: [
                    'R50,000 cover during the first 3 months',
                    'R100,000 cover after 3 months of continuous membership',
                    'Cover applies per incident',
                    'Immediate Cover',
                  ],
                },
                {
                  title: 'Hospital Cover',
                  icon: '🏥',
                  details: [
                    'Private In-Hospital Illness Cover',
                    'R10,000 paid to a private hospital for each 24 hour day, up to 3 days',
                    '1 incident per annum | A 3 month general waiting period and a 12-month pre-existing conditions exclusion applies',
                  ],
                },
                {
                  title: 'Ambulance Assist',
                  icon: '🚑',
                  details: [
                    '24 Hour Ambulance Assist. Authorisation required prior to hospital admission',
                    'Immediate Cover',
                  ],
                },
                {
                  title: 'Virtual Doctor Visits',
                  icon: '👨‍⚕️',
                  details: [
                    'Access to pay-as-you-go virtual doctor consultations as and when necessary',
                    'Immediate Cover',
                    'Pre-authorisation required',
                  ],
                },
              ],
            },
            {
              name: 'Ultra Value Plus Priority',
              price: 249,
              ageRange: 'Ages 18-64',
              bgImage: '/img2.JPG',
              sliderName: 'priority',
              pricing: { spouse: 140, child: 70 },
              benefits: [
                {
                  title: 'Accident Cover',
                  icon: '🚗',
                  details: [
                    'R50,000 cover during the first 3 months',
                    'R100,000 cover after 3 months',
                    'Cover applies per incident',
                    'Immediate Cover',
                  ],
                },
                {
                  title: 'Hospital Cover',
                  icon: '🏥',
                  details: [
                    'Private In-Hospital Illness Cover',
                    'R10,000 per 24-hour day (up to 3 days)',
                    '1 incident per annum',
                    '3 month waiting period applies',
                  ],
                },
                {
                  title: 'Ambulance Assist',
                  icon: '🚑',
                  details: [
                    '24 Hour Ambulance Assist',
                    'Pre-authorisation required',
                    'Immediate Cover',
                  ],
                },
                {
                  title: 'Funeral Cover',
                  icon: '⚰️',
                  details: [
                    'R20,000 Funeral Cover',
                    '3-day Car Hire',
                    'Airtime & Electricity',
                  ],
                },
              ],
            },
            {
              name: 'Value Plus Hospital',
              price: 390,
              ageRange: 'Ages 18-64',
              bgImage: '/img1.JPG',
              sliderName: 'valueplus',
              pricing: { spouse: 312, child: 156 },
              benefits: [
                {
                  title: 'Unlimited Events',
                  icon: '♾️',
                  details: [
                    'Unlimited Accident & Illness Events',
                    'No annual caps',
                    'Comprehensive coverage',
                  ],
                },
                {
                  title: 'Hospital Cover',
                  icon: '🏥',
                  details: [
                    'Private In-Hospital Illness Cover',
                    'Enhanced daily benefits',
                    'Multiple incidents covered',
                  ],
                },
                {
                  title: 'Ambulance Assist',
                  icon: '🚑',
                  details: [
                    '24 Hour Ambulance Assist',
                    'Pre-authorisation required',
                    'Immediate Cover',
                  ],
                },
                {
                  title: 'Virtual Doctor Visits',
                  icon: '👨‍⚕️',
                  details: ['Pay-as-you-go consultations', 'Immediate Cover'],
                },
              ],
            },
            {
              name: 'Executive Hospital',
              price: 640,
              ageRange: 'Premium Coverage',
              bgImage: '/img2.JPG',
              sliderName: 'executive',
              pricing: { spouse: 512, child: 256 },
              benefits: [
                {
                  title: 'Maximum Cover',
                  icon: '⭐',
                  details: [
                    'Highest accident cover',
                    'Critical Illness cover',
                    'Accidental Permanent Disability',
                  ],
                },
                {
                  title: 'Hospital Cover',
                  icon: '🏥',
                  details: [
                    'Premium In-Hospital Cover',
                    'Illness top-up benefit',
                    'Unlimited events',
                  ],
                },
                {
                  title: 'Enhanced Benefits',
                  icon: '💎',
                  details: [
                    'Enhanced funeral benefits',
                    '24/7 Ambulance Assist',
                    'Priority service',
                  ],
                },
                {
                  title: 'Virtual Doctor Visits',
                  icon: '👨‍⚕️',
                  details: ['Unlimited consultations', 'Immediate Cover'],
                },
              ],
            },
          ],
        },
        {
          type: 'value-promise-strip',
          promises: [
            { icon: 'Building2', text: 'Private Hospitals' },
            { icon: 'Zap', text: 'Instant Accident Cover' },
            { icon: 'Phone', text: 'Nurse Hotline' },
            { icon: 'Stethoscope', text: 'R285 Doctor Consults' },
          ],
        },
        {
          type: 'three-plan-cards',
          plans: [
            { name: 'Ultra Value Plus Starter', price: 189 },
            { name: 'Value Plus Hospital', price: 390 },
            { name: 'Executive Hospital', price: 640 },
          ],
        },
        {
          type: 'unlimited-events-banner',
        },
        {
          type: 'what-you-get',
          benefits: [
            { icon: 'Building2', text: 'Private hospitals' },
            { icon: 'Zap', text: 'Instant accident cover' },
            { icon: 'Phone', text: 'Nurse & doctor access' },
            { icon: 'DollarSign', text: 'No hidden fees' },
            { icon: 'Smartphone', text: 'Fast digital onboarding' },
            { icon: 'Users', text: 'Family-friendly pricing' },
          ],
        },
      ],
    };

    const { data, error } = await supabase
      .from('landing_pages')
      .insert({
        name: 'Summer Health Promo 2026',
        slug: 'summer-health-2026',
        title: 'Day1Health - Affordable Health Insurance from R189/month',
        description:
          'Get instant accident cover and private hospital access. 1-minute signup, 1-hour confirmation, Day 1 covered.',
        template: 'day1health',
        content: landingPageContent,
        status: 'active',
        metadata: {
          seo: {
            keywords: [
              'health insurance',
              'medical aid',
              'hospital cover',
              'accident cover',
              'affordable health insurance',
            ],
            ogImage: '/img1.JPG',
          },
        },
        created_by: marketingUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating landing page:', error);
      process.exit(1);
    }

    console.log('✅ Landing page created successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Slug: ${data.slug}`);
    console.log(`   URL: http://localhost:3001/lp/${data.slug}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedLandingPage()
  .then(() => {
    console.log('✅ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
