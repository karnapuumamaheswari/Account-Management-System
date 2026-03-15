create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  balance numeric(12, 2) not null default 10000,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('credit', 'debit')),
  balance_after_transaction numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_sender_id on public.transactions(sender_id);
create index if not exists idx_transactions_receiver_id on public.transactions(receiver_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

create or replace function public.transfer_money(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount numeric
)
returns json
language plpgsql
security definer
as $$
declare
  sender_balance numeric(12, 2);
  receiver_name text;
  sender_name text;
  sender_new_balance numeric(12, 2);
  receiver_new_balance numeric(12, 2);
begin
  if p_sender_id = p_receiver_id then
    raise exception 'Cannot transfer money to the same account';
  end if;

  select balance, name
  into sender_balance, sender_name
  from public.users
  where id = p_sender_id
  for update;

  if sender_balance is null then
    raise exception 'Sender not found';
  end if;

  select name
  into receiver_name
  from public.users
  where id = p_receiver_id
  for update;

  if receiver_name is null then
    raise exception 'Receiver not found';
  end if;

  if sender_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  sender_new_balance := sender_balance - p_amount;

  update public.users
  set balance = sender_new_balance
  where id = p_sender_id;

  update public.users
  set balance = balance + p_amount
  where id = p_receiver_id
  returning balance into receiver_new_balance;

  insert into public.transactions (
    sender_id,
    receiver_id,
    amount,
    transaction_type,
    balance_after_transaction
  )
  values (
    p_sender_id,
    p_receiver_id,
    p_amount,
    'debit',
    sender_new_balance
  );

  insert into public.transactions (
    sender_id,
    receiver_id,
    amount,
    transaction_type,
    balance_after_transaction
  )
  values (
    p_sender_id,
    p_receiver_id,
    p_amount,
    'credit',
    receiver_new_balance
  );

  return json_build_object(
    'sender_name', sender_name,
    'receiver_name', receiver_name,
    'amount', p_amount,
    'sender_balance', sender_new_balance,
    'receiver_balance', receiver_new_balance
  );
end;
$$;
