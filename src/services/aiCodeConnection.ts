
export interface ConnectCodeRequest {
  html: string;
  css: string;
  javascript: string;
  fields: string[];
}

export interface ConnectCodeResponse {
  html: string;
  css: string;
  javascript: string;
  success: boolean;
  error?: string;
}

export const connectCodeWithAI = async (request: ConnectCodeRequest): Promise<ConnectCodeResponse> => {
  const apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in Settings.');
  }

  const prompt = `
You are a web development expert. I need you to modify the provided HTML, CSS, and JavaScript code to automatically capture form data and submit it using a global function called 'submitSessionData'.

Requirements:
1. Keep the visual appearance exactly the same
2. Add form submission functionality that calls window.submitSessionData(formData)
3. Ensure all form fields are properly captured
4. Add proper form validation if needed
5. Make sure the code works without external dependencies

Current code:
HTML: ${request.html}
CSS: ${request.css}
JavaScript: ${request.javascript}
Form fields to capture: ${request.fields.join(', ')}

Please return the modified code maintaining the same structure. Return your response in this exact JSON format:
{
  "html": "modified HTML here",
  "css": "modified CSS here", 
  "javascript": "modified JavaScript here"
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from AI');
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      html: result.html || request.html,
      css: result.css || request.css,
      javascript: result.javascript || request.javascript,
      success: true
    };
  } catch (error) {
    console.error('AI connection error:', error);
    return {
      html: request.html,
      css: request.css,
      javascript: request.javascript,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
