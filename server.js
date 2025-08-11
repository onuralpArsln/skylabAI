const path = require('path');
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


