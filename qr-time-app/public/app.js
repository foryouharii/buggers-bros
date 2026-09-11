/**
 * QR Time Smartwatch App - Client Logic
 */

// Helper: Show toast notification
function showToast(message) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.style.display = 'none';
    }, 2800);
}

// Copy text to clipboard
async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const tempInput = document.createElement('input');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }
        showToast(successMsg);
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy');
    }
}

/* ==========================================================================
   SMARTWATCH PAGE LOGIC (/watch)
   ========================================================================== */
function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let deviceId = urlParams.get('device') || 'WATCH001';
    
    const qrImageEl = document.getElementById('watchQrImage');
    const qrLoadingEl = document.getElementById('watchQrLoading');
    const deviceDisplayEl = document.getElementById('watchDeviceIdDisplay');
    const targetUrlTextEl = document.getElementById('targetUrlText');
    const liveTimeEl = document.getElementById('watchLiveTime');
    const deviceInputEl = document.getElementById('customDeviceInput');

    if (deviceInputEl) {
        deviceInputEl.value = deviceId;
    }

    // Update watch top bar live time
    function updateWatchClock() {
        if (!liveTimeEl) return;
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now);
        liveTimeEl.textContent = timeStr;
    }
    updateWatchClock();
    setInterval(updateWatchClock, 1000);

    // Fetch QR Code from Backend API
    async function loadQrCode(dev) {
        if (qrLoadingEl) qrLoadingEl.style.display = 'flex';
        if (qrImageEl) qrImageEl.style.display = 'none';
        
        try {
            const response = await fetch(`/api/qr?device=${encodeURIComponent(dev)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (data.qrCode && qrImageEl) {
                qrImageEl.src = data.qrCode;
                qrImageEl.alt = `QR Code for ${data.deviceId}`;
                qrImageEl.style.display = 'block';
                if (qrLoadingEl) qrLoadingEl.style.display = 'none';
            }

            if (deviceDisplayEl) deviceDisplayEl.textContent = data.deviceId;
            if (targetUrlTextEl) targetUrlTextEl.textContent = data.scanUrl;
            
            window.currentScanUrl = data.scanUrl;
        } catch (err) {
            console.error('Error loading QR code:', err);
            if (qrLoadingEl) {
                qrLoadingEl.innerHTML = '<span style="color:#ef4444;font-size:0.75rem;">Failed to load QR.<br><a href="javascript:location.reload()" style="color:#00e699;">Retry</a></span>';
            }
        }
    }

    loadQrCode(deviceId);

    // Copy scan URL button
    const copyBtn = document.getElementById('copyUrlBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (window.currentScanUrl) {
                copyToClipboard(window.currentScanUrl, 'Scan URL copied!');
            }
        });
    }

    // Direct open scan page test button
    const openScanBtn = document.getElementById('openScanBtn');
    if (openScanBtn) {
        openScanBtn.addEventListener('click', () => {
            if (window.currentScanUrl) {
                window.open(window.currentScanUrl, '_blank');
            }
        });
    }

    // Device switch form
    const deviceForm = document.getElementById('deviceForm');
    if (deviceForm) {
        deviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newDevice = deviceInputEl.value.trim() || 'WATCH001';
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('device', newDevice);
            window.history.replaceState({}, '', newUrl.toString());
            loadQrCode(newDevice);
        });
    }
}

/* ==========================================================================
   PHONE SCAN RESULT PAGE LOGIC (/scan)
   ========================================================================== */
function initScanPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device') || 'WATCH001';

    // Elements
    const heroTimeEl = document.getElementById('heroClockTime');
    const heroSubEl = document.getElementById('heroClockSub');
    const dayValueEl = document.getElementById('dayValue');
    const dateValueEl = document.getElementById('dateValue');
    const timeValueEl = document.getElementById('timeValue');
    const timezoneValueEl = document.getElementById('timezoneValue');
    const deviceValueEl = document.getElementById('deviceValue');
    const scanStampValueEl = document.getElementById('scanStampValue');
    const refreshBtn = document.getElementById('refreshBtn');
    const shareBtn = document.getElementById('shareBtn');

    let serverOffsetMs = 0; // Difference between server time and local device time
    let initialScanTime = null;

    // Fetch current time details from /api/time
    async function fetchServerTime(isInitial = false) {
        try {
            const startReq = Date.now();
            const response = await fetch(`/api/time?device=${encodeURIComponent(deviceId)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const roundTripTime = Date.now() - startReq;
            
            // Calculate server time offset including network latency compensation
            serverOffsetMs = (data.timestamp + (roundTripTime / 2)) - Date.now();

            // Set static details from server response
            if (dayValueEl) dayValueEl.textContent = data.day;
            if (dateValueEl) dateValueEl.textContent = data.date;
            if (timezoneValueEl) timezoneValueEl.textContent = `${data.timezone} (IST)`;
            if (deviceValueEl) deviceValueEl.textContent = data.deviceId;

            // Preserve the exact first scan time
            if (isInitial || !initialScanTime) {
                initialScanTime = data.scanTime;
                if (scanStampValueEl) scanStampValueEl.textContent = data.scanTime;
            }

            renderClock();
        } catch (err) {
            console.error('Failed to fetch time from /api/time:', err);
            showToast('⚠️ Could not sync with server. Retrying...');
        }
    }

    // Format and render live ticking clock
    function renderClock() {
        const now = new Date(Date.now() + serverOffsetMs);

        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const time12Formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const timeStr = timeFormatter.format(now);
        const time12Str = time12Formatter.format(now);

        if (heroTimeEl) heroTimeEl.textContent = timeStr;
        if (heroSubEl) heroSubEl.textContent = `${time12Str} • Indian Standard Time (IST)`;
        if (timeValueEl) timeValueEl.textContent = timeStr;
    }

    // Initial fetch on scan page load
    fetchServerTime(true);

    // Update real-time clock every 1000ms
    setInterval(renderClock, 1000);

    // Resync with backend every 30 seconds to maintain sub-second accuracy
    setInterval(() => fetchServerTime(false), 30000);

    // Refresh button event
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchServerTime(false);
            showToast('Time refreshed from server!');
        });
    }

    // Share / Copy link button event
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            copyToClipboard(window.location.href, 'Scan page link copied!');
        });
    }
}

// Auto-run appropriate initializer based on document page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('watchScreen')) {
        initWatchPage();
    } else if (document.getElementById('phoneContainer')) {
        initScanPage();
    }
});
