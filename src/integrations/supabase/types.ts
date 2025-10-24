export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      allowlist_wallets: {
        Row: {
          created_at: string
          expires_at: string | null
          note: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          note?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          note?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          bank_name: string
          country: string
          created_at: string
          iban: string
          id: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          account_name: string
          bank_name: string
          country: string
          created_at?: string
          iban: string
          id?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          account_name?: string
          bank_name?: string
          country?: string
          created_at?: string
          iban?: string
          id?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficial_owners: {
        Row: {
          country_of_residence: string
          created_at: string
          dob: string
          first_name: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status_enum"] | null
          last_name: string
          nationality: string
          org_id: string
          pep_status: Database["public"]["Enums"]["risk_status"] | null
          role: Database["public"]["Enums"]["bo_role"]
          sanctions_status: Database["public"]["Enums"]["risk_status"] | null
          updated_at: string
        }
        Insert: {
          country_of_residence: string
          created_at?: string
          dob: string
          first_name: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status_enum"] | null
          last_name: string
          nationality: string
          org_id: string
          pep_status?: Database["public"]["Enums"]["risk_status"] | null
          role: Database["public"]["Enums"]["bo_role"]
          sanctions_status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string
        }
        Update: {
          country_of_residence?: string
          created_at?: string
          dob?: string
          first_name?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status_enum"] | null
          last_name?: string
          nationality?: string
          org_id?: string
          pep_status?: Database["public"]["Enums"]["risk_status"] | null
          role?: Database["public"]["Enums"]["bo_role"]
          sanctions_status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficial_owners_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bo_documents: {
        Row: {
          bo_id: string
          created_at: string
          doc_type: Database["public"]["Enums"]["bo_doc_type"]
          expires_on: string | null
          file_hash: string
          file_url: string
          id: string
          issued_on: string | null
          uploaded_by: string | null
        }
        Insert: {
          bo_id: string
          created_at?: string
          doc_type: Database["public"]["Enums"]["bo_doc_type"]
          expires_on?: string | null
          file_hash: string
          file_url: string
          id?: string
          issued_on?: string | null
          uploaded_by?: string | null
        }
        Update: {
          bo_id?: string
          created_at?: string
          doc_type?: Database["public"]["Enums"]["bo_doc_type"]
          expires_on?: string | null
          file_hash?: string
          file_url?: string
          id?: string
          issued_on?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bo_documents_bo_id_fkey"
            columns: ["bo_id"]
            isOneToOne: false
            referencedRelation: "beneficial_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bo_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      funder_cases: {
        Row: {
          checklist: Json | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          id: string
          org_id: string | null
          provider: Database["public"]["Enums"]["case_provider"]
          provider_ref: string | null
          status: Database["public"]["Enums"]["case_status"] | null
          type: Database["public"]["Enums"]["case_type"]
          user_id: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          org_id?: string | null
          provider: Database["public"]["Enums"]["case_provider"]
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["case_status"] | null
          type: Database["public"]["Enums"]["case_type"]
          user_id: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          org_id?: string | null
          provider?: Database["public"]["Enums"]["case_provider"]
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["case_status"] | null
          type?: Database["public"]["Enums"]["case_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funder_cases_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funder_cases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funder_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      funder_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          entity_name: string | null
          expires_on: string | null
          file_hash: string
          file_url: string
          id: string
          issued_on: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          entity_name?: string | null
          expires_on?: string | null
          file_hash: string
          file_url: string
          id?: string
          issued_on?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          entity_name?: string | null
          expires_on?: string | null
          file_hash?: string
          file_url?: string
          id?: string
          issued_on?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funder_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      funder_profiles: {
        Row: {
          accreditation: Database["public"]["Enums"]["accreditation"] | null
          aml_answers: Json | null
          annual_income_band: Database["public"]["Enums"]["income_band"] | null
          consent_docs: Json | null
          created_at: string
          fatca_crs_self_cert: Json | null
          id: string
          nationality: string | null
          net_worth_band: Database["public"]["Enums"]["net_worth_band"] | null
          residency_country: string
          source_of_funds:
            | Database["public"]["Enums"]["source_of_funds"][]
            | null
          source_of_wealth: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          tax_residency_country: string
          tin: string | null
          type: Database["public"]["Enums"]["funder_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accreditation?: Database["public"]["Enums"]["accreditation"] | null
          aml_answers?: Json | null
          annual_income_band?: Database["public"]["Enums"]["income_band"] | null
          consent_docs?: Json | null
          created_at?: string
          fatca_crs_self_cert?: Json | null
          id?: string
          nationality?: string | null
          net_worth_band?: Database["public"]["Enums"]["net_worth_band"] | null
          residency_country: string
          source_of_funds?:
            | Database["public"]["Enums"]["source_of_funds"][]
            | null
          source_of_wealth?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          tax_residency_country: string
          tin?: string | null
          type: Database["public"]["Enums"]["funder_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accreditation?: Database["public"]["Enums"]["accreditation"] | null
          aml_answers?: Json | null
          annual_income_band?: Database["public"]["Enums"]["income_band"] | null
          consent_docs?: Json | null
          created_at?: string
          fatca_crs_self_cert?: Json | null
          id?: string
          nationality?: string | null
          net_worth_band?: Database["public"]["Enums"]["net_worth_band"] | null
          residency_country?: string
          source_of_funds?:
            | Database["public"]["Enums"]["source_of_funds"][]
            | null
          source_of_wealth?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          tax_residency_country?: string
          tin?: string | null
          type?: Database["public"]["Enums"]["funder_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funder_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_verifications: {
        Row: {
          created_at: string
          id: string
          method: Database["public"]["Enums"]["gate_method"]
          mode: Database["public"]["Enums"]["gate_mode"]
          raw: Json | null
          reasons: string[] | null
          result: Database["public"]["Enums"]["gate_result"]
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["gate_method"]
          mode: Database["public"]["Enums"]["gate_mode"]
          raw?: Json | null
          reasons?: string[] | null
          result: Database["public"]["Enums"]["gate_result"]
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["gate_method"]
          mode?: Database["public"]["Enums"]["gate_mode"]
          raw?: Json | null
          reasons?: string[] | null
          result?: Database["public"]["Enums"]["gate_result"]
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_events: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          event: string
          id: string
          invoice_id: string
          note: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          event: string
          id?: string
          invoice_id: string
          note?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          event?: string
          id?: string
          invoice_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_eur: number
          approved_at: string | null
          approved_by: string | null
          buyer_country: string | null
          buyer_name: string | null
          buyer_vat: string | null
          cnft_collection: string | null
          cnft_leaf_id: string | null
          cnft_mint: string | null
          counterparty: string
          created_at: string | null
          currency: string | null
          due_date: string
          file_hash: string | null
          file_url: string | null
          id: string
          invoice_number: string | null
          mint_tx: string | null
          minted_at: string | null
          org_id: string
          payout_id: string | null
          payout_status: string | null
          rift_grade: Database["public"]["Enums"]["rift_grade"] | null
          rift_score: number | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          submitted_at: string | null
          tenor_days: number | null
          updated_at: string | null
        }
        Insert: {
          amount_eur: number
          approved_at?: string | null
          approved_by?: string | null
          buyer_country?: string | null
          buyer_name?: string | null
          buyer_vat?: string | null
          cnft_collection?: string | null
          cnft_leaf_id?: string | null
          cnft_mint?: string | null
          counterparty: string
          created_at?: string | null
          currency?: string | null
          due_date: string
          file_hash?: string | null
          file_url?: string | null
          id?: string
          invoice_number?: string | null
          mint_tx?: string | null
          minted_at?: string | null
          org_id: string
          payout_id?: string | null
          payout_status?: string | null
          rift_grade?: Database["public"]["Enums"]["rift_grade"] | null
          rift_score?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          submitted_at?: string | null
          tenor_days?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_eur?: number
          approved_at?: string | null
          approved_by?: string | null
          buyer_country?: string | null
          buyer_name?: string | null
          buyer_vat?: string | null
          cnft_collection?: string | null
          cnft_leaf_id?: string | null
          cnft_mint?: string | null
          counterparty?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string
          file_hash?: string | null
          file_url?: string | null
          id?: string
          invoice_number?: string | null
          mint_tx?: string | null
          minted_at?: string | null
          org_id?: string
          payout_id?: string | null
          payout_status?: string | null
          rift_grade?: Database["public"]["Enums"]["rift_grade"] | null
          rift_score?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          submitted_at?: string | null
          tenor_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      kyb_cases: {
        Row: {
          checklist: Json | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          id: string
          org_id: string
          provider: Database["public"]["Enums"]["case_provider"]
          provider_ref: string | null
          status: Database["public"]["Enums"]["case_status"] | null
          submitted_by: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          org_id: string
          provider: Database["public"]["Enums"]["case_provider"]
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["case_status"] | null
          submitted_by?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          org_id?: string
          provider?: Database["public"]["Enums"]["case_provider"]
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["case_status"] | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyb_cases_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyb_cases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyb_cases_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          chain_slot: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          org_id: string | null
          pool_id: string | null
          ref_id: string | null
          ref_type: Database["public"]["Enums"]["ledger_ref_type"]
          tx_sig: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          chain_slot?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          org_id?: string | null
          pool_id?: string | null
          ref_id?: string | null
          ref_type: Database["public"]["Enums"]["ledger_ref_type"]
          tx_sig?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          chain_slot?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          org_id?: string | null
          pool_id?: string | null
          ref_id?: string | null
          ref_type?: Database["public"]["Enums"]["ledger_ref_type"]
          tx_sig?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      org_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["org_doc_type"]
          expires_on: string | null
          file_hash: string
          file_url: string
          id: string
          issued_on: string | null
          org_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["org_doc_type"]
          expires_on?: string | null
          file_hash: string
          file_url: string
          id?: string
          issued_on?: string | null
          org_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["org_doc_type"]
          expires_on?: string | null
          file_hash?: string
          file_url?: string
          id?: string
          issued_on?: string | null
          org_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string
          created_at: string | null
          date_of_incorporation: string | null
          email: string | null
          eori_number: string | null
          iban: string | null
          id: string
          industry: string | null
          kyb_raw: Json | null
          kyb_score: number | null
          kyb_status: Database["public"]["Enums"]["kyb_status"] | null
          legal_form: string | null
          name: string
          pep_risk: string | null
          phone: string | null
          postal_code: string | null
          registration_country: string | null
          registration_number: string | null
          sanctions_risk: string | null
          trading_name: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country: string
          created_at?: string | null
          date_of_incorporation?: string | null
          email?: string | null
          eori_number?: string | null
          iban?: string | null
          id?: string
          industry?: string | null
          kyb_raw?: Json | null
          kyb_score?: number | null
          kyb_status?: Database["public"]["Enums"]["kyb_status"] | null
          legal_form?: string | null
          name: string
          pep_risk?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_country?: string | null
          registration_number?: string | null
          sanctions_risk?: string | null
          trading_name?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string
          created_at?: string | null
          date_of_incorporation?: string | null
          email?: string | null
          eori_number?: string | null
          iban?: string | null
          id?: string
          industry?: string | null
          kyb_raw?: Json | null
          kyb_score?: number | null
          kyb_status?: Database["public"]["Enums"]["kyb_status"] | null
          legal_form?: string | null
          name?: string
          pep_risk?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_country?: string | null
          registration_number?: string | null
          sanctions_risk?: string | null
          trading_name?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          created_at: string
          discount_rate_bps: number | null
          fees_eur: number | null
          gross_amount: number
          id: string
          invoice_id: string
          net_amount: number
          org_id: string
          paid_at: string | null
          status: string | null
          tx_sig: string | null
        }
        Insert: {
          created_at?: string
          discount_rate_bps?: number | null
          fees_eur?: number | null
          gross_amount: number
          id?: string
          invoice_id: string
          net_amount: number
          org_id: string
          paid_at?: string | null
          status?: string | null
          tx_sig?: string | null
        }
        Update: {
          created_at?: string
          discount_rate_bps?: number | null
          fees_eur?: number | null
          gross_amount?: number
          id?: string
          invoice_id?: string
          net_amount?: number
          org_id?: string
          paid_at?: string | null
          status?: string | null
          tx_sig?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_snapshots: {
        Row: {
          available_liquidity: number
          id: string
          pool_id: string
          timestamp: string
          tvl: number
        }
        Insert: {
          available_liquidity: number
          id?: string
          pool_id: string
          timestamp?: string
          tvl: number
        }
        Update: {
          available_liquidity?: number
          id?: string
          pool_id?: string
          timestamp?: string
          tvl?: number
        }
        Relationships: [
          {
            foreignKeyName: "pool_snapshots_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          apr: number
          available_liquidity: number | null
          created_at: string | null
          id: string
          tenor_days: number
          total_liquidity: number | null
          tvl: number | null
          updated_at: string | null
        }
        Insert: {
          apr: number
          available_liquidity?: number | null
          created_at?: string | null
          id?: string
          tenor_days: number
          total_liquidity?: number | null
          tvl?: number | null
          updated_at?: string | null
        }
        Update: {
          apr?: number
          available_liquidity?: number | null
          created_at?: string | null
          id?: string
          tenor_days?: number
          total_liquidity?: number | null
          tvl?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          accrued_yield: number | null
          amount_funded: number
          chain_tx: string | null
          closed_at: string | null
          created_at: string | null
          expected_yield: number
          funder_user_id: string
          id: string
          invoice_id: string
          opened_at: string | null
          pool_id: string
          status: Database["public"]["Enums"]["position_status"] | null
          updated_at: string | null
        }
        Insert: {
          accrued_yield?: number | null
          amount_funded: number
          chain_tx?: string | null
          closed_at?: string | null
          created_at?: string | null
          expected_yield: number
          funder_user_id: string
          id?: string
          invoice_id: string
          opened_at?: string | null
          pool_id: string
          status?: Database["public"]["Enums"]["position_status"] | null
          updated_at?: string | null
        }
        Update: {
          accrued_yield?: number | null
          amount_funded?: number
          chain_tx?: string | null
          closed_at?: string | null
          created_at?: string | null
          expected_yield?: number
          funder_user_id?: string
          id?: string
          invoice_id?: string
          opened_at?: string | null
          pool_id?: string
          status?: Database["public"]["Enums"]["position_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "positions_funder_user_id_fkey"
            columns: ["funder_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          completed_at: string | null
          id: string
          notes: string | null
          request_type: string
          requested_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          request_type: string
          requested_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          request_type?: string
          requested_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rift_score_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          delta: number
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id: string
          reason: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta: number
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          reason: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta?: number
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "rift_score_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rift_scores: {
        Row: {
          breakdown: Json
          calc_context: Json | null
          calculated_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          grade: Database["public"]["Enums"]["rift_grade"]
          id: string
          inputs_snapshot: Json
          total_score: number
          version: string
        }
        Insert: {
          breakdown: Json
          calc_context?: Json | null
          calculated_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          grade: Database["public"]["Enums"]["rift_grade"]
          id?: string
          inputs_snapshot: Json
          total_score: number
          version?: string
        }
        Update: {
          breakdown?: Json
          calc_context?: Json | null
          calculated_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          grade?: Database["public"]["Enums"]["rift_grade"]
          id?: string
          inputs_snapshot?: Json
          total_score?: number
          version?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          civic_verified: boolean | null
          created_at: string | null
          email: string
          gate_status: Database["public"]["Enums"]["gate_status"]
          gate_updated_at: string | null
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          wallet_id: string | null
        }
        Insert: {
          auth_id?: string | null
          civic_verified?: boolean | null
          created_at?: string | null
          email: string
          gate_status?: Database["public"]["Enums"]["gate_status"]
          gate_updated_at?: string | null
          id?: string
          org_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          wallet_id?: string | null
        }
        Update: {
          auth_id?: string | null
          civic_verified?: boolean | null
          created_at?: string | null
          email?: string
          gate_status?: Database["public"]["Enums"]["gate_status"]
          gate_updated_at?: string | null
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          address: string
          created_at: string | null
          id: string
          provider: Database["public"]["Enums"]["wallet_provider"]
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          provider: Database["public"]["Enums"]["wallet_provider"]
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["wallet_provider"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_operator_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      accreditation: "na" | "retail" | "professional" | "accredited"
      bo_doc_type:
        | "passport"
        | "national_id"
        | "driver_license"
        | "selfie"
        | "proof_of_address"
        | "other"
      bo_role: "ubo" | "director" | "signatory"
      case_provider: "mock" | "sumsub" | "veriff"
      case_status:
        | "open"
        | "in_review"
        | "approved"
        | "rejected"
        | "awaiting_docs"
      case_type: "kyc_individual" | "kyb_entity"
      doc_type:
        | "passport"
        | "national_id"
        | "proof_of_address"
        | "company_registry"
        | "board_resolution"
        | "authorized_signatory"
        | "w8_w9"
        | "bank_statement"
        | "other"
      entity_type_enum: "invoice" | "organization"
      funder_type: "individual" | "entity"
      gate_method: "kyb_only" | "email_allowlist" | "sanctions_check" | "combo"
      gate_mode: "mock" | "live"
      gate_result: "approved" | "denied"
      gate_status: "unverified" | "pending" | "verified" | "denied"
      income_band: "lt_50k" | "50k_200k" | "200k_1m" | "gt_1m"
      invoice_status:
        | "draft"
        | "listed"
        | "funded"
        | "repaid"
        | "defaulted"
        | "submitted"
        | "in_review"
        | "approved"
      kyb_status: "pending" | "approved" | "rejected"
      kyc_status_enum:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
      ledger_ref_type:
        | "deposit"
        | "payout"
        | "repayment_inflow"
        | "distribution"
        | "fee"
      net_worth_band: "lt_250k" | "250k_1m" | "1m_5m" | "gt_5m"
      org_doc_type:
        | "certificate_of_incorporation"
        | "memorandum"
        | "articles"
        | "vat_certificate"
        | "utility_bill"
        | "bank_statement"
        | "directors_register"
        | "shareholders_register"
        | "proof_of_address"
        | "other"
      position_status: "active" | "closed" | "defaulted"
      profile_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
      rift_grade: "A" | "B" | "C"
      risk_status: "unknown" | "clear" | "match" | "hit"
      source_of_funds:
        | "salary"
        | "savings"
        | "business_income"
        | "investment_returns"
        | "inheritance"
        | "crypto_proceeds"
        | "other"
      user_role: "seller" | "buyer" | "funder" | "operator" | "admin"
      wallet_provider: "privy" | "web3auth"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      accreditation: ["na", "retail", "professional", "accredited"],
      bo_doc_type: [
        "passport",
        "national_id",
        "driver_license",
        "selfie",
        "proof_of_address",
        "other",
      ],
      bo_role: ["ubo", "director", "signatory"],
      case_provider: ["mock", "sumsub", "veriff"],
      case_status: [
        "open",
        "in_review",
        "approved",
        "rejected",
        "awaiting_docs",
      ],
      case_type: ["kyc_individual", "kyb_entity"],
      doc_type: [
        "passport",
        "national_id",
        "proof_of_address",
        "company_registry",
        "board_resolution",
        "authorized_signatory",
        "w8_w9",
        "bank_statement",
        "other",
      ],
      entity_type_enum: ["invoice", "organization"],
      funder_type: ["individual", "entity"],
      gate_method: ["kyb_only", "email_allowlist", "sanctions_check", "combo"],
      gate_mode: ["mock", "live"],
      gate_result: ["approved", "denied"],
      gate_status: ["unverified", "pending", "verified", "denied"],
      income_band: ["lt_50k", "50k_200k", "200k_1m", "gt_1m"],
      invoice_status: [
        "draft",
        "listed",
        "funded",
        "repaid",
        "defaulted",
        "submitted",
        "in_review",
        "approved",
      ],
      kyb_status: ["pending", "approved", "rejected"],
      kyc_status_enum: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
      ],
      ledger_ref_type: [
        "deposit",
        "payout",
        "repayment_inflow",
        "distribution",
        "fee",
      ],
      net_worth_band: ["lt_250k", "250k_1m", "1m_5m", "gt_5m"],
      org_doc_type: [
        "certificate_of_incorporation",
        "memorandum",
        "articles",
        "vat_certificate",
        "utility_bill",
        "bank_statement",
        "directors_register",
        "shareholders_register",
        "proof_of_address",
        "other",
      ],
      position_status: ["active", "closed", "defaulted"],
      profile_status: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
      ],
      rift_grade: ["A", "B", "C"],
      risk_status: ["unknown", "clear", "match", "hit"],
      source_of_funds: [
        "salary",
        "savings",
        "business_income",
        "investment_returns",
        "inheritance",
        "crypto_proceeds",
        "other",
      ],
      user_role: ["seller", "buyer", "funder", "operator", "admin"],
      wallet_provider: ["privy", "web3auth"],
    },
  },
} as const
