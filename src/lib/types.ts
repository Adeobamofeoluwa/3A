export interface Work {
  id: string
  title: string
  description: string | null
  category: string | null
  material: string | null
  dimensions: string | null
  price: string | null
  status: string | null
  image_url: string | null
  gallery_urls: string[] | null
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface WorkLike {
  id: string
  work_id: string
  visitor_id: string
  created_at: string
}

export interface WorkReview {
  id: string
  work_id: string
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Booking {
  id: string
  work_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  message: string | null
  status: string
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  created_at: string
}

export interface Exhibition {
  id: string
  title: string
  description: string | null
  location: string | null
  start_date: string
  end_date: string | null
  image_url: string | null
  status: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface QuoteRequest {
  id: string
  name: string
  email: string
  phone: string | null
  project_type: string
  budget_range: string | null
  description: string
  status: string
  created_at: string
}

export interface Testimonial {
  id: string
  client_name: string
  client_role: string | null
  quote: string
  rating: number
  display_order: number
  created_at: string
}

export interface SiteSettings {
  id: number
  site_name: string
  logo_url: string | null
  tagline: string
  hero_title: string
  hero_subtitle: string
  hero_image_url: string | null
  about_title: string
  about_text: string
  about_image_url: string | null
  contact_email: string
  primary_color: string
  secondary_color: string
  accent_color: string
  footer_text: string
  admin_link_label: string
  admin_link_visible: boolean
  admin_username: string
  admin_password: string
  instagram_url: string
  facebook_url: string
  whatsapp_url: string
  created_at: string
  updated_at: string
}
