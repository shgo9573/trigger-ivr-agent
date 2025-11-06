export default async function handler(request, response) {
  console.log("Function started. Received a request.");

  // קורא את הטוקן הסודי מההגדרות המאובטחות של Vercel
  const GITHUB_TOKEN = process.env.GITHUB_PAT; 
  
  // בודק אם הטוקן בכלל קיים
  if (!GITHUB_TOKEN) {
    console.error("CRITICAL ERROR: GITHUB_PAT environment variable is not set!");
    return response.status(500).send('Server configuration error: Missing secret token.');
  }
  console.log("GitHub token loaded successfully from environment variables.");

  // פרטי המאגר שלך (ודא שהם נכונים)
  const GITHUB_USERNAME = 'shgo9573';
  const REPO_NAME = 'agent-phon';
  const EVENT_TYPE = 'run-ivr-agent';
  
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/dispatches`;
  console.log(`Preparing to send POST request to: ${url}`);
  
  try {
    // שולח את הבקשה להפעלת ה-Action
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json', // הוספנו Header חשוב
      },
      body: JSON.stringify({
        event_type: EVENT_TYPE,
      }),
    });

    console.log(`GitHub API responded with status: ${fetchResponse.status}`);

    // אם התשובה מ-GitHub אינה חיובית, נדפיס את השגיאה
    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.text();
      console.error("Error from GitHub API:", errorBody);
      return response.status(500).send(`Error triggering workflow. GitHub API responded with status ${fetchResponse.status}. Body: ${errorBody}`);
    }

    // אם הכל הצליח
    console.log("Successfully triggered the GitHub Action.");
    response.status(200).send('OK: IVR Agent Workflow Triggered Successfully.');

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    response.status(500).send(`An unexpected server error occurred: ${error.message}`);
  }
}
