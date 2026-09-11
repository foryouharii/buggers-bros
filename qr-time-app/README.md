# ⏱️ QR Time — Smartwatch App (Full-Stack)

A complete full-stack web application demonstrating dynamic time synchronization from a smartwatch QR code to a mobile phone.

---

## 🌟 How It Works

1. **Smartwatch Display (`/watch`)**:
   - The smartwatch renders a clean, dark AMOLED watchface.
   - It displays a **fixed QR code** targeting `/scan?device=WATCH001`.
   - The QR code **does not contain a static timestamp**.

2. **Mobile Phone Scanning (`/scan`)**:
   - When a user scans the QR code with their phone camera, it opens `/scan?device=WATCH001`.
   - The phone application queries `GET /api/time` from the backend in real-time.
   - It displays:
     - **Exact Scan Time** (frozen at the moment of scan)
     - **Live Synchronized Time** (ticking real-time clock synced with Indian Standard Time - `Asia/Kolkata`)
     - **Full Date** (e.g. *Saturday, 12 September 2026*)
     - **Day of Week** (*Saturday*)
     - **Time Zone** (*Asia/Kolkata / IST*)
     - **Device ID** (*WATCH001*)

---

## 📁 Project Structure

```
qr-time-app/
├── package.json         # Node.js dependencies & run scripts
├── server.js            # Express server (API endpoints & static hosting)
├── README.md            # Comprehensive documentation & setup guide
└── public/
    ├── watch.html       # Smartwatch UI simulation & QR generator
    ├── scan.html        # Mobile phone scan result interface
    ├── style.css        # Responsive dark theme with glassmorphism
    └── app.js           # Real-time clock synchronization & API client
```

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites (Install Node.js)
If you don't have Node.js installed:
- Download the LTS version from [https://nodejs.org](https://nodejs.org/).
- Verify installation in your terminal:
  ```bash
  node -v
  npm -v
  ```

### 2. Open Project & Install Dependencies
Open your terminal in the `qr-time-app` directory:
```bash
cd qr-time-app
npm install
```

### 3. Start the Server
Run the standard start command:
```bash
npm start
```
The server will start on port `3000`.

---

## 📱 Testing with Your Phone on the Same Wi-Fi

1. Ensure your **computer and phone are connected to the same Wi-Fi network**.
2. Start the server (`npm start`). The console will display your computer's local IP:
   ```
   📍 Local Smartwatch URL : http://localhost:3000/watch
   📱 Mobile Network URL   : http://192.168.1.15:3000/watch
   🔍 Direct Scan URL      : http://192.168.1.15:3000/scan?device=WATCH001
   ```
3. Open `http://localhost:3000/watch` on your computer screen.
4. Point your phone's camera at the displayed QR code.
5. Tap the link to open the scan page on your phone!

---

## 🔎 How to Find Your Computer's Local IP Address

### On Windows:
```powershell
ipconfig
```
Look for `IPv4 Address` under your active Wi-Fi adapter (e.g., `192.168.1.X` or `10.0.0.X`).

### On macOS / Linux:
```bash
ifconfig
# or
ip addr show
```

---

## 🛡️ Allowing Port 3000 Through Windows Firewall (If phone can't connect)

If your phone browser says "Cannot connect" while on the same Wi-Fi:
1. Press `Windows Key + R`, type `wf.msc`, and press Enter.
2. Click **Inbound Rules** > **New Rule...**
3. Select **Port** > **TCP** > Specific local ports: `3000`.
4. Select **Allow the connection**.
5. Keep all profiles checked (Domain, Private, Public) and name it `QR Time Server 3000`.
6. Click **Finish**.

---

## 🌐 Public Deployment & `PUBLIC_URL`

When hosting online (Render, Railway, Fly.io, Vercel, VPS, ngrok):

### 1. Set the Environment Variable
Set `PUBLIC_URL` to your production domain:
```bash
# Example
PUBLIC_URL=https://qr-time.yourdomain.com
```

### 2. Testing Publicly with ngrok (Quick Local Tunnel)
```bash
npx ngrok http 3000
```
Then set:
```bash
PUBLIC_URL=https://xxxx.ngrok-free.app npm start
```
The smartwatch QR code will automatically encode your public HTTPS domain for easy global scanning!

---

## 🛠️ API Reference

### 1. `GET /api/time`
Returns current timestamp in Indian Standard Time (`Asia/Kolkata`).
- **Query Params**: `device` (optional, default: `WATCH001`)
- **Response**:
```json
{
  "date": "Saturday, 12 September 2026",
  "time": "02:15:30",
  "time12": "02:15:30 AM",
  "day": "Saturday",
  "timezone": "Asia/Kolkata",
  "deviceId": "WATCH001",
  "scanTime": "02:15:30",
  "scanTime12": "02:15:30 AM",
  "timestamp": 1789160130000,
  "iso": "2026-09-12T02:15:30.000Z"
}
```

### 2. `GET /api/qr`
Generates a QR code image / base64 data URL.
- **Query Params**: `device` (optional, default: `WATCH001`)
- **Response**:
```json
{
  "success": true,
  "deviceId": "WATCH001",
  "scanUrl": "http://192.168.1.15:3000/scan?device=WATCH001",
  "qrCode": "data:image/png;base64,...",
  "baseUrl": "http://192.168.1.15:3000"
}
```
