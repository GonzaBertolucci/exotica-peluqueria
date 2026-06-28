-- Para que la autenticación funcione sin Supabase Auth,
-- usamos una función que verifica la contraseña con pgcrypto

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla: barberos (usuarios del sistema)
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    working_hours JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Función para registrar barbero con contraseña hasheada
CREATE OR REPLACE FUNCTION create_barber(
    p_name TEXT,
    p_email TEXT,
    p_password TEXT,
    p_phone TEXT DEFAULT NULL
) RETURNS barbers AS $$
DECLARE
    new_barber barbers;
BEGIN
    INSERT INTO barbers (name, email, password_hash, phone)
    VALUES (p_name, p_email, crypt(p_password, gen_salt('bf')), p_phone)
    RETURNING * INTO new_barber;
    RETURN new_barber;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar contraseña
CREATE OR REPLACE FUNCTION verify_barber_password(
    barber_id INT,
    password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT password_hash INTO stored_hash FROM barbers WHERE id = barber_id;
    RETURN stored_hash = crypt(password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabla: clientes
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    birthday DATE,
    last_visit_date TIMESTAMPTZ,
    preferred_barber_id INT REFERENCES barbers(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_phone ON clients(phone);

-- Tabla: servicios
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: turnos
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    barber_id INT NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date_time TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    duration INT NOT NULL,
    notes TEXT,
    reminded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_date ON appointments(date_time);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Insertar servicios por defecto
INSERT INTO services (name, duration, price) VALUES
    ('Corte de cabello', 30, 2500),
    ('Corte + barba', 45, 3500),
    ('Barba', 20, 1500),
    ('Tinte', 90, 6000),
    ('Lavado + corte', 45, 3000),
    ('Corte infantil', 25, 2000);

-- Insertar admin por defecto (email: admin@exotica.com, pass: admin123)
SELECT create_barber('Admin', 'admin@exotica.com', 'admin123', '');
