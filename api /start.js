export default function handler(request, response) {
  // מדפיס ללוג את סוג הבקשה שקיבלנו (GET או POST)
  console.log(`Received a ${request.method} request.`);

  // בודק אם הבקשה היא מסוג GET או POST
  if (request.method === 'GET' || request.method === 'POST') {
    // אם כן, מבצע את הלוגיקה
    console.log("Request method is valid. Responding with success.");
    
    const message = "Success! The function handled the request.";
    
    // שולח תשובת הצלחה
    response.status(200).send(message);
  } else {
    // אם הבקשה היא מסוג אחר (למשל PUT), מחזיר שגיאה
    console.log(`Received an unsupported request method: ${request.method}`);
    response.status(405).send('Method Not Allowed');
  }
}
