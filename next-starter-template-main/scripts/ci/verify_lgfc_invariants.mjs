import fs from 'node:fs';

function must(cond, msg) {
  if (!cond) {
    console.error('ERROR:', msg);
    process.exit(1);
  }
}

const navDoc = fs.readFileSync('docs/NAVIGATION-INVARIANTS.md', 'utf8');
must(navDoc.includes('LGFC — Navigation Invariants'), 'NAVIGATION-INVARIANTS.md missing expected header');

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

const memberHeader = fs.readFileSync('src/components/MemberHeader.tsx', 'utf8');
must(memberHeader.includes('href="/fanclub"') || memberHeader.includes("href='/fanclub'"), 'MemberHeader must include Club Home link to /fanclub');
must(memberHeader.includes('href="/fanclub/myprofile"') || memberHeader.includes("href='/fanclub/myprofile'"), 'MemberHeader must include My Profile link to /fanclub/myprofile');
must(memberHeader.includes('href="/search"') || memberHeader.includes("href='/search'"), 'MemberHeader must include Search link');
must(memberHeader.includes('bonfire.com/store/lou-gehrig-fan-club'), 'MemberHeader must include external Store link');
must(memberHeader.includes('href="/logout"') || memberHeader.includes("href='/logout'"), 'MemberHeader must include Logout link to /logout');

console.log('OK: LGFC critical invariants satisfied (nav/auth surfaces).');
