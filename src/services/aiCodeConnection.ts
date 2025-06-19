
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
3. Ensure all form fields are properly captured: ${request.fields.join(', ')}
4. Add proper form validation if needed
5. Make sure the code works without external dependencies
6. Add event listeners to forms to prevent default submission and call submitSessionData instead
7. If no forms exist, create a simple form with the specified fields

Current code:
HTML: ${request.html}
CSS: ${request.css}
JavaScript: ${request.javascript}

Please return ONLY a valid JSON response in this exact format:
{
  "html": "modified HTML with proper form submission",
  "css": "modified CSS preserving appearance", 
  "javascript": "modified JavaScript with submitSessionData integration"
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
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from AI');
    }

    // Clean and extract JSON from the response
    let jsonText = generatedText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Find JSON object in the text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI - no JSON found');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    if (!result.html && !result.css && !result.javascript) {
      throw new Error('AI response missing required fields');
    }
    
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
