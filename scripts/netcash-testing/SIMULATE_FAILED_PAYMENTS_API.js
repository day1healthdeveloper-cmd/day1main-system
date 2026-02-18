/**
 * Simulate failed payments API by querying database directly
 * This creates a simple HTTP server that mimics the backend API
 */

const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  try {
    // Failed payments list
    if (req.url.startsWith('/api/v1/netcash/failed-payments?') || req.url === '/api/v1/netcash/failed-payments') {
      const { data: transactions, error, count } = await supabase
        .from('debit_order_transactions')
        .select('*', { count: 'exact' })
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        transactions: transactions || [],
        total: count || 0,
        limit: 50,
        offset: 0
      }));
      return;
    }

    // Failed payments statistics
    if (req.url === '/api/v1/netcash/failed-payments/stats/summary') {
      const { data: transactions, error } = await supabase
        .from('debit_order_transactions')
        .select('retry_count, amount')
        .eq('status', 'failed');

      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
        return;
      }

      const stats = {
        total: transactions?.length || 0,
        totalAmount: 0,
        canRetry: 0,
        needsEscalation: 0,
      };

      transactions?.forEach((txn) => {
        stats.totalAmount += txn.amount;
        const retryCount = txn.retry_count || 0;
        if (retryCount < 3) {
          stats.canRetry++;
        } else {
          stats.needsEscalation++;
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    }

    // Webhook logs (empty for now - no real webhooks yet)
    if (req.url.startsWith('/api/v1/netcash/webhook/logs')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        logs: [],
        total: 0,
        limit: 50,
        offset: 0
      }));
      return;
    }

    // Webhook statistics (empty for now)
    if (req.url === '/api/v1/netcash/webhook/stats/summary') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: 0,
        processed: 0,
        failed: 0,
        successRate: 0
      }));
      return;
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Simulated backend API running on http://localhost:${PORT}`);
  console.log(`📊 Serving failed payments data from Supabase`);
  console.log(`\n✅ Now refresh your browser at http://localhost:3001/operations/debit-orders`);
  console.log(`   and click on the "Failed" tab to see the 8 failed payments.\n`);
});
