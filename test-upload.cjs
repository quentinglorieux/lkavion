const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  formData.append('title', 'Test File');
  formData.append('file', new Blob(['test content']), 'test.txt');

  try {
    const response = await fetch('http://localhost:8055/files', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer G8_g9PPAlzRPFn6uAv0-cQh4KcMl_ACA'
      },
      body: formData
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testUpload();
