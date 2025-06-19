
import { supabase } from '@/integrations/supabase/client';

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

interface IPInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  isp?: string;
}

const getIPInfo = async (): Promise<IPInfo> => {
  try {
    // Try multiple IP services for better reliability
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, { timeout: 5000 } as any);
        if (response.ok) {
          const data = await response.json();
          
          // Normalize response from different services
          if (service.includes('ipify')) {
            return { ip: data.ip };
          } else if (service.includes('ipapi.co')) {
            return {
              ip: data.ip,
              city: data.city,
              region: data.region,
              country: data.country_name,
              timezone: data.timezone,
              isp: data.org
            };
          } else {
            return {
              ip: data.ip,
              city: data.city,
              region: data.region,
              country: data.country,
              timezone: data.timezone,
              isp: data.org
            };
          }
        }
      } catch (serviceError) {
        console.warn(`IP service ${service} failed:`, serviceError);
        continue;
      }
    }
    
    throw new Error('All IP services failed');
  } catch (error) {
    console.error('Failed to get IP info:', error);
    return { ip: 'Unknown' };
  }
};

const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
};

export const captureFormData = async (data: FormSubmissionData) => {
  try {
    // Get session options to check collection preferences
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('session_options')
      .eq('id', data.sessionId)
      .single();

    const sessionOptions = sessionData?.session_options || {};
    
    const submissionData: any = {
      session_id: data.sessionId,
      form_data: data.formData,
      timestamp: new Date().toISOString(),
    };

    // Collect IP and geolocation if enabled
    if (sessionOptions.collectIPGeolocation !== false) { // Default to true
      try {
        const ipInfo = await getIPInfo();
        submissionData.ip_address = ipInfo.ip;
        submissionData.location = ipInfo.city && ipInfo.region && ipInfo.country 
          ? `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`
          : 'Unknown';
      } catch (error) {
        console.warn('Failed to get IP/location:', error);
        submissionData.ip_address = 'Unknown';
        submissionData.location = 'Unknown';
      }
    }

    // Collect device info if enabled
    if (sessionOptions.collectDeviceInfo !== false) { // Default to true
      submissionData.device_info = getDeviceInfo();
    }

    console.log('Submitting session data:', submissionData);

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
    } else if (!data.hasOwnProperty(input.name)) {
      data[input.name] = input.value;
    }
  });

  return data;
};
