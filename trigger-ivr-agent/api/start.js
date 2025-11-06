export default async function handler(request, response) {
  console.log("Function execution started.");

  // --- שלב 1: בדיקת הטוקן ---
  const githubToken = process.env.GITHUB_PAT;

  if (!githubToken) {
    const errorMessage = "CRITICAL: GITHUB_PAT environment variable not found. Check Vercel project settings.";
    console.error(errorMessage);
    return response.status(500).send(errorMessage);
  }

  // מדפיסים רק חלק קטן מהטוקן כדי לוודא שהוא נטען, אבל לא חושפים אותו
  console.log(`Successfully loaded GITHUB_PAT. Token starts with: ${githubToken.substring(0, 12)}...`);

  // --- שלב 2: הגדרת פרטי הבקשה ---
  const owner = 'shgo9573';
  const repo = 'agent-phon';
  const event_type = 'run-ivr-agent';
  
  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
  console.log(`Preparing to dispatch event '${event_type}' to '${owner}/${repo}'.`);

  // --- שלב 3: שליחת הבקשה ל-GitHub ---
  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.json', // שינוי קל ל-header המומלץ
        'Authorization': `Bearer ${githubToken}`, // שינוי קל ל-Bearer במקום token
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type }),
    });

    console.log(`GitHub API responded with status code: ${fetchResponse.status}`);

    if (fetchResponse.status === 204) { // 204 No Content היא תגובת ההצלחה מ-GitHub
      console.log("Success! GitHub Action triggered.");
      return response.status(200).send("OK: GitHub Action triggered successfully.");
    } else {
      // אם קיבלנו סטטוס אחר, נציג אותו בלוג
      const errorBody = await fetchResponse.text();
      const errorMessage = `Failed to trigger GitHub Action. Status: ${fetchResponse.status}. Response: ${errorBody}`;
      console.error(errorMessage);
      return response.status(500).send(errorMessage);
    }

  } catch (error) {
    const errorMessage = `An unexpected network or fetch error occurred: ${error.message}`;
    console.error(errorMessage);
    return response.status(500).send(errorMessage);
  }
}
