// Required for Diffusion model
const https = require('https');
const fs = require('fs');

// replace it with your key if necessary
const LEPTON_API_TOKEN = 'oq904ib3oak3cn638n27592jmhgk7y6s'

async function imageGeneration(imageDescription = 'Computer Science Student at New York University') {
  const data = JSON.stringify({
    width: 1024,
    height: 1024,
    guidance_scale: 5,
    high_noise_frac: 0.75,
    seed: 151886915,
    steps: 30,
    use_refiner: false,
    prompt: imageDescription,
  });

  const options = {
    hostname: 'sdxl.lepton.run',
    path: '/run',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${LEPTON_API_TOKEN}`
    }
  };

  const fileName = `output_image_${Date.now()}.png`

  const req = https.request(options, (res) => {
    const file = fs.createWriteStream(fileName);
    res.pipe(file);
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();

  return {
    // the Lepton AI features one image per request
    data: [{ Image: `${process.env.PWD}/${fileName}` }]
  }
}

module.exports = imageGeneration;