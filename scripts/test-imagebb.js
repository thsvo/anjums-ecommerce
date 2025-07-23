// ImageBB Integration Test
// Run this in browser console on any page to test the integration

async function testImageBBIntegration() {
  console.log('🧪 Testing ImageBB Integration...');
  
  // Check if API key is available
  const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY;
  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_IMAGEBB_API_KEY not found in environment');
    return false;
  }
  console.log('✅ API key found');

  // Test API endpoint availability
  try {
    const response = await fetch('/api/upload/imagebb', {
      method: 'OPTIONS' // Just check if endpoint exists
    });
    if (response.status === 405) {
      console.log('✅ Upload API endpoint available');
    }
  } catch (error) {
    console.error('❌ Upload API endpoint not available:', error);
    return false;
  }

  // Create a test image (1x1 pixel transparent PNG)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillRect(0, 0, 1, 1);
  
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
  
  console.log('📁 Created test file:', testFile.name, testFile.size, 'bytes');

  // Test direct ImageBB upload
  try {
    const formData = new FormData();
    formData.append('image', testFile);
    formData.append('name', 'integration_test');

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Direct ImageBB upload successful:', result.data.url);
      return true;
    } else {
      console.error('❌ Direct ImageBB upload failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Direct ImageBB upload error:', error);
    return false;
  }
}

// Usage: Open browser console and run testImageBBIntegration()
window.testImageBBIntegration = testImageBBIntegration;

export default testImageBBIntegration;
