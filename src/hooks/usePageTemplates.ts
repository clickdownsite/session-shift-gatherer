
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MainPage, SubPage } from '@/types/session';

// Default page templates
const defaultTemplates = {
  contact: {
    name: 'Contact Form',
    html: `
<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
  <h1 style="color: #333; text-align: center;">Contact Us</h1>
  <form id="contactForm" style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
    <div style="margin-bottom: 15px;">
      <label for="name" style="display: block; margin-bottom: 5px; font-weight: bold;">Name:</label>
      <input type="text" id="name" name="name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 15px;">
      <label for="email" style="display: block; margin-bottom: 5px; font-weight: bold;">Email:</label>
      <input type="email" id="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 15px;">
      <label for="message" style="display: block; margin-bottom: 5px; font-weight: bold;">Message:</label>
      <textarea id="message" name="message" rows="5" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
    </div>
    <button type="submit" style="background: #007cba; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Send Message</button>
  </form>
</div>`,
    css: `
.contact-form {
  transition: all 0.3s ease;
}
button:hover {
  background: #005a87 !important;
}`,
    javascript: `
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  if (window.submitSessionData) {
    window.submitSessionData(data);
  }
});`,
    fields: ['name', 'email', 'message']
  },
  login: {
    name: 'Login Form',
    html: `
<div style="max-width: 400px; margin: 100px auto; padding: 20px; font-family: Arial, sans-serif;">
  <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="text-align: center; color: #333; margin-bottom: 30px;">Login</h2>
    <form id="loginForm">
      <div style="margin-bottom: 20px;">
        <label for="username" style="display: block; margin-bottom: 5px; font-weight: bold;">Username:</label>
        <input type="text" id="username" name="username" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 20px;">
        <label for="password" style="display: block; margin-bottom: 5px; font-weight: bold;">Password:</label>
        <input type="password" id="password" name="password" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <button type="submit" style="width: 100%; background: #28a745; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Login</button>
    </form>
  </div>
</div>`,
    css: `
body { background: #f5f5f5; }
button:hover { background: #218838 !important; }`,
    javascript: `
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  if (window.submitSessionData) {
    window.submitSessionData(data);
  }
});`,
    fields: ['username', 'password']
  },
  newsletter: {
    name: 'Newsletter Signup',
    html: `
<div style="max-width: 500px; margin: 50px auto; padding: 20px; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; text-align: center;">
    <h2 style="margin-bottom: 15px;">Stay Updated!</h2>
    <p style="margin-bottom: 25px; opacity: 0.9;">Subscribe to our newsletter for the latest updates and offers.</p>
    <form id="newsletterForm" style="display: flex; gap: 10px; flex-direction: column;">
      <input type="email" name="email" placeholder="Enter your email" required style="padding: 15px; border: none; border-radius: 6px; font-size: 16px;">
      <button type="submit" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 15px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold;">Subscribe</button>
    </form>
  </div>
</div>`,
    css: `
button:hover { background: rgba(255,255,255,0.3) !important; }`,
    javascript: `
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  if (window.submitSessionData) {
    window.submitSessionData(data);
  }
});`,
    fields: ['email']
  },
  survey: {
    name: 'User Survey',
    html: `
<div style="max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
  <h1 style="color: #333; text-align: center; margin-bottom: 10px;">User Experience Survey</h1>
  <p style="text-align: center; color: #666; margin-bottom: 30px;">Help us improve by sharing your feedback</p>
  <form id="surveyForm" style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">How satisfied are you with our service?</label>
      <div style="display: flex; gap: 15px; margin-top: 10px;">
        <label><input type="radio" name="satisfaction" value="very-satisfied" required> Very Satisfied</label>
        <label><input type="radio" name="satisfaction" value="satisfied"> Satisfied</label>
        <label><input type="radio" name="satisfaction" value="neutral"> Neutral</label>
        <label><input type="radio" name="satisfaction" value="dissatisfied"> Dissatisfied</label>
      </div>
    </div>
    <div style="margin-bottom: 20px;">
      <label for="feedback" style="display: block; margin-bottom: 5px; font-weight: bold;">Additional Feedback:</label>
      <textarea id="feedback" name="feedback" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
    </div>
    <div style="margin-bottom: 20px;">
      <label for="email" style="display: block; margin-bottom: 5px; font-weight: bold;">Email (optional):</label>
      <input type="email" id="email" name="email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <button type="submit" style="background: #007cba; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Submit Survey</button>
  </form>
</div>`,
    css: `
label { cursor: pointer; }
button:hover { background: #005a87 !important; }`,
    javascript: `
document.getElementById('surveyForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  if (window.submitSessionData) {
    window.submitSessionData(data);
  }
});`,
    fields: ['satisfaction', 'feedback', 'email']
  }
};

export const useMainPages = () => {
  return useQuery({
    queryKey: ['main_pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('main_pages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as MainPage[];
    },
  });
};

export const useSubPages = () => {
  return useQuery({
    queryKey: ['sub_pages_summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_pages')
        .select('id, name, description, fields, main_page_id, created_at, updated_at')
        .order('name');
      
      if (error) throw error;
      if (!data) return [];

      const transformedData = data.map(p => ({
        ...p,
        html: '',
        css: '',
        javascript: '',
      }));
      
      return transformedData as SubPage[];
    },
  });
};

export const useDefaultTemplates = () => {
  return { templates: defaultTemplates };
};
