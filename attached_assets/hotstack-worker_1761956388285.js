/**
 * 🔥 HotStack Worker - File Intake System
 * Handles file uploads to R2 and triggers backend processing
 */

export default {
  /**
   * Queue handler - processes R2 upload events
   */
  async queue(batch, env) {
    console.log(`📦 Processing batch of ${batch.messages.length} messages`);
    
    for (const message of batch.messages) {
      try {
        const eventBody = typeof message.body === 'string' 
          ? JSON.parse(message.body) 
          : message.body;
        
        const { bucket, key, etag, size, timestamp } = eventBody;
        
        console.log(`📤 R2 Event: ${key} uploaded to ${bucket}`);
        console.log(`   Size: ${(size / 1024).toFixed(2)} KB`);
        console.log(`   ETag: ${etag}`);
        
        // Call backend for processing
        const backendUrl = env.BACKEND_BASE_URL || 
          'https://fruitful-global-central-backend-hub.heynsschoeman.repl.co';
        
        const payload = {
          bucket,
          key,
          size: parseInt(size) || 0,
          etag,
          timestamp: timestamp || Date.now(),
          source: 'hotstack-worker'
        };
        
        const response = await fetch(`${backendUrl}/api/hotstack/intake`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.BACKEND_API_TOKEN || 'default-dev-token'}`
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Backend call failed for ${key}: ${response.status}`, errorText);
          
          // Retry on server errors (5xx)
          if (response.status >= 500) {
            console.log(`   ⏳ Retrying (server error)...`);
            message.retry();
          } else {
            // Don't retry client errors (4xx)
            console.error(`   ❌ Client error - not retrying`);
            message.ack();
          }
          continue;
        }
        
        const result = await response.json();
        console.log(`✅ Processed ${key}:`, result.message);
        console.log(`   Brands: ${result.data?.brands || 0}`);
        console.log(`   Files: ${result.data?.files || 1}`);
        console.log(`   Time: ${result.data?.processingTime || 'N/A'}s`);
        
        // Acknowledge successful processing
        message.ack();
        
      } catch (error) {
        console.error(`❌ Queue processing error:`, error.message);
        console.error(error.stack);
        
        // Retry on unexpected errors
        message.retry();
      }
    }
  },

  /**
   * HTTP handler - public upload interface
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: corsHeaders,
        status: 204
      });
    }
    
    try {
      // Route: Upload endpoint
      if (url.pathname === '/upload' && request.method === 'POST') {
        return await handleUpload(request, env, corsHeaders);
      }
      
      // Route: Status check
      if (url.pathname === '/status' && request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'operational',
          worker: 'hotstack-worker',
          version: '1.0.0',
          environment: env.ENVIRONMENT || 'development',
          routes: ['fruitful.faa.zone/hotstack', 'hotstack.faa.zone'],
          services: {
            r2: !!env.HOTSTACK_BUCKET,
            queue: !!env.UPLOAD_QUEUE,
            backend: !!env.BACKEND_BASE_URL
          },
          timestamp: new Date().toISOString()
        }, null, 2), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Route: Health check
      if (url.pathname === '/health' && request.method === 'GET') {
        return new Response('OK', {
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
      
      // Route: Upload UI (default)
      if (url.pathname === '/' || url.pathname === '/hotstack' || url.pathname === '/upload') {
        return new Response(getUploadPageHTML(env), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
      
      // 404 for unknown routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        path: url.pathname,
        availableRoutes: ['/', '/upload', '/status', '/health']
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Fetch handler error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Handle file upload to R2
 */
