const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.STORAGE_URL;
const supabaseKey = process.env.STORAGE_KEY;

console.log('Testing Supabase Client...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('Storage listBuckets error:', bucketError);
    } else {
      console.log('Storage buckets:', buckets.map(b => b.name));
    }
    
    // Check if we can create bucket 'products' or 'proof_of_delivery' if not present
    const existing = (buckets || []).map(b => b.name);
    for (const bName of ['products', 'proof-of-delivery']) {
      if (!existing.includes(bName)) {
        console.log(`Creating bucket: ${bName}`);
        const { data, error } = await supabase.storage.createBucket(bName, { public: true });
        if (error) console.error(`Error creating ${bName}:`, error.message);
        else console.log(`Bucket ${bName} created:`, data);
      }
    }
  } catch (e) {
    console.error('Test error:', e);
  }
}

test();
