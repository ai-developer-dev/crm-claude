-- Create calls table for call history and tracking
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twilio_call_sid VARCHAR(255) UNIQUE,
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- 'queued', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    duration INTEGER, -- in seconds
    start_time TIMESTAMP WITH TIME ZONE,
    answer_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10, 5),
    price_unit VARCHAR(3) DEFAULT 'USD',
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_calls_twilio_sid ON calls(twilio_call_sid);
CREATE INDEX idx_calls_from_user ON calls(from_user_id);
CREATE INDEX idx_calls_to_user ON calls(to_user_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_created_at ON calls(created_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE
    ON calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();