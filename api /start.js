export default function handler(request, response) {
  // 1. הדפס הודעה ללוגים של Vercel כדי שנראה שהפונקציה רצה
  console.log("Simple test function was called successfully!");

  // 2. צור הודעת תשובה פשוטה
  const message = "Hello from Vercel! The simple test function is working.";
  
  // 3. שלח את התשובה בחזרה לדפדפן עם סטטוס 200 (OK)
  response.status(200).send(message);
}
