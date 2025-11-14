export default async function handler(req, res) {
  // קורא את הפרמטרים מהבקשה
  const { url, format } = req.query;

  // --- הוספתי לוג לבדיקה ---
  console.log(`Function received request with URL: ${url} and Format: ${format}`);

  if (!url) {
    console.error('Error: URL parameter is missing');
    return res.status(400).json({ error: 'URL parameter is missing' });
  }
  if (!format || (format !== 'mp3' && format !== 'mp4')) {
    console.error(`Error: Format parameter is missing or invalid. Received: ${format}`);
    return res.status(400).json({ error: 'Format parameter is missing or invalid. Must be "mp3" or "mp4".' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  // בניית המטען (payload) שיישלח ל-GitHub
  const payload = {
    event_type: 'download-video',
    client_payload: {
      url: url,
      format: format,
    },
  };

  // --- הוספתי לוג לבדיקה ---
  console.log('Sending the following payload to GitHub:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 204) {
      console.log('GitHub Action triggered successfully!');
      res.status(200).json({ message: 'GitHub Action triggered successfully!' });
    } else {
      const data = await response.json();
      console.error('Failed to trigger GitHub Action:', data);
      res.status(response.status).json({ error: 'Failed to trigger GitHub Action', details: data });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
