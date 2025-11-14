export default async function handler(req, res) {
  // קבלת הקישור והפורמט מהבקשה, למשל: /api/trigger?url=VIDEO_URL&format=mp3
  const { url, format } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  }
  if (!format) {
    return res.status(400).json({ error: 'Format parameter is missing (mp3 or mp4)' });
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
          format: format, // העברת הפורמט ל-GitHub Action
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