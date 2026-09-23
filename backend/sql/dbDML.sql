USE FairwayRateHub;

-- Admin user (password: admin123)
INSERT INTO `User` (email, password_hash, name, user_type) VALUES
('admin@fairwayratehub.com', 'pbkdf2_sha256$1000000$placeholder$adminhashedpassword', 'Admin User', 'admin');

-- Seed Bay Area Golf Courses
INSERT INTO GolfCourse (name, location, rating_avg, conditions) VALUES
('TPC Harding Park', 'San Francisco, CA', 4.6,
 'Championship Bermuda fairways in excellent shape. Greens are firm and fast at Stimp 11. Coastal winds from the west averaging 15–20 mph — factor in at least two clubs on exposed holes. Cart paths clear. No temporary greens.'),

('Lincoln Park Golf Course', 'San Francisco, CA', 3.8,
 'Scenic municipal course with ocean views from several holes. Greens running moderately at Stimp 9, receptive to approach shots. Morning fog typical; tee times after 10am recommended. Fairways recently overseeded, some soft spots near #7 and #14.'),

('Sharp Park Golf Course', 'Pacifica, CA', 3.5,
 'Classic links layout fully exposed to Pacific Ocean winds. Greens recovering post-renovation — slightly inconsistent but improving weekly. Bunkers freshly raked. Bring a wind game; course plays 2–3 shots harder than card suggests on breezy days.'),

('Crystal Springs Golf Course', 'Burlingame, CA', 4.2,
 'Impeccably maintained bentgrass greens running at Stimp 10.5. Fairways lush and manicured. Minimal wind due to valley setting. Cart required on back nine. Course in peak condition after recent aeration — greens now fully recovered and rolling true.'),

('Half Moon Bay Golf Links — Ocean Course', 'Half Moon Bay, CA', 4.7,
 'World-class cliffside layout. Greens firm and fast at Stimp 12. Strong coastal breeze steady at 20 mph; holes 13–18 play directly into prevailing wind. Fairways in top shape. Full caddie service available. One of the best public layouts in Northern California.'),

('Half Moon Bay Golf Links — Old Course', 'Half Moon Bay, CA', 4.3,
 'Parkland-style companion to the Ocean Course. Bentgrass throughout, fairways consistent and forgiving. Greens at Stimp 10, good pace for all skill levels. Far less wind exposure than Ocean Course. Great warm-up round before tackling the cliffs.'),

('Tilden Park Golf Course', 'Berkeley, CA', 3.7,
 'Wooded municipal course in the East Bay hills. Greens on the softer side — receptive but slower at Stimp 8. Morning fog lingers until noon. Cart paths in good shape. Course playing well for early-season, though holes 4 and 11 still show some wear from winter rains.'),

('Chuck Corica Golf Complex — South Course', 'Alameda, CA', 3.9,
 'Flat links-style layout with excellent winter drainage. Greens at Stimp 9.5, putting well. Steady bay breeze out of the west most afternoons. Fairways in solid condition after recent renovation. Great value public course — book at least a week ahead on weekends.'),

('Boundary Oak Golf Course', 'Walnut Creek, CA', 4.0,
 'Tree-lined East Bay parkland course. Bentgrass greens running true at Stimp 10. Inland heat can reach 95°F in summer — morning tee times strongly recommended June–September. Fairways firm and fast in dry season. Bunkers well-maintained throughout.'),

('Palo Alto Golf Course', 'Palo Alto, CA', 3.6,
 'Flat, accessible municipal course ideal for beginners and casual rounds. Greens at Stimp 8.5, consistent and easy to read. Fairways maintained but some divot recovery needed on par-5 landing zones. Walk-on availability most weekday mornings. Affordable rates.'),

('Sunol Valley Golf Course — Palm Course', 'Sunol, CA', 4.1,
 'Valley setting with scenic views of the Sunol hills. Bermuda fairways playing firm and fast. Greens at Stimp 10, running true with subtle breaks. Wind minimal, making this a good scoring opportunity. Both nines in solid condition. Popular weekend destination — reserve early.'),

('Cinnabar Hills Golf Club', 'San Jose, CA', 4.4,
 '27-hole facility with three 9-hole combinations. Rolling terrain with elevation changes throughout. Greens at Stimp 11, some of the fastest in South Bay. Course conditions excellent — winner of multiple local maintenance awards. Scenic views of the Almaden Valley on back nine.'),

('Santa Teresa Golf Club', 'San Jose, CA', 3.9,
 'Classic South Bay public course with mature tree-lined fairways. Bentgrass greens at Stimp 9.5, consistent and fair. Fairways well-maintained despite high play volume. Walking-friendly layout. New irrigation system installed last season — conditions noticeably improved over prior year.'),

('Poppy Ridge Golf Course', 'Livermore, CA', 4.3,
 '27-hole wine country venue operated by the NCGA. Bentgrass throughout all three nines. Greens at Stimp 10, rolling true. Livermore afternoon winds pick up around 2pm on the Zinfandel and Merlot nines. Course immaculate — one of the best-maintained public facilities in the Bay Area.'),

('Diablo Creek Golf Course', 'Concord, CA', 3.8,
 'Affordable tree-lined municipal course in the East Bay. Bermuda fairways in good shape, recovering well after a wet winter. Greens at Stimp 9, putting consistently. Creek comes into play on five holes — course management is key. Best value public round in Contra Costa County.');
