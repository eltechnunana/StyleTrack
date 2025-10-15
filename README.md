# StyleTrack

StyleTrack is a lightweight, browser-based app for small tailoring/fashion shops to track clients, orders, statuses, and generate PDF invoices/receipts. It runs entirely in the browser using HTML/CSS/JS, with data stored in the browser’s localStorage.

## Features
- Clients: add and view client records.
- Orders: create orders with item description, unit price, quantity, tax, discount, and live totals.
- Statuses: track order progress with `pending`, `in_progress`, `ready`, `delivered`.
- PDFs: generate invoice and receipt PDFs for any order.
- Settings: configure currency (including Ghana Cedi `GH₵`) and business info.
- Reports: view summaries by status.

## Quick Start
You can run StyleTrack with any static web server. Two common options are below.

### Option A: PHP built-in server (recommended for local dev)
1. Ensure PHP is installed (XAMPP or standalone).
2. From the project root, run:
   ```sh
   php -S 127.0.0.1:3020 -t public
   ```
3. Open `http://127.0.0.1:3020/home.html` in your browser.

### Option B: XAMPP
1. Place this folder under `C:\xampp\htdocs\StyleTrack`.
2. Start Apache in XAMPP.
3. Open `http://localhost/StyleTrack/home.html`.

## Usage Tips
- Settings: set your currency and business details first.
- Add Clients: go to `Clients`, add client info.
- Create Orders: on `Orders`, add an order (item, unit price, quantity, tax, discount). Totals update live and are saved.
- Update Status: use the status dropdown on each order row. Selecting `delivered` marks it as completed; the Home dashboard counts it under Completed.
- PDFs: click `Invoice` or `Receipt` on an order to download a PDF. Invoices show a table with Description, Quantity, Unit Price, and Line Total, plus summary totals.

## Data Storage
- All data is stored in `localStorage` in your browser. Clearing site data or using a private/incognito window will remove stored records.
- No server-side database is used by default.

## Project Structure
- `public/` — static site root.
  - `assets/js/` — main modules: `core.js`, `home.js`, `orders.js`, `clients.js`, `reports.js`, `settings.js`.
  - `home.html`, `orders.html`, `clients.html`, `reports.html`, `settings.html` — main pages.

## Development Notes
- The app uses vanilla JavaScript and simple Bootstrap-like classes for UI.
- PDF generation is handled client-side.
- Currency formatting is handled in `orders.js` and respects the selected currency symbol.

## Git
- Default branch: `main`.
- Remote: `origin` — `https://github.com/eltechnunana/StyleTrack.git`.

## License
No license is defined yet.