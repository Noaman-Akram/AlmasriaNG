//supabase service ts 
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { style } from '@angular/animations';

// Interfaces / Modals 

export interface Customer {
  id?: number;
  name: string;
  address: string;
  created_at: string; // date ISO timestamp
  phone_number: string;
  company?: string;
  paid_total: number;
  to_be_paid: number;
}

export type WorkType = 'K' | 'W' | 'F' | 'X';

export interface Order {
  customer_id: number | null;
  customer_name: string;
  work_type: WorkType; // JSONB, you might want to use a specific type
  address: string;
  order_status: string;
}

export interface OrderDetail {
  detail_id: number;
  created_at: string; // ISO timestamp
  order_id: number;
  customer_name: string;
  assigned_to: string;
  updated_date: string; // Assuming ISO format date
  price: number;
  notes?: string;
  total_cost: number;
  img_url?: string;
}

export interface Measurement {
  id: number;
  marble_type: string;
  unit: string;
  quantity: number;
  cost: number;
  order_id: number;
}

export interface Material {
  id: number;
  name: string;
  source: string;
  type: string;
}

export interface FinanceAccount {
  id: number;
  name: string;
  amount: number;
}

export interface Transactions {
  id: number;
  created_at: string;
  amount: number;
  from: string;
  method: string;
  img_url: string;
}

// services start 
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  
  private supabase: SupabaseClient;

  
 //supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey , {
      auth: {
        persistSession: false,  // Disable session persistence
        autoRefreshToken: false, // Prevent auto-refresh from blocking
        detectSessionInUrl: false, // Avoid redirect handling issues
      }
    });  
 
  }


  


  get profile() {
    return this.supabase
      .from('Customers')
      .select(`*`)

  }
  

  async addOrder(order: Order) {
    const { data, error } = await this.supabase
      .from('Orders')
      .insert([order]);
  
    if (error) {
      console.error('Error inserting order:', error);
      throw error;
    }
    return data;
  }
  
  async addCustomer(customer: Customer) {
    const { data, error } = await this.supabase
      .from('Customer')
      .insert([customer]);
  
    if (error) {
      console.error('Error inserting order:', error);
      throw error;
    }
    return data;
  }
  
  async insertToDB<T>(table: string, data: T): Promise<T | null> {
    const { data: insertedData, error } = await this.supabase.from(table).insert([data]).select();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return null;
    }
    console.info(`From sp service Inserted into ${table}:`, insertedData);
    
    return insertedData ? insertedData[0] : null;
  }

  async retrieveDB<T>(table: string, filters: Partial<T> = {}): Promise<T[]> {
    let query = this.supabase.from(table).select('*');
    
    if (Object.keys(filters).length) {
      query = query.match(filters);  // Apply filters dynamically
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error(`Error retrieving from ${table}:`, error);
      return [];
    }
  
    return data as T[];  // Cast the data to the correct type
  }
  async updateDB<T extends { id?: number; detail_id?: number }>(table: string, id: number, data: Partial<T>): Promise<T | null> {
    const idField = table === 'OrderDetails' ? 'detail_id' : 'id'; // Handle different primary key for OrderDetails
    const { data: updatedData, error } = await this.supabase
      .from(table)
      .update(data)
      .eq(idField, id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${table} with ${idField} ${id}:`, error);
      throw error;
    }

    console.info(`Updated in ${table}:`, updatedData);
    return (updatedData as T) || null;
  }
  async deleteDB<T>(table: string, filters: Partial<T>): Promise<T[]> {
    const { data: deletedData, error } = await this.supabase
      .from(table)
      .delete()
      .match(filters)
      .select();

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }

    console.info(`Deleted from ${table}:`, deletedData);
    return (deletedData as T[]) || [];
  }
  async getLastOrderId(): Promise<number> {
    // We assume 'id' is your auto-increment primary key in 'Orders'
    const { data, error } = await this.supabase
      .from('Orders')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
  
    if (error) {
      console.error('Error fetching last order ID:', error);
      return 0; // Return 0 if there's an error
    }
  
    if (data && data.length > 0) {
      return data[0].id;
    } else {
      return 0; // If no records, start from 0
    }
  }


}
