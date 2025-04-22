export interface Customer {
    id?: string;
    name?: string;
    country?: Country;
    company?: string;
    date?: Date;
    status?: string;
    activity?: number;
    representative?: Representative;
    verified?: boolean;
    balance?: number;
  }
  
  export interface Country {
    name?: string;
    code?: string;
  }
  
  export interface Representative {
    name?: string;
    image?: string;
  }