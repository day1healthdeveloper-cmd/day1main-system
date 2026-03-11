const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function distributeStrikeDates() {
  console.log('Starting strike date distribution for March 2026...\n');
  
  // March 2026 weekdays (excluding weekends and holidays)
  // Week 1: Mon 2, Tue 3, Wed 4, Thu 5, Fri 6
  // Week 2: Mon 9, Tue 10, Wed 11, Thu 12, Fri 13
  // Week 3: Mon 16, Tue 17, Wed 18, Thu 19, Fri 20
  // Week 4: Mon 23, Tue 24, Wed 25, Thu 26
  // Week 5: Mon 30, Tue 31
  
  const weekdays = {
    monday: [2, 9, 16, 23, 30],
    tuesday: [3, 10, 17, 24, 31],
    wednesday: [4, 11, 18, 25],
    thursday: [5, 12, 19, 26],
    friday: [6, 13, 20]
  };
  
  try {
    // Get only members WITHOUT a debit_order_day set
    // Get only members WITHOUT a debit_order_day set
    const { data: allMembers, error: fetchError } = await supabase
      .from('members')
      .select('id')
      .in('collection_method', ['individual_debit_order', 'group_debit_order', 'eft'])
      .eq('status', 'active')
      .is('debit_order_day', null)
      .order('id');
    
    if (fetchError) {
      console.error('Error fetching members:', fetchError);
      return;
    }
    
    console.log(`Found ${allMembers.length} members without strike dates\n`);
    
    // Distribute members across all weekdays
    const allDays = [
      ...weekdays.monday,
      ...weekdays.tuesday,
      ...weekdays.wednesday,
      ...weekdays.thursday,
      ...weekdays.friday
    ];
    
    const membersPerDay = Math.ceil(allMembers.length / allDays.length);
    console.log(`Distributing ~${membersPerDay} members per day\n`);
    
    let memberIndex = 0;
    
    for (const day of allDays) {
      const membersForThisDay = allMembers.slice(memberIndex, memberIndex + membersPerDay);
      
      if (membersForThisDay.length === 0) break;
      
      const memberIds = membersForThisDay.map(m => m.id);
      
      const { error: updateError } = await supabase
        .from('members')
        .update({ debit_order_day: day })
        .in('id', memberIds);
      
      if (updateError) {
        console.error(`Error updating day ${day}:`, updateError);
      } else {
        const dayName = getDayName(day);
        console.log(`✓ Day ${day} (${dayName}): ${membersForThisDay.length} members`);
      }
      
      memberIndex += membersPerDay;
    }
    
    console.log('\n--- Distribution Complete ---\n');
    
    // Verify the distribution
    const { data: verification, error: verifyError } = await supabase
      .from('members')
      .select('debit_order_day, collection_method, monthly_premium')
      .in('collection_method', ['individual_debit_order', 'group_debit_order', 'eft'])
      .eq('status', 'active');
    
    if (verifyError) {
      console.error('Error verifying:', verifyError);
      return;
    }
    
    // Group by day
    const byDay = {};
    verification.forEach(member => {
      const day = member.debit_order_day;
      if (!byDay[day]) {
        byDay[day] = {
          count: 0,
          individual: 0,
          group: 0,
          eft: 0,
          total_amount: 0
        };
      }
      byDay[day].count++;
      byDay[day][member.collection_method === 'individual_debit_order' ? 'individual' : 
                  member.collection_method === 'group_debit_order' ? 'group' : 'eft']++;
      byDay[day].total_amount += parseFloat(member.monthly_premium || 0);
    });
    
    console.log('Distribution by Day:');
    console.log('='.repeat(80));
    console.log('Day | Day Name  | Total | Individual | Group | EFT | Total Amount');
    console.log('-'.repeat(80));
    
    Object.keys(byDay).sort((a, b) => a - b).forEach(day => {
      const stats = byDay[day];
      const dayName = getDayName(parseInt(day));
      console.log(
        `${day.toString().padStart(3)} | ${dayName.padEnd(9)} | ${stats.count.toString().padStart(5)} | ` +
        `${stats.individual.toString().padStart(10)} | ${stats.group.toString().padStart(5)} | ` +
        `${stats.eft.toString().padStart(3)} | R${stats.total_amount.toFixed(2)}`
      );
    });
    
    console.log('='.repeat(80));
    
    // Summary by day of week
    const byDayOfWeek = {};
    Object.keys(byDay).forEach(day => {
      const dayName = getDayName(parseInt(day));
      if (!byDayOfWeek[dayName]) {
        byDayOfWeek[dayName] = { count: 0, amount: 0 };
      }
      byDayOfWeek[dayName].count += byDay[day].count;
      byDayOfWeek[dayName].amount += byDay[day].total_amount;
    });
    
    console.log('\nSummary by Day of Week:');
    console.log('='.repeat(50));
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(dayName => {
      if (byDayOfWeek[dayName]) {
        console.log(
          `${dayName.padEnd(10)}: ${byDayOfWeek[dayName].count.toString().padStart(5)} members | ` +
          `R${byDayOfWeek[dayName].amount.toFixed(2)}`
        );
      }
    });
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

function getDayName(day) {
  const weekdays = {
    2: 'Monday', 9: 'Monday', 16: 'Monday', 23: 'Monday', 30: 'Monday',
    3: 'Tuesday', 10: 'Tuesday', 17: 'Tuesday', 24: 'Tuesday', 31: 'Tuesday',
    4: 'Wednesday', 11: 'Wednesday', 18: 'Wednesday', 25: 'Wednesday',
    5: 'Thursday', 12: 'Thursday', 19: 'Thursday', 26: 'Thursday',
    6: 'Friday', 13: 'Friday', 20: 'Friday',
    1: 'Sunday', 8: 'Sunday', 15: 'Sunday', 22: 'Sunday', 29: 'Sunday',
    7: 'Saturday', 14: 'Saturday', 21: 'Saturday', 28: 'Saturday'
  };
  return weekdays[day] || 'Unknown';
}

distributeStrikeDates();
