export interface reportItem {
    _id: string;
    current:{
      sellerFirstName: string;
      sellerLastName: string;
      idCard: string;
      telNumbers: any[],
      sellerAccount: string;
      bank: string;
      product: string;
      transferAmount: number;
      transferDate: string; // ISO string
      sellingWebsite: string;
      province: string; // Province ID
      additionalInfo?: string;
      images: any[]; // URLs or file paths
    }
    updatedAt: string
}