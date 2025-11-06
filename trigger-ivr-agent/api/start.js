export default async function handler(request, response) {
  // קורא את הטוקן הסודי מההגדרות המאובטחות של Vercel
  const GITHUB_TOKEN = process.env.GITHUB_PAT; 
  
  // פרטי המאגר שלך (כבר מעודכנים)
  const GITHUB_USERNAME = 'shgo9573';
  const REPO_NAME = 'agent-phon';
  
  // שולח את הבקשה להפעלת ה-Action
  await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      // שם האירוע חייב להיות זהה למה שהגדרנו בקובץ ה-YML
      event_type: 'run-ivr-agent', 
    }),
  });

  // מחזיר תשובה חיובית
  response.status(200).send('OK: IVR Agent Workflow Triggered.');
}
