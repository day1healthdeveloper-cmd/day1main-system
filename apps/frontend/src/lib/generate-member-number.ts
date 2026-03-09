import { createServerSupabaseClient } from './supabase-server';

/**
 * Generates the next available DAY1 member number in sequence
 * Format: DAY1XXXXXXX (7 digits)
 * @returns Promise<string> - The next available member number (e.g., "DAY17056789")
 */
export async function generateNextMemberNumber(): Promise<string> {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get all DAY1 members with 7-digit format, ordered by member_number descending
    const { data: members, error } = await supabase
      .from('members')
      .select('member_number')
      .ilike('member_number', 'DAY1_______') // 7 underscores for 7 digits
      .order('member_number', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching highest member number:', error);
      throw error;
    }
    
    if (!members || members.length === 0) {
      // No DAY1 members found, start from DAY10000001
      return 'DAY10000001';
    }
    
    // Extract the numeric part from the highest member number
    const highestNumber = members[0].member_number;
    const numericPart = highestNumber.replace('DAY1', '');
    
    // Validate it's a 7-digit number
    if (!/^\d{7}$/.test(numericPart)) {
      console.error('Invalid member number format:', highestNumber);
      // Fallback: query all DAY1 members and find the highest valid one
      const { data: allMembers } = await supabase
        .from('members')
        .select('member_number')
        .ilike('member_number', 'DAY1%');
      
      if (allMembers) {
        const validNumbers = allMembers
          .filter(m => /^DAY1\d{7}$/.test(m.member_number))
          .map(m => parseInt(m.member_number.replace('DAY1', '')))
          .sort((a, b) => b - a);
        
        if (validNumbers.length > 0) {
          const nextNumber = validNumbers[0] + 1;
          return `DAY1${String(nextNumber).padStart(7, '0')}`;
        }
      }
      
      // Ultimate fallback
      return 'DAY10000001';
    }
    
    // Increment the number
    const nextNumber = parseInt(numericPart) + 1;
    
    // Format with leading zeros (7 digits)
    return `DAY1${String(nextNumber).padStart(7, '0')}`;
    
  } catch (error) {
    console.error('Error generating member number:', error);
    throw new Error('Failed to generate member number');
  }
}
