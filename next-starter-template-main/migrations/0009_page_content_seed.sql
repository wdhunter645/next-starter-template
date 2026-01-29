-- 0009_page_content_seed.sql
-- Purpose: Seed initial live copy blocks. Idempotent: inserts ONLY if missing.
-- NOTE: This will NOT overwrite later edits made in D1.

INSERT OR IGNORE INTO page_content (slug, section, status, content, asset_url)
VALUES
  ('/about','title','live','About the Lou Gehrig Fan Club',NULL),
  ('/about','lead_html','live','<p>Lou Gehrig wasn’t just an all‑time great ballplayer. He stood for resilience, humility, and character — and his story still matters.</p>',NULL),
  ('/about','body_html','live','<p>This site is the club’s public home: explore photos and memorabilia, learn about ALS causes we support, and follow updates as the archive grows.</p><p>We’re building this as a legacy project — meant to last for decades, not weeks.</p>',NULL),

  ('/charities','title','live','Charities',NULL),
  ('/charities','lead_html','live','<p>ALS changed history when Lou Gehrig brought national attention to the disease. It remains a cause that demands research, support, and compassion.</p>',NULL),
  ('/charities','body_html','live','<p>The Lou Gehrig Fan Club highlights ALS-related charitable giving — not private profit.</p><ul><li>A short list of ALS organizations to start with</li><li>Occasional featured fundraisers and events</li><li>Simple guidance on donating and verifying charities</li></ul>',NULL),

  ('/contact','title','live','Contact',NULL),
  ('/contact','lead_html','live','<p>Questions, suggestions, or something we should fix? Send a note and we’ll respond.</p>',NULL),
  ('/contact','body_html','live','<p>Email: <a href="mailto:LouGehrigFanClub@gmail.com">LouGehrigFanClub@gmail.com</a></p><p>Mailing Address:<br/>Lou Gehrig Fan Club<br/>P.O. Box 145<br/>Glastonbury, CT 06033</p>',NULL),

  ('/privacy','title','live','Privacy',NULL),
  ('/privacy','body_html','live','<p>We collect the minimum information needed to run the site. Join requests store name and email so we can send a welcome message and updates.</p><p>We do not sell personal information. If you want your data removed, contact us.</p>',NULL),

  ('/terms','title','live','Terms',NULL),
  ('/terms','body_html','live','<p>By using this site you agree to behave respectfully and avoid abusive or unlawful activity.</p><p>User-submitted content grants the site the right to display it. Copyright or trademark concerns will be addressed promptly; infringing content will be removed.</p><p>The club operates with a zero-profit mission; any proceeds are directed to ALS-related charitable giving.</p>',NULL),

  ('/photos','title','live','Photo Archive',NULL),
  ('/photos','lead_html','live','<p>Browse the growing Lou Gehrig photo archive. New items are added regularly.</p>',NULL),

  ('/memorabilia','title','live','Memorabilia',NULL),
  ('/memorabilia','lead_html','live','<p>Explore memorabilia items in the archive — cards, programs, clippings, and more.</p>',NULL),

  ('/','hero_title','live','Lou Gehrig Fan Club',NULL),
  ('/','hero_subtitle_html','live','<p>Preserving the legacy. Building a positive community. Supporting ALS causes.</p>',NULL),
  ('/','home_feature_html','live','<p><strong>Featured this week:</strong> New photos added to the archive. Check back often — the collection is growing.</p>',NULL),
  ('/','join_banner_html','live','<p>Become a member. Get access to the Gehrig library, media archive, memorabilia archive, and more.</p>',NULL);
