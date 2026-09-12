<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# QR Time — The Overengineered Smartwatch Clock 🎯

## Basic Details
### Team Name: Bugger Bros

### Team Members
- Team Lead: HARIRAMAN T O - College of Engineering Attingal
- Member 2: ASWIN S - College of Engineering Attingal

### Project Description
An ultra-overengineered way to check the time! Instead of displaying hours and minutes on your smartwatch screen, it displays a static QR code. When you scan that QR code using your smartphone camera, it redirects you to a live web application that queries our cloud backend in real time to calculate and display the current date, time, day, timezone, and exact scan instant.

### The Problem (that doesn't exist)
Glancing at your wrist to check the time takes less than 0.5 seconds and requires zero internet connection. This is dangerously convenient and completely ruins the thrill of discovering what time it is!

### The Solution (that nobody asked for)
We turned the smartwatch into a dedicated QR code billboard. To know the time, you must now:
1. Turn on your smartwatch to look at the QR code.
2. Reach into your pocket and pull out your smartphone.
3. Open your phone camera and carefully frame the smartwatch on your wrist.
4. Tap the detected URL to send an HTTP request across the internet to our Vercel serverless cloud API.
5. Watch your phone calculate and render the live ticking clock in Indian Standard Time (`Asia/Kolkata`)!

---

## Technical Details

### Technologies/Components Used

#### For Software:
- **Languages used**: JavaScript (Node.js ES6+), HTML5, CSS3, Kotlin
- **Frameworks used**: Express.js, Android Jetpack
- **Libraries used**: `qrcode` (npm), `androidx.camera:camera-camera2` (CameraX), `com.google.mlkit:barcode-scanning`, `com.google.zxing:core`
- **Tools used**: Android Studio, Visual Studio Code, Vercel, Git, GitHub

#### For Hardware:
- **Main components**: Wear OS Smartwatch (or Browser Watchface Simulator), Android Smartphone with Camera
- **Specifications**: High-resolution AMOLED watch display, rear camera autofocus with QR reading capability
- **Tools required**: Wi-Fi / Cellular Internet connection

---

### Implementation

#### For Software:

# Installation
```bash
git clone https://github.com/foryouharii/buggers-bros.git
cd buggers-bros/qr-time-app
npm install
```

# Run
```bash
npm start
```
Or view the live cloud deployment directly at:  
👉 **[https://buggers-bros-n5gl.vercel.app/watch](https://buggers-bros-n5gl.vercel.app/watch)**

---

### Project Documentation

#### For Software:

# Screenshots
![Smartwatch QR Screen](https://raw.githubusercontent.com/foryouharii/buggers-bros/main/qr-time-app/public/watch.html)
<img width="1920" height="1080" alt="Screenshot 2026-09-12 094418" src="https://github.com/user-attachments/assets/15ea67e3-7cfc-4539-ad08-1483fb05c7fd" />

*1. Smartwatch Watchface displaying the fixed scannable QR Code and Device ID (`WATCH001`)*

![Mobile Scan Result](https://raw.githubusercontent.com/foryouharii/buggers-bros/main/qr-time-app/public/scan.html)
*2. Phone Scan Result Page showing exact captured scan time, live ticking clock, full date, day, and IST timezone*
<img width="720" height="1600" alt="8fe10067-c943-4d8f-89da-9cca5d8f4bb9" src="https://github.com/user-attachments/assets/36017780-8392-404b-8c04-4af36111300f" />

![API Response](https://buggers-bros-n5gl.vercel.app/api/time?device=WATCH001)
*3. Backend `/api/time` returning real-time synchronized JSON timestamp from the server*

# Diagrams
```
┌──────────────────────────────────────┐
│       Smartwatch / Watchface         │
│  ┌────────────────────────────────┐  │
│  │         QR TIME WATCH          │  │
│  │      [  QR CODE IMAGE  ]       │  │
│  │    /scan?device=WATCH001       │  │
│  └────────────────────────────────┘  │
└──────────────────┬───────────────────┘
                   │
                   │  📷 Scan with Phone Camera
                   ▼
┌──────────────────────────────────────┐
│           Mobile Smartphone          │
│   Opens https://.../scan?device=...   │
│                   │                  │
│                   ▼                  │
│   Queries GET /api/time (Express)    │
│                   │                  │
│                   ▼                  │
│   Displays:                          │
│   ✓ Scanned Successfully             │
│   ⏰ Live Clock: 04:52:10 AM         │
│   ⚡ Scanned At: 04:52:10 AM         │
│   📅 Date: Saturday, 12 Sep 2026     │
│   🌐 Time Zone: Asia/Kolkata (IST)   │
└──────────────────────────────────────┘
```
*Architecture & Data Workflow of QR Time*

---

### Project Demo

# Video
[https://buggers-bros-n5gl.vercel.app/watch](https://buggers-bros-n5gl.vercel.app/watch)  



https://github.com/user-attachments/assets/85b24ee1-d7bd-4518-91c2-1ccbb8d1b9e5


*Demonstrates opening the smartwatch QR screen, scanning it with a mobile camera, and immediately viewing the live synchronized time on the phone.*

# Additional Demos
- **Live Smartwatch View**: [https://buggers-bros-n5gl.vercel.app/watch](https://buggers-bros-n5gl.vercel.app/watch)
- **Live Mobile Scan View**: [https://buggers-bros-n5gl.vercel.app/scan?device=WATCH001](https://buggers-bros-n5gl.vercel.app/scan?device=WATCH001)
- **Time API JSON Endpoint**: [https://buggers-bros-n5gl.vercel.app/api/time?device=WATCH001](https://buggers-bros-n5gl.vercel.app/api/time?device=WATCH001)

---

## Team Contributions
- **HARIRAMAN T O**: Full-stack backend API development, Express server implementation, real-time clock synchronization algorithms, and Vercel cloud deployment.
- **ASWIN S**: Smartwatch UI design, mobile scan interface, Android/Wear OS module integration, camera scanner pipeline, and testing.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
