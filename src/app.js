import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(cors());
app.use(express.json());


// Load sample data synchronously for Phase 1 (dummy)
const samplePath = path.join(__dirname, 'data', 'recipes.sample.json');
const SAMPLE_RECIPES = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));


// Utilities: paginate + basic filter
function paginate(array, page = 1, limit = 10) {
const p = Math.max(parseInt(page) || 1, 1);
const l = Math.max(parseInt(limit) || 10, 1);
const start = (p - 1) * l;
return {
page: p,
limit: l,
total: array.length,
results: array.slice(start, start + l)
};
}


function filterRecipes(list, { cuisine, maxTime, ingredients }) {
let out = [...list];
if (cuisine) {
out = out.filter(r => r.cuisine?.toLowerCase() === String(cuisine).toLowerCase());
}
if (maxTime) {
const mt = parseInt(maxTime);
if (!isNaN(mt)) out = out.filter(r => (r.cookTime || 0) <= mt);
}
if (ingredients) {
const wanted = String(ingredients)
.split(',')
.map(s => s.trim().toLowerCase())
.filter(Boolean);
if (wanted.length) {
out = out.filter(r => {
const have = (r.ingredients || []).map(i => i.toLowerCase());
return wanted.every(w => have.includes(w));
});
}
}
return out;
}


// Health
app.get('/api/health', (req, res) => {
res.json({ ok: true, service: 'recipe-finder', timestamp: new Date().toISOString() });
});


// List/Search with pagination + filters
app.get('/api/recipes', (req, res) => {
const { page, limit, cuisine, maxTime, ingredients } = req.query;
const filtered = filterRecipes(SAMPLE_RECIPES, { cuisine, maxTime, ingredients });
});