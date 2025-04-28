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
  id?: number; 
  customer_id: number | null; 
  customer_name: string; 
  address: string; 
  order_status: string; 
  order_price: number | null; 
  order_cost: number | null; 
  work_types: string; 
  created_at?: string;
  created_by: string | null; 
  company: string | null; 
  code: string; 
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
  id?: number;
  material_type: string;
  unit: string;
  quantity: number;
  cost: number;
  order_id: number;
  material_name: string;
  total_cost: number;
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
  async retrieveDB<T>(table: string, filters: Partial<T> = {}, limit?: number, orderBy: string = 'id', ascending: boolean = true): Promise<T[]> {
    let query = this.supabase.from(table).select('*');
    
    if (Object.keys(filters).length) {
      query = query.match(filters);  // Apply filters dynamically
    }
    
    if (limit) {
      query = query.limit(limit);  // Apply limit if provided
    }
  
    // Apply sorting: use the column (orderBy) and direction (ascending/descending)
    query = query.order(orderBy, { ascending });
  
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error retrieving from ${table}:`, error);
      return [];
    }
    
    return data as T[];  // Cast the data to the correct type
  }
  
  
  async updateDB<T extends { id?: number; detail_id?: number }>(
    table: string,
    id: number,
    data: Partial<T>
  ): Promise<T | null> {
    // Pick the correct primary-key column
    const idField = table === 'OrderDetails' ? 'detail_id' : 'id';
  
    /* 1) Fetch the current row ---------------------------------------- */
    const { data: oldRow, error: fetchErr } = await this.supabase
      .from(table)
      .select('*')
      .eq(idField, id)
      .single();
  
    if (fetchErr) {
      console.error(`Error fetching current ${table} row (${idField}=${id})`, fetchErr);
      throw fetchErr;
    }
  
    /* 2) Perform the update ------------------------------------------- */
    const { data: newRow, error: updErr } = await this.supabase
      .from(table)
      .update(data)
      .eq(idField, id)
      .select('*')
      .single();
  
    if (updErr) {
      console.error(`Error updating ${table} (${idField}=${id})`, updErr);
      throw updErr;
    }
  
    /* 3) Build a diff of changed fields -------------------------------- */
    const diff: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(data) as (keyof T)[]) {
      const before = (oldRow as T)[key];
      const after  = (newRow as T)[key];
      if (before !== after) {
        diff[key as string] = { old: before, new: after };
      }
    }
  
    /* 4) Pretty console output ---------------------------------------- */
    console.group(`Updated row in ${table} (${idField}=${id})`);
    if (Object.keys(diff).length === 0) {
      console.info('No values actually changed.');
    } else {
      Object.entries(diff).forEach(([field, d]) =>
        console.info(`%c${field}:`, 'color:#0d6efd', d.old, '→', d.new)
      );
    }
    console.groupEnd();

    console.info(`Updated in ${table}:`, newRow);
  
    return (newRow as T) || null;
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

  // 1. Introspect tables
  async listTables(): Promise<string[]> {
    const { data, error } = await this.supabase
      .rpc('get_public_tables');
    if (error) throw error;
    return (data as any[]).map(r => r.table_name);
  }

  // 2. Generic row fetcher
  async getRows(table: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(table)
      .select('*');
    if (error) throw error;
    return data || [];
  }

}
