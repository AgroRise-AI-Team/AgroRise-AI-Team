// TypeScript Interfaces for Frontend Code (Section 5 of API Specification)

export interface UserProfile {
  role: 'FARMER' | 'BUYER' | 'BOTH' | 'EXPERT';
  phone_number: string;
  bio?: string;
  profile_picture?: string | null;
  district: string;
  panchayath_or_village?: string;
  address?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  preferred_language: 'ml' | 'en';
  voice_assistant_enabled: boolean;
  land_area: string;
  land_area_unit: 'ACRES' | 'CENTS' | 'HECTARES';
  soil_type: string;
  soil_ph?: string | null;
  water_availability: string;
  primary_water_source: string;
  irrigation_method: string;
  current_crop: string;
  growth_stage: string;
  historical_pest_issues?: string;
  last_estimated_pest_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  cultivation_budget: string;
  available_labour_count: number;
  expected_yield_quintals?: string | null;
  expected_selling_price_per_unit?: string | null;
  is_verified_farmer: boolean;
  upi_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
}

export interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

export interface CropRecommendationRequest {
  soil_type: string;
  soil_ph: number;
  land_area: number;
  land_area_unit: string;
  water_availability: string;
  district: string;
  budget: number;
}

export interface RankedCrop {
  rank: number;
  crop_name: string;
  suitability_score: string;
  explanation: string;
  basic_guidance: string;
}

export interface CropRecommendationResponse {
  ranked_crops: RankedCrop[];
}

export interface PestRiskRequest {
  crop_type: string;
  growth_stage: string;
  season: string;
  historical_pest_info: string;
}

export interface PestRiskResponse {
  risk_level: 'Low' | 'Medium' | 'High';
  likely_pests: string[];
  preventive_suggestions: string[];
}

export interface IrrigationAdvisoryRequest {
  crop_type: string;
  soil_type: string;
  growth_stage: string;
  water_source: string;
}

export interface IrrigationAdvisoryResponse {
  suggested_timing: string;
  water_requirement: string;
  water_saving_practices: string[];
}

export interface VoiceAskResponse {
  transcribed_question: string;
  response_text: string;
  audio_url: string;
}

export interface SubPlotAllocation {
  plot_id: string;
  recommended_crop: string;
  budget_allocated: number;
  labour_days_needed: number;
}

export interface ResourceAllocationResponse {
  allocation_plan: SubPlotAllocation[];
  guidance: string;
}

export interface CostEstimatorRequest {
  crop: string;
  land_area: number;
  seed_cost: number;
  fertiliser_cost: number;
  labour_cost: number;
  irrigation_cost: number;
  other_expenses: number;
  expected_yield_quintals: number;
  expected_price_per_quintal: number;
}

export interface CostEstimatorResponse {
  total_expenses: number;
  gross_returns: number;
  estimated_net_profit: number;
  roi_percentage: string;
  break_even_price: string;
}

export interface ProductListing {
  id: number;
  farmer_name: string;
  farmer_phone: string;
  is_verified: boolean;
  district: string;
  crop_name: string;
  quantity_available_kg: number;
  price_per_kg: number;
  images: string[];
}