async function handleUpload(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No file provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'File too large (max 10MB)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file type
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/plain',
      'application/json',
      'text/javascript',
      'application/javascript',
      'application/pdf',
      'text/html'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: `Invalid file type: ${file.type}. Allowed: ZIP, Excel, Images, PDF, HTML, Code` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Generate unique key
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${timestamp}_${sanitizedName}`;
    
    // Upload to R2
    await env.HOTSTACK_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size.toString()
      }
    });
    
    console.log(`📤 Uploaded: ${key} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Queue event for backend processing
    if (env.UPLOAD_QUEUE) {
      await env.UPLOAD_QUEUE.send({
        bucket: 'hotstack-bucket',
        key,
        size: file.size,
        contentType: file.type,
        timestamp,
        fileName: file.name
      });
      console.log(`📨 Queued for processing: ${key}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / 1024).toFixed(2)} KB`,
        key,
        contentType: file.type,
        timestamp,
        url: `https://hotstack-bucket.${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate upload page HTML
 */
function getUploadPageHTML(env) {
  const isDev = env.ENVIRONMENT === 'development';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔥 HotStack™ | File Upload</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        }
        .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #fbbf24;
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        .hotstack-container {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .drop-zone {
            border: 2px dashed #fbbf24;
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            transition: all 0.3s ease;
            background: rgba(251, 191, 36, 0.05);
            cursor: pointer;
        }
        .drop-zone:hover, .drop-zone.dragover {
            border-color: #f59e0b;
            background: rgba(251, 191, 36, 0.15);
            transform: scale(1.02);
        }
        .countdown-timer {
            font-family: 'Courier New', monospace;
            font-size: 3rem;
            font-weight: bold;
            color: #fbbf24;
            text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }
    </style>
</head>
<body class="min-h-screen relative overflow-hidden">
    <!-- Animated background particles -->
    <div id="particles-container" class="fixed inset-0 z-0"></div>

    <main class="container mx-auto px-4 py-12 relative z-10">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-5xl md:text-6xl font-extrabold text-white mb-4">
                    🔥 Fruitful | <span class="text-yellow-400">HotStack™</span>
                </h1>
                <p class="text-xl text-gray-300 mb-2">Omnidrop Your Digital Presence</p>
                <p class="text-2xl font-semibold text-yellow-400">Live in Minutes. Branded Forever.</p>
                ${isDev ? '<div class="mt-4"><span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">🔧 Development Mode</span></div>' : ''}
            </div>

            <!-- Main Upload Interface -->
            <div class="hotstack-container p-8 mb-8">
                <!-- Countdown Timer -->
                <div class="text-center mb-8">
                    <p class="countdown-timer" id="countdown-display">02:52</p>
                    <p class="text-gray-400 text-sm">Time remaining to omnidrop</p>
                </div>

                <!-- Drop Zone -->
                <div class="drop-zone" id="dropZone">
                    <div class="text-6xl mb-4">📂</div>
                    <h3 class="text-2xl font-bold text-white mb-2">Drop files here or click to browse</h3>
                    <p class="text-gray-400 mb-4">Max 10MB • ZIP, Excel, Images, PDF, HTML, Code</p>
                    <input type="file" id="fileInput" class="hidden" 
                           accept=".zip,.xlsx,.xls,.png,.jpg,.jpeg,.pdf,.js,.json,.txt,.html">
                    <button id="browseBtn" class="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition">
                        📁 Browse Files
                    </button>
                </div>

                <!-- Status Display -->
                <div id="statusArea" class="mt-6 hidden">
                    <div class="p-4 rounded-lg" id="statusBox">
                        <div id="statusMessage"></div>
                    </div>
                </div>

                <!-- Features -->
                <div class="mt-8 text-left">
                    <h3 class="text-xl font-semibold text-yellow-400 mb-4">What Your Omnidrop Activates:</h3>
                    <ul class="space-y-3 text-gray-300">
                        <li class="flex items-start">
                            <span class="text-yellow-400 mr-3">⚡</span>
                            <span><strong>Rapid Deployment:</strong> Your content goes live in under 180 seconds</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-yellow-400 mr-3">⚡</span>
                            <span><strong>Auto Processing:</strong> Intelligent categorization and indexing</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-yellow-400 mr-3">⚡</span>
                            <span><strong>R2 Storage:</strong> Cloudflare edge storage for global delivery</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-yellow-400 mr-3">⚡</span>
                            <span><strong>Queue Processing:</strong> Async backend integration for reliability</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Status Console -->
            <div class="hotstack-container p-6">
                <h3 class="text-lg font-bold text-yellow-400 mb-4">📊 Live Status</h3>
                <div class="bg-black rounded-lg p-4 font-mono text-sm text-green-400 max-h-64 overflow-y-auto" id="statusLog">
                    <div>[${new Date().toLocaleTimeString()}] 🔥 HotStack™ ready for uploads</div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Initialize particles
        function createParticles() {
            const container = document.getElementById('particles-container');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                container.appendChild(particle);
            }
        }

        // Countdown timer
        let minutes = 2, seconds = 52;
        function updateCountdown() {
            const display = document.getElementById('countdown-display');
            display.textContent = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            if (seconds > 0) seconds--;
            else if (minutes > 0) { minutes--; seconds = 59; }
            else { minutes = 2; seconds = 52; }
        }

        // Status logger
        function addLog(message, type = 'info') {
            const log = document.getElementById('statusLog');
            const time = new Date().toLocaleTimeString();
            const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
            const entry = document.createElement('div');
            entry.innerHTML = \`<span class="text-blue-400">[\${time}]</span> \${emoji} \${message}\`;
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
            if (log.children.length > 15) log.removeChild(log.firstChild);
        }

        // Upload handling
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const statusArea = document.getElementById('statusArea');
        const statusBox = document.getElementById('statusBox');
        const statusMessage = document.getElementById('statusMessage');

        browseBtn.onclick = () => fileInput.click();
        dropZone.onclick = (e) => { if (e.target === dropZone) fileInput.click(); };

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) uploadFile(e.dataTransfer.files[0]);
        });

        fileInput.onchange = (e) => {
            if (e.target.files.length) uploadFile(e.target.files[0]);
        };

        async function uploadFile(file) {
            addLog(\`Uploading \${file.name} (\${(file.size / 1024).toFixed(2)} KB)...\`);
            
            statusArea.classList.remove('hidden');
            statusBox.className = 'p-4 rounded-lg bg-blue-900 border border-blue-500';
            statusMessage.innerHTML = \`⏳ <strong>Uploading...</strong> \${file.name}\`;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    statusBox.className = 'p-4 rounded-lg bg-green-900 border border-green-500';
                    statusMessage.innerHTML = \`
                        ✅ <strong>Upload successful!</strong><br>
                        <div class="text-sm mt-2 text-gray-300">
                            File: \${result.data.fileName}<br>
                            Size: \${result.data.sizeFormatted}<br>
                            Key: \${result.data.key}<br>
                            Status: Queued for processing ⚡
                        </div>
                    \`;
                    addLog(\`Successfully uploaded \${file.name}\`, 'success');
                    addLog(\`Queued for backend processing\`, 'info');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                statusBox.className = 'p-4 rounded-lg bg-red-900 border border-red-500';
                statusMessage.innerHTML = \`❌ <strong>Upload failed:</strong> \${error.message}\`;
                addLog(\`Upload failed: \${error.message}\`, 'error');
            }
        }

        // Initialize
        createParticles();
        setInterval(updateCountdown, 1000);
        addLog('System initialized and ready');
    </script>
</body>
</html>`;
}
