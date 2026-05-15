-- ZAKEVENTS Supabase Schema
-- Full PostgreSQL schema with RLS, indexes, and constraints

-- Enums
CREATE TYPE user_role AS ENUM ('CLIENT', 'PRESTATAIRE', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE payment_status AS ENUM ('NONE', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED');
CREATE TYPE provider_status AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'DELETED');
CREATE TYPE service_category AS ENUM ('PHOTOGRAPHE', 'SALLE', 'TRAITEUR', 'DECORATION', 'MUSIQUE', 'BEAUTE', 'TRANSPORT', 'WEDDING_PLANNER');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'ENDED');
CREATE TYPE availability_status AS ENUM ('AVAILABLE', 'BLOCKED', 'BOOKED');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'CLIENT',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);

-- Providers
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category service_category NOT NULL,
  description TEXT,
  cities TEXT[] NOT NULL DEFAULT '{}',
  min_price INTEGER DEFAULT 0,
  rating_average REAL DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  review_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  status provider_status DEFAULT 'PENDING',
  response_time_hours INTEGER DEFAULT 24,
  portfolio_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id)
);
CREATE INDEX idx_providers_category_status ON providers(category, status);
CREATE INDEX idx_providers_cities ON providers USING GIN(cities);
CREATE INDEX idx_providers_rating ON providers(rating_average DESC);

-- Service Packages
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  max_guests INTEGER,
  includes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_packages_provider ON service_packages(provider_id);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  package_id UUID REFERENCES service_packages(id),
  event_date DATE NOT NULL,
  event_time TEXT,
  guest_count INTEGER,
  status booking_status DEFAULT 'PENDING',
  payment_status payment_status DEFAULT 'NONE',
  total_amount INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  chargily_transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  client_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_booking ON messages(booking_id);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Availability
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status DEFAULT 'AVAILABLE',
  UNIQUE(provider_id, date),
  CHECK (date >= CURRENT_DATE - INTERVAL '1 day')
);
CREATE INDEX idx_availability_provider_date ON availability(provider_id, date);

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  filed_by UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status dispute_status DEFAULT 'OPEN',
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status campaign_status DEFAULT 'DRAFT',
  featured_package_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Idempotency Keys
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CSRF Tokens (database-backed for multi-instance support)
CREATE TABLE csrf_tokens (
  token TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_csrf_tokens_expires ON csrf_tokens(expires_at);

-- Feature Flags
CREATE TABLE feature_flags (
  name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Users: read own, admins read all
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = auth_id OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Providers: public read approved, owner update
CREATE POLICY providers_select ON providers FOR SELECT USING (status = 'APPROVED' OR user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY providers_update ON providers FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Bookings: client or provider can read their own
CREATE POLICY bookings_select ON bookings FOR SELECT USING (
  client_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
  provider_id IN (SELECT id FROM providers WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
);
CREATE POLICY bookings_insert ON bookings FOR INSERT WITH CHECK (client_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Service packages: public read active
CREATE POLICY packages_select ON service_packages FOR SELECT USING (is_active = TRUE OR provider_id IN (SELECT id FROM providers WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())));
CREATE POLICY packages_manage ON service_packages FOR ALL USING (provider_id IN (SELECT id FROM providers WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Reviews: public read
CREATE POLICY reviews_select ON reviews FOR SELECT USING (TRUE);
CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (client_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Messages: sender or receiver
CREATE POLICY messages_select ON messages FOR SELECT USING (
  sender_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
  receiver_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (sender_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Notifications: own only
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Availability: public read, provider manage
CREATE POLICY availability_select ON availability FOR SELECT USING (TRUE);
CREATE POLICY availability_manage ON availability FOR ALL USING (provider_id IN (SELECT id FROM providers WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Disputes: filed_by can read own
CREATE POLICY disputes_select ON disputes FOR SELECT USING (filed_by = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY disputes_insert ON disputes FOR INSERT WITH CHECK (filed_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Transactional webhook processing function
CREATE OR REPLACE FUNCTION update_booking_payment(
  p_booking_id UUID,
  p_payment_status payment_status,
  p_transaction_id TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE bookings SET
    payment_status = p_payment_status,
    chargily_transaction_id = p_transaction_id,
    updated_at = now()
  WHERE id = p_booking_id;

  INSERT INTO audit_log (action, entity_type, entity_id, metadata)
  VALUES ('payment_update', 'booking', p_booking_id, jsonb_build_object('status', p_payment_status, 'transaction_id', p_transaction_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
