// Required for Diffusion model
const https = require('https');
const fs = require('fs');

// replace it with your key if necessary
const LEPTON_API_TOKEN = 'oq904ib3oak3cn638n27592jmhgk7y6s'

async function imageGeneration(imageDescription) {
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
  const filePath = `${__dirname}/${fileName}`;

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const file = fs.createWriteStream(filePath);
      res.pipe(file);

      res.on('end', function() {
        resolve({data: [{ Image: filePath }]})
      })
    });

    req.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    req.write(data);
    req.end();
  })
}

module.exports = imageGeneration;