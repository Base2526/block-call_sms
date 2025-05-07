export interface reportItem {
  report_id: string;
  user_id: string;
  seller_first_name: string;
  seller_last_name: string;
  id_card: string;
  seller_accounts: any[],
  tel_numbers: any[],
  bank: string;
  product: string;
  transfer_amount: number;
  transfer_date: string; // ISO string
  selling_website: string;
  province: string; // Province ID
  additional_info?: string;
  images: any[]; // URLs or file paths
  created_at: string;
  updated_at: string;
}