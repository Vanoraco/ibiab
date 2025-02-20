-- Create events table
create table if not exists public.events (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    date date not null,
    time time not null,
    note text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.events enable row level security;

-- Create policies
create policy "Users can view their own events."
    on events for select
    using (auth.uid() = user_id);

create policy "Users can insert their own events."
    on events for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own events."
    on events for update
    using (auth.uid() = user_id);

create policy "Users can delete their own events."
    on events for delete
    using (auth.uid() = user_id);