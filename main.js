(function() {
    'use strict';
    const generateBtn = document.getElementById('generateBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const colorCountSelect = document.getElementById('colorCount');
    const colorModeSelect = document.getElementById('colorMode');
    const paletteContainer = document.getElementById('paletteContainer');
    const colorInfo = document.getElementById('colorInfo');
    const historyContainer = document.getElementById('historyContainer');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    let currentPalette = [];
    let history = [];

    function loadHistory() {
        const stored = localStorage.getItem('paletteHistory');
        if (stored) {
            try {
                history = JSON.parse(stored);
            } catch (e) {
                history = [];
            }
        }
    }

    function saveHistory() {
        localStorage.setItem('paletteHistory', JSON.stringify(history));
    }

    function generatePalette(count, mode) {
        const colors = [];
        const base = randomColor();

        for (let i = 0; i < count; i++) {
            let color;
            switch (mode) {
                case 'monochrome':
                    color = monochrome(base, i, count);
                    break;
                case 'analogous':
                    color = analogous(base, i, count);
                    break;
                case 'complementary':
                    color = complementary(base, i, count);
                    break;
                case 'triadic':
                    color = triadic(base, i, count);
                    break;
                case 'pastel':
                    color = pastelColor(i, count);
                    break;
                case 'vibrant':
                    color = vibrantColor(i, count);
                    break;
                default:
                    color = randomColor();
                    break;
            }
            colors.push(color);
        }

        return colors;
    }

    function randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return { r, g, b };
    }

    function rgbToHex(r, g, b) {
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
        return {
            r: Math.round(f(0) * 255),
            g: Math.round(f(8) * 255),
            b: Math.round(f(4) * 255)
        };
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    function getLuminance(r, g, b) {
        const rs = r / 255;
        const gs = g / 255;
        const bs = b / 255;
        return 0.299 * rs + 0.587 * gs + 0.114 * bs;
    }

    function monochrome(base, index, total) {
        const hsl = rgbToHsl(base.r, base.g, base.b);
        const step = 20;
        const l = Math.max(5, Math.min(95, hsl.l + (index - Math.floor(total/2)) * step));
        const rgb = hslToRgb(hsl.h, hsl.s, l);
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function analogous(base, index, total) {
        const hsl = rgbToHsl(base.r, base.g, base.b);
        const step = 25;
        const h = (hsl.h + (index - Math.floor(total/2)) * step + 360) % 360;
        const rgb = hslToRgb(h, hsl.s, hsl.l);
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function complementary(base, index, total) {
        const hsl = rgbToHsl(base.r, base.g, base.b);
        if (index === 0) return { r: base.r, g: base.g, b: base.b };
        const h = (hsl.h + 180 + (index - 1) * 30) % 360;
        const rgb = hslToRgb(h, hsl.s, hsl.l);
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function triadic(base, index, total) {
        const hsl = rgbToHsl(base.r, base.g, base.b);
        const h = (hsl.h + index * 120) % 360;
        const rgb = hslToRgb(h, hsl.s, hsl.l);
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function pastelColor(index, total) {
        const h = (index / total) * 360 + Math.random() * 20;
        const rgb = hslToRgb(h, 60 + Math.random() * 20, 75 + Math.random() * 15);
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function vibrantColor(index, total) {
        const h = (index / total) * 360 + Math.random() * 30;
        const rgb = hslToRgb(h, 80 + Math.random() * 15, 50 + Math.random() * 15);
        return { r: rgb.r, g: rgb.g, b: rgb.b };
    }

    function renderPalette(colors) {
        currentPalette = colors;
        const gridCols = Math.min(colors.length, 6);

        paletteContainer.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

        let html = '';
        colors.forEach((color, i) => {
            const hex = rgbToHex(color.r, color.g, color.b);
            const lum = getLuminance(color.r, color.g, color.b);
            const textClass = lum > 0.5 ? 'dark' : 'light';

            html += `
                <div class="palette-item" 
                     style="background:${hex};" 
                     data-hex="${hex}"
                     title="Click to copy ${hex}">
                    <span class="hex-code ${textClass}">${hex}</span>
                    <span class="color-label">Color ${i + 1}</span>
                </div>
            `;
        });

        paletteContainer.innerHTML = html;

        document.querySelectorAll('.palette-item').forEach(el => {
            el.addEventListener('click', function() {
                const hex = this.dataset.hex;
                copyToClipboard(hex);
                showToast(`📋 Copied ${hex}!`);

                colorInfo.innerHTML = `<span class="copied">✓ Copied ${hex}</span> — Click any color to copy its hex code`;
            });
        });

        addToHistory(colors);
    }

    function addToHistory(colors) {
        const hexColors = colors.map(c => rgbToHex(c.r, c.g, c.b));
        history.push(hexColors);
        if (history.length > 20) {
            history = history.slice(-20);
        }

        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="empty-msg">No palettes saved yet. Generate one!</p>';
            return;
        }

        let html = '';
        const reversed = [...history].reverse();
        reversed.forEach((palette, idx) => {
            const paletteIndex = history.length - 1 - idx;
            html += `<div class="history-item" data-index="${paletteIndex}">`;
            palette.forEach(hex => {
                html += `
                    <div class="color-swatch" style="background:${hex};" 
                         title="${hex}" 
                         onclick="event.stopPropagation(); copyToClipboard('${hex}'); showToast('📋 Copied ${hex}!');">
                    </div>
                `;
            });
            html += `
                <div class="color-hex">
                    <span>Palette ${history.length - idx}</span>
                </div>
            </div>`;
        });

        historyContainer.innerHTML = html;

        document.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                loadPaletteFromHistory(index);
            });
        });
    }

    function loadPaletteFromHistory(index) {
        const hexColors = history[index];
        if (!hexColors) return;

        const colors = hexColors.map(hex => {
            const rgb = hexToRgb(hex);
            return { r: rgb.r, g: rgb.g, b: rgb.b };
        });

        renderPalette(colors);
        showToast('🔄 Palette restored from history');
    }

    function clearHistory() {
        if (history.length === 0) return;
        if (confirm('Clear all saved palettes?')) {
            history = [];
            saveHistory();
            renderHistory();
            showToast('🗑️ History cleared');
        }
    }

    function copyAllColors() {
        if (currentPalette.length === 0) {
            showToast('⚠️ Generate a palette first!');
            return;
        }

        const hexes = currentPalette.map(c => rgbToHex(c.r, c.g, c.b));
        const text = hexes.join(' · ');
        copyToClipboard(text);
        showToast(`📋 Copied ${hexes.length} colors!`);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            console.warn('Copy failed:', e);
        }
        document.body.removeChild(textarea);
    }

    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    window.copyToClipboard = copyToClipboard;
    window.showToast = showToast;

    function generate() {
        const count = parseInt(colorCountSelect.value, 10);
        const mode = colorModeSelect.value;
        const colors = generatePalette(count, mode);
        renderPalette(colors);

        colorInfo.innerHTML = `
            ✨ Generated ${count} colors using <strong>${mode}</strong> mode. 
            Click any color to copy.
        `;
    }

    generateBtn.addEventListener('click', generate);
    copyAllBtn.addEventListener('click', copyAllColors);
    clearHistoryBtn.addEventListener('click', clearHistory);

    colorModeSelect.addEventListener('change', generate);
    colorCountSelect.addEventListener('change', generate);

    loadHistory();
    generate();
    renderHistory();

    console.log('🎨 Color Palette Generator loaded successfully!');
    console.log(`📜 ${history.length} palettes in history.`);

})();