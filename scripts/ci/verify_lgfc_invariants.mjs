import fs from 'node:fs';

function must(cond, msg) {
  if (!cond) {
    console.error('ERROR:', msg);
    process.exit(1);
  }
}

const navDoc = fs.readFileSync('docs/reference/design/LGFC-Production-Design-and-Standards.md', 'utf8');
must(navDoc.includes('# LGFC Production Design and Standards'), 'LGFC-Production-Design-and-Standards.md missing expected header');

const header = fs.readFileSync('src/components/Header.tsx', 'utf8');
const idxJoin = header.indexOf('href="/join"');
const idxSearch = header.indexOf('href="/search"');
const idxStore = header.indexOf('bonfire.com/store/lou-gehrig-fan-club');
const idxLogin = header.indexOf('href="/login"');

must(idxJoin !== -1, 'Header missing Join link to /join');
must(idxSearch !== -1, 'Header missing Search link to /search');
must(idxStore !== -1, 'Header missing Store external link');
must(idxLogin !== -1, 'Header missing Login link to /login');
must(idxJoin < idxSearch && idxSearch < idxStore && idxStore < idxLogin, 'Header public button order must be Join, Search, Store, Login');

const fanClubHeader = fs.readFileSync('src/components/FanClubHeader.tsx', 'utf8');
must(fanClubHeader.includes('href="/fanclub"') || fanClubHeader.includes("href='/fanclub'"), 'FanClubHeader must include Club Home link to /fanclub');
must(fanClubHeader.includes('href="/fanclub/myprofile"') || fanClubHeader.includes("href='/fanclub/myprofile'"), 'FanClubHeader must include My Profile link to /fanclub/myprofile');
must(fanClubHeader.includes('href="/search"') || fanClubHeader.includes("href='/search'"), 'FanClubHeader must include Search link');
must(fanClubHeader.includes('bonfire.com/store/lou-gehrig-fan-club'), 'FanClubHeader must include external Store link');
must(fanClubHeader.includes('href="/logout"') || fanClubHeader.includes("href='/logout'"), 'FanClubHeader must include Logout link to /logout');

console.log('OK: LGFC critical invariants satisfied (nav/auth surfaces).');
