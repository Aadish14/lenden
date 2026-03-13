-- Run this SQL in your Supabase SQL Editor to create the required table

CREATE TABLE IF NOT EXISTS public.ledgers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    to_receive JSONB DEFAULT '[]'::jsonb,
    to_pay JSONB DEFAULT '[]'::jsonb,
    transaction_history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS) so users can only see their own data
ALTER TABLE public.ledgers ENABLE ROW LEVEL SECURITY;

-- Create policies so users can read and write only their specific rows based on their user_id
CREATE POLICY "Users can view own ledger" ON public.ledgers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ledger" ON public.ledgers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ledger" ON public.ledgers FOR UPDATE USING (auth.uid() = user_id);
