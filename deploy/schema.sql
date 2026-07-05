create table if not exists admins (
  id bigserial primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id bigserial primary key,
  name text not null,
  sort integer not null default 0,
  status text not null default 'enabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id bigserial primary key,
  category_id bigint not null references categories(id),
  name text not null,
  description text not null default '',
  cover text not null default '',
  price_cents bigint not null check (price_cents >= 0),
  status text not null default 'enabled',
  delivery_mode text not null default 'auto' check (delivery_mode in ('auto','manual')),
  auto_delivery_order text not null default 'oldest' check (auto_delivery_order in ('oldest','newest','random')),
  manual_text text not null default '已支付，正在发货中，请稍后查询。',
  query_password_mode text not null default 'optional' check (query_password_mode in ('none','optional','required')),
  stock_visible boolean not null default true,
  buy_min integer not null default 1,
  buy_max integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_cards (
  id bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  secret text not null,
  preview_text text not null default '',
  status text not null default 'available' check (status in ('available','sold','locked')),
  sold_order_id bigint,
  sold_at timestamptz,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists payment_channels (
  id bigserial primary key,
  name text not null,
  code text not null unique,
  enabled boolean not null default true,
  config jsonb not null default '{}',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id bigserial primary key,
  trade_no text not null unique,
  product_id bigint not null references products(id),
  quantity integer not null check (quantity > 0),
  amount_cents bigint not null check (amount_cents >= 0),
  buyer_email text not null,
  buyer_contact text not null default '',
  query_password_hash text,
  payment_channel_id bigint references payment_channels(id),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','cancelled')),
  delivery_status text not null default 'pending' check (delivery_status in ('pending','delivered')),
  delivery_content text,
  pay_url text not null default '',
  paid_at timestamptz,
  delivered_at timestamptz,
  created_ip text not null default '',
  created_user_agent text not null default '',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_cards_sold_order_fk'
  ) then
    alter table product_cards
      add constraint product_cards_sold_order_fk
      foreign key (sold_order_id) references orders(id) on delete set null;
  end if;
end $$;

create table if not exists email_logs (
  id bigserial primary key,
  recipient text not null,
  subject text not null,
  body text not null,
  status text not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists operation_logs (
  id bigserial primary key,
  admin_id bigint references admins(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_cards_product_status on product_cards(product_id,status);
create index if not exists idx_orders_trade_no on orders(trade_no);
create index if not exists idx_orders_buyer_email on orders(buyer_email);
create index if not exists idx_orders_payment_delivery on orders(payment_status,delivery_status);

insert into admins(email,name,password_hash,created_at)
values('admin@example.com','Admin','$2a$10$3bjQiupVTljgy6csjnNAbuJXpV8iC0EW5iHGRB28WMmuk6ktQfmnq',now())
on conflict(email) do nothing;

insert into categories(id,name,sort,status,created_at,updated_at)
values(1,'默认分类',1,'enabled',now(),now())
on conflict(id) do nothing;

insert into products(id,category_id,name,description,price_cents,status,delivery_mode,auto_delivery_order,manual_text,query_password_mode,stock_visible,buy_min,buy_max,created_at,updated_at)
values(1,1,'演示自动发货商品','支付成功后会自动发出一张卡密。',100,'enabled','auto','oldest','已支付，正在发货中，请稍后查询。','optional',true,1,0,now(),now())
on conflict(id) do nothing;

insert into product_cards(product_id,secret,status,note,created_at)
select 1,'DEMO-CARD-0001','available','seed',now()
where not exists(select 1 from product_cards where product_id=1 and secret='DEMO-CARD-0001');
