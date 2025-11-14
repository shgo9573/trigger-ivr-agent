export default async function handler(req, res) {
  // קבלת הקישור מהבקשה, למשל: /api/trigger?url=VIDEO_URL
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // למשל: "your-username/your-repo"

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'download-video',
        client_payload: {
          url: url,
        },
      }),
    });

    if (response.status === 204) {
      res.status(200).json({ message: 'GitHub Action triggered successfully!' });
    } else {
      const data = await response.json();
      res.status(response.status).json({ error: 'Failed to trigger GitHub Action', details: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}