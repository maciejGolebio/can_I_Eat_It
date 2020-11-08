import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// TODO during migration to docker move url to env
const URL = 'https://world.openfoodfacts.org/allergens.json' 
const PORT = 3000

const app = express();

// Proxy endpoint
app.use('/allergens/all', createProxyMiddleware({
    target: URL,
    changeOrigin: true,
 }));

app.listen(PORT, () => console.log(`APP listen on PORT ${PORT}`));