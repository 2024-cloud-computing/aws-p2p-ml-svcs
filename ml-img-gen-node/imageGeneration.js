// Required for Diffusion model
const https = require('https');
const fs = require('fs');

require('dotenv').config()

const { LEPTON_API_TOKEN } = process.env;

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
        const buffer = fs.readFileSync(filePath);
        let base64String = Buffer.from(buffer).toString('base64');
        resolve({data: [{ Image: base64String }]})
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

// module.exports = imageGeneration;

imageGeneration('Santa Claus at NYU')