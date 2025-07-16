CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  author VARCHAR(100),
  category VARCHAR(50) DEFAULT 'motivation',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert some initial quotes
INSERT INTO quotes (text, author, category) VALUES
('The only bad workout is the one that didn\'t happen.', 'Unknown', 'motivation'),
('Your body can do it. It\'s your mind you have to convince.', 'Unknown', 'motivation'),
('Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t.', 'Rikki Rogers', 'strength'),
('The groundwork for all happiness is good health.', 'Leigh Hunt', 'general'),
('Take care of your body. It\'s the only place you have to live.', 'Jim Rohn', 'general'),
('Success isn\'t always about greatness. It\'s about consistency.', 'Dwayne Johnson', 'motivation'),
('The pain you feel today will be the strength you feel tomorrow.', 'Unknown', 'motivation'),
('Don\'t limit your challenges, challenge your limits.', 'Unknown', 'motivation'),
('Fitness is not about being better than someone else. It\'s about being better than you used to be.', 'Unknown', 'motivation'),
('Every workout is progress.', 'Unknown', 'motivation');