"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const chapters_1 = __importDefault(require("./routes/chapters"));
const choices_1 = __importDefault(require("./routes/choices"));
const sketches_1 = __importDefault(require("./routes/sketches"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://reversion-ladder-wnp6.vercel.app'
    ]
}));
app.use(express_1.default.json());
// Initialize Supabase client
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
// Routes
app.use('/api/chapters', chapters_1.default);
app.use('/api/choices', choices_1.default);
app.use('/api/sketches', sketches_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🚀 Reversion Ladder API running on port ${PORT}`);
});
