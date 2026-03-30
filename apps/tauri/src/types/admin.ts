export interface PendingTithe {
  id: string;
  member_name: string;
  amount: number;
  type: "tithe" | "offering";
  description?: string;
  receipt_url?: string;
  created_at: string;
  rejection_reason?: string;
}

export interface PendingExpense {
  id: string;
  member_name: string;
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
  created_at: string;
  rejection_reason?: string;
}

export interface Assembly {
  id: string;
  title: string;
  scheduled_at: string;
  status: "scheduled" | "in_progress" | "concluded";
  agenda: string[];
  church_id: string;
  location?: string;
  council_id?: string;
}

export interface VotingItem {
  id: string;
  title: string;
  description: string;
  assembly_id: string;
  yes_count: number;
  no_count: number;
  abstain_count: number;
  status: "open" | "closed";
  total_votes: number;
  user_vote?: "yes" | "no" | "abstain" | null;
}
