require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const favicon = require('serve-favicon');

const app = express();

app.set('trust proxy', true);

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '256kb' }));

const publicDir = path.join(__dirname, 'public');

try {
    app.use(favicon(path.join(publicDir, 'favicon.svg')));
} catch (err) {
    // Fallback if favicon file is missing
}

app.use(
    express.static(publicDir, {
        etag: true,
        lastModified: true,
        maxAge: '7d',
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        },
    })
);

// --- Simple Basic Auth middleware for admin ---
function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm="Admin", charset="UTF-8"');
    return res.status(401).send('Authentication required');
}

function requireAdmin(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Basic ')) return unauthorized(res);
        const base64 = header.slice(6);
        const decoded = Buffer.from(base64, 'base64').toString('utf8');
        const idx = decoded.indexOf(':');
        if (idx === -1) return unauthorized(res);
        const user = decoded.slice(0, idx);
        const pass = decoded.slice(idx + 1);
        const expectedUser = process.env.ADMIN_USER || 'admin';
        const expectedPass = process.env.ADMIN_PASSWORD;
        if (!expectedPass) {
            // Fail closed if password is not set
            return res.status(500).send('Admin password not configured');
        }
        if (user === expectedUser && pass === expectedPass) return next();
        return unauthorized(res);
    } catch (_e) {
        return unauthorized(res);
    }
}

// --- Admin UI (served from separate file) ---
app.get('/admin', requireAdmin, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// --- i18n API ---
const i18nDir = path.join(publicDir, 'i18n');
const allowedLangs = new Set(['en', 'tr']);

app.get('/api/i18n/:lang', requireAdmin, (req, res) => {
    const { lang } = req.params;
    if (!allowedLangs.has(lang)) return res.status(400).json({ error: 'Unsupported language' });
    const filePath = path.join(i18nDir, `${lang}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read file' });
        try {
            const json = JSON.parse(data);
            res.json(json);
        } catch (_e) {
            res.status(500).json({ error: 'Invalid JSON on disk' });
        }
    });
});

app.put('/api/i18n/:lang', requireAdmin, (req, res) => {
    const { lang } = req.params;
    if (!allowedLangs.has(lang)) return res.status(400).json({ error: 'Unsupported language' });
    const body = req.body;
    if (typeof body !== 'object' || body === null) return res.status(400).json({ error: 'Body must be JSON' });
    const filePath = path.join(i18nDir, `${lang}.json`);
    const content = JSON.stringify(body, null, 2) + '\n';
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) return res.status(500).json({ error: 'Failed to write file' });
        res.json({ ok: true });
    });
});

app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
    /* eslint-disable no-console */
    console.log(`Skylab AI landing running on http://${host}:${port}`);
});


