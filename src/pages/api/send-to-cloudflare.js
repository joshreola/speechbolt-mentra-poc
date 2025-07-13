// pages/api/send-to-cloudflare.js
// API endpoint for your Vercel app to send data to Cloudflare Worker

export default async function handler(req, res) {
  // Enable CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests' 
    });
  }

  console.log('📨 Received request to send to Cloudflare');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { transcript, speaker, type, confidence, ...otherData } = req.body;

    // Validate required fields
    if (!transcript && !type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Either transcript or type is required'
      });
    }

    // Prepare data for Cloudflare Worker
    const cloudflareData = {
      type: type || 'transcript',
      transcript,
      speaker: speaker || 'user',
      confidence: confidence || 0.95,
      timestamp: new Date().toISOString(),
      source: 'vercel-app',
      ...otherData
    };

    console.log('🚀 Sending to Cloudflare Worker:', cloudflareData);

    // Send to your Cloudflare Worker
    const cloudflareResponse = await fetch('https://vapi-audio-relay.companies-josh-reola.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cloudflareData)
    });

    if (!cloudflareResponse.ok) {
      const errorText = await cloudflareResponse.text();
      throw new Error(`Cloudflare worker error: ${cloudflareResponse.status} - ${errorText}`);
    }

    const result = await cloudflareResponse.text();
    console.log('✅ Cloudflare Worker response:', result);

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Data sent to Cloudflare Worker successfully',
      cloudflareResponse: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error sending to Cloudflare:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send to Cloudflare Worker',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}