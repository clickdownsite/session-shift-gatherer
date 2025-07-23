
export interface Session {
  id: string;
  user_id: string;
  main_page_id: string;
  current_sub_page_id: string;
  page_type?: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  has_new_data: boolean;
  session_options: Record<string, any>;
  first_viewer_ip?: string | null;
  flow_id?: string | null;
  current_flow_step?: number | null;
}

export interface SessionData {
  id: string;
  session_id: string;
  timestamp: string;
  ip_address: string | null;
  location: string | null;
  form_data: Record<string, any>;
  device_info: Record<string, any> | null;
}

export interface MainPage {
  id: string;
  name: string;
  description: string | null;
}

export interface SubPage {
  id:string;
  main_page_id: string;
  name: string;
  description: string | null;
  fields: string[];
  html: string | null;
  css: string | null;
  javascript: string | null;
  created_at: string | null;
  updated_at: string | null;
}
