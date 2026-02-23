import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function capitalizeName(name: string): string {
  if (!name) return '';
  return name.split(' ').map(word => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const groupId = formData.get('groupId') as string;
    const collectionMethod = formData.get('collectionMethod') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ error: 'No group ID provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read without headers first to find the actual data start row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Find the row with "Member Number" header
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row: any = rawData[i];
      if (row && row[0] && String(row[0]).includes('Member Number')) {
        headerRowIndex = i;
        break;
      }
    }
    
    // Read data starting from the row after the header (or from beginning if no header found)
    const data = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex >= 0 ? headerRowIndex : 0 });

    if (data.length === 0) {
      return NextResponse.json({ 
        error: 'No data found in Excel file',
        details: 'The file appears to be empty or has no data rows'
      }, { status: 400 });
    }

    const members = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      
      try {
        // Get actual column names from the row
        const rowKeys = Object.keys(row);
        
        // The first key is the member number column (even if it has a weird name)
        const memberNumber = row[rowKeys[0]];
        const firstName = row[rowKeys[1]] || row['__EMPTY'];
        const lastName = row[rowKeys[2]] || row['__EMPTY_1'];
        const idNumber = row[rowKeys[3]] || row['__EMPTY_2'];
        const commenceDate = row[rowKeys[4]] || row['__EMPTY_3'];
        const premium = row[rowKeys[5]] || row['__EMPTY_4'];
        const employeeNumber = row[rowKeys[6]] || row['__EMPTY_5'];

        // Skip rows that don't look like member data
        // Accept any member number that looks like a code (letters followed by numbers)
        const memberNumberStr = String(memberNumber).trim();
        if (!memberNumber || memberNumberStr.length < 5 || !/^[A-Z]{2,}[0-9]/.test(memberNumberStr)) {
          continue;
        }

        if (!firstName || !lastName) {
          errors.push(`Row ${i + 2}: Missing name or surname for member ${memberNumber}`);
          continue;
        }

        let parsedDate = null;
        if (commenceDate) {
          if (typeof commenceDate === 'number') {
            // Excel date number
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + commenceDate * 86400000);
            parsedDate = date.toISOString().split('T')[0];
          } else {
            // String date
            parsedDate = new Date(commenceDate).toISOString().split('T')[0];
          }
        }

        let parsedPremium = 0;
        if (premium) {
          const premiumStr = String(premium).replace(/,/g, '').replace(/\s/g, '');
          parsedPremium = parseFloat(premiumStr) || 0;
        }

        members.push({
          member_number: String(memberNumber).trim(),
          first_name: capitalizeName(String(firstName).trim()),
          last_name: capitalizeName(String(lastName).trim()),
          id_number: idNumber ? String(idNumber).trim() : null,
          date_of_birth: parsedDate,
          monthly_premium: parsedPremium,
          employee_number: employeeNumber ? String(employeeNumber).trim() : null,
          payment_group_id: groupId,
          collection_method: collectionMethod,
          status: 'active',
        });
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (members.length === 0) {
      return NextResponse.json({ 
        error: 'No valid members found in file',
        details: errors 
      }, { status: 400 });
    }

    const { data: insertedMembers, error: insertError } = await supabase
      .from('members')
      .insert(members)
      .select();

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to insert members',
        details: insertError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      inserted: insertedMembers?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
