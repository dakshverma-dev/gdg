// Quick test of Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const apiKey = 'AIzaSyBSYQ4d41wfV8HEa4TyUNWOEI_Uguxumwg';
    console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `A patient has symptoms: chest pain, heart attack symptoms.
Return ONLY valid JSON:
{"priority": "HIGH", "department": "Cardiology", "reason": "test"}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('SUCCESS! Response:', text);
    } catch (error) {
        console.log('ERROR:', error.message);
    }
}

test();
