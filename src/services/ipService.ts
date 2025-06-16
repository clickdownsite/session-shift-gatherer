import { supabase } from '@/integrations/supabase/client';

export interface IPInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export const getIPInfo = async (): Promise<IPInfo> => {
  try {
    // Try multiple IP services for reliability
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        if (data.ip) {
          return {
            ip: data.ip,
            country: data.country || data.country_name,
            region: data.region || data.region_name,
            city: data.city,
            timezone: data.timezone
          };
        }
      } catch (err) {
        console.warn(`Failed to get IP from ${service}:`, err);
        continue;
      }
    }
    
    // Fallback - use a simple IP detection
    return { ip: 'unknown' };
  } catch (error) {
    console.error('All IP services failed:', error);
    return { ip: 'unknown' };
  }
};

export const checkIPRestriction = async (sessionId: string, sessionOptions: Record<string, any>): Promise<boolean> => {
  if (!sessionOptions?.lockToFirstIP) return true;

  try {
    const ipInfo = await getIPInfo();
    
    // Check current session IP
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('first_viewer_ip')
      .eq('id', sessionId)
      .single();

    if (!sessionData?.first_viewer_ip) {
      // First visitor - set the IP
      await supabase
        .from('sessions')
        .update({ first_viewer_ip: ipInfo.ip })
        .eq('id', sessionId);
      return true;
    }

    return sessionData.first_viewer_ip === ipInfo.ip;
  } catch (error) {
    console.error('IP restriction check failed:', error);
    return true; // Allow access on error
  }
};
