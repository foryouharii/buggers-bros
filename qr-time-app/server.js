const express = require('express');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
const TIMEZONE = 'Asia/Kolkata';

// Helper to get local network IPv4 address for phone scanning on same Wi-Fi
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Pick IPv4 and non-internal addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses[0] || 'localhost';
}

// Get the base URL for the QR code target
function getBaseUrl(req) {
    if (process.env.PUBLIC_URL && process.env.PUBLIC_URL.trim() !== '') {
        return process.env.PUBLIC_URL.replace(/\/+$/, '');
    }
    
    // Auto-detect host from request or fallback to LAN IP
    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.includes('127.0.0.1')) {
        const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        return `${proto}://${hostHeader}`;
    }

    const localIp = getLocalIpAddress();
    return `http://${localIp}:${PORT}`;
}

// Sanitize device ID
function sanitizeDeviceId(rawId) {
    if (!rawId || typeof rawId !== 'string') {
        return 'WATCH001';
    }
    // Allow alphanumeric characters, hyphen, and underscore (1-32 chars)
    const cleaned = rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    return cleaned.slice(0, 32) || 'WATCH001';
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Root route - redirect to watch interface
app.get('/', (req, res) => {
    res.redirect('/watch');
});

// Watch Page
app.get('/watch', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'watch.html'));
});

// Scan Result Page
app.get('/scan', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

/**
 * GET /api/time
 * Returns current server time in Asia/Kolkata timezone
 */
app.get('/api/time', (req, res) => {
    try {
        const deviceId = sanitizeDeviceId(req.query.device);
        const now = new Date();

        // Format date and time in Asia/Kolkata timezone
        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: TIMEZONE,
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const dayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: TIMEZONE,
            weekday: 'long'
        });

        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const time12Formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const timeString = timeFormatter.format(now);
        const time12String = time12Formatter.format(now);
        const dateString = dateFormatter.format(now);
        const dayString = dayFormatter.format(now);

        res.json({
            date: dateString,
            time: timeString,
            time12: time12String,
            day: dayString,
            timezone: TIMEZONE,
            deviceId: deviceId,
            scanTime: timeString,
            scanTime12: time12String,
            timestamp: now.getTime(),
            iso: now.toISOString()
        });
    } catch (err) {
        console.error('Error generating time response:', err);
        res.status(500).json({
            error: 'Failed to generate time data',
            message: err.message
        });
    }
});

/**
 * GET /api/qr
 * Generates a high-quality QR code data URL encoding the scan URL
 */
app.get('/api/qr', async (req, res) => {
    try {
        const deviceId = sanitizeDeviceId(req.query.device);
        const baseUrl = getBaseUrl(req);
        const scanUrl = `${baseUrl}/scan?device=${encodeURIComponent(deviceId)}`;

        // High error correction, white background, black modules, clean margin
        const qrDataUrl = await QRCode.toDataURL(scanUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 2,
            width: 400,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.json({
            success: true,
            deviceId: deviceId,
            scanUrl: scanUrl,
            qrCode: qrDataUrl,
            baseUrl: baseUrl
        });
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({
            error: 'Failed to generate QR code',
            message: err.message
        });
    }
});

/**
 * GET /api/info
 * Network and host diagnostic information
 */
app.get('/api/info', (req, res) => {
    res.json({
        port: PORT,
        localIp: getLocalIpAddress(),
        publicUrl: process.env.PUBLIC_URL || null,
        detectedBaseUrl: getBaseUrl(req),
        timezone: TIMEZONE
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'scan.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`\n=================================================`);
    console.log(`⏱️  QR Time Smartwatch Server is Running!`);
    console.log(`=================================================`);
    console.log(`📍 Local Smartwatch URL : http://localhost:${PORT}/watch`);
    console.log(`📱 Mobile Network URL   : http://${localIp}:${PORT}/watch`);
    console.log(`🔍 Direct Scan URL      : http://${localIp}:${PORT}/scan?device=WATCH001`);
    if (process.env.PUBLIC_URL) {
        console.log(`🌐 Public URL Configured: ${process.env.PUBLIC_URL}`);
    }
    console.log(`⚡ Timezone             : ${TIMEZONE}`);
    console.log(`=================================================\n`);
});
