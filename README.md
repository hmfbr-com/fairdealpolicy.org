# fairdealpolicy.org (v0)
Static site for the Fair Deal Policy (FDP). Designed for GitHub Pages + custom domain.

## Structure
- / (Home)
- /adopt/ (adoption snippets)
- /memo/ (Fair Deal Memo template)
- /ladder/ (alignment ladder)
- /faq/
- /stewardship/

## Deploy
1) Push to GitHub.
2) Enable GitHub Pages from main branch.
3) Set custom domain to fairdealpolicy.org (CNAME included).
4) Point Hostinger DNS A records to GitHub Pages IPs.


## v1.1 (Practice + portability)
- Added /practice page (Pilot A pack + learning loop)
- Added “Use FDP anywhere” portability section on Home
- Added canonical FDP clause + LinkedIn/Open Collective application guidance on Adopt
- Memo labeled v1 and linked to practice pilots
- Navigation updated to include Practice

## v1.1.1 (Layout + LinkedIn links)
- Fixed Home page button layout (container alignment)
- Replaced LinkedIn placeholder (#) with real Company + Showcase links

## Production deployment (GitHub Pages + apex domain)
- This repo includes `CNAME` for `fairdealpolicy.org` (apex canonical).
- `.nojekyll` is included to avoid Jekyll processing.
- `robots.txt` + `sitemap.xml` included for basic indexing hygiene.


## v1.1.5 (Mobile navigation)
- Added collapsible mobile menu (hamburger) with accessible toggle
- Improved mobile spacing, tap targets, and code block scrolling

## v1.1.8 (Templates layer)
- Added /templates/ hub page
- Added canonical /templates/skeleton/ (FDP Template Skeleton v1.0)
- Added downloadable formats (Markdown + RTF)
- Navigation + footer updated with Templates link
