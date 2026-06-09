const fs = require('fs');
const https = require('https');
const path = require('path');

const fonts = [
  {
    name: 'PlusJakartaSans-Regular.ttf',
    urls: [
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/main/fonts/ttf/PlusJakartaSans-Regular.ttf',
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Regular.ttf'
    ]
  },
  {
    name: 'PlusJakartaSans-Medium.ttf',
    urls: [
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/main/fonts/ttf/PlusJakartaSans-Medium.ttf',
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Medium.ttf'
    ]
  },
  {
    name: 'PlusJakartaSans-SemiBold.ttf',
    urls: [
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/main/fonts/ttf/PlusJakartaSans-SemiBold.ttf',
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-SemiBold.ttf'
    ]
  },
  {
    name: 'PlusJakartaSans-Bold.ttf',
    urls: [
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/main/fonts/ttf/PlusJakartaSans-Bold.ttf',
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Bold.ttf'
    ]
  },
  {
    name: 'PlusJakartaSans-ExtraBold.ttf',
    urls: [
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/main/fonts/ttf/PlusJakartaSans-ExtraBold.ttf',
      'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-ExtraBold.ttf'
    ]
  }
];

const destDir = path.join(__dirname, '..', 'assets', 'fonts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

const start = async () => {
  for (const font of fonts) {
    const destPath = path.join(destDir, font.name);
    let success = false;
    for (const url of font.urls) {
      console.log(`Trying to download ${font.name} from: ${url}`);
      try {
        await downloadFile(url, destPath);
        console.log(`Successfully downloaded ${font.name}`);
        success = true;
        break; // Stop trying URLs for this font
      } catch (e) {
        console.warn(`Failed from ${url}: ${e.message}`);
      }
    }
    if (!success) {
      console.error(`Could not download ${font.name} from any source.`);
    }
  }
  console.log('Done!');
};

start();
