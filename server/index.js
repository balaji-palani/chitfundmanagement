const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/auth');
const requireAdmin = require('./middleware/authorize');

app.use('/api/auth', authRoutes);

// Protect all API routes that modify data (POST, PUT, DELETE)
// For simplicity, we apply it to specific routes or globally for non-GET
// app.use('/api/members', authenticateToken); // Example protection


// --- MEMBERS ---

// Get all members
app.get('/api/members', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM members ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get member payment history
app.get('/api/members/:id/payments', authenticateToken, async (req, res) => {
    const member_id = req.params.id;
    try {
        const sql = `
            SELECT 
                c.name as chit_name,
                c.total_amount,
                c.commission_percent,
                cc.id as cycle_id,
                cc.month_year,
                cc.month_number,
                cc.bid_amount,
                cp.status,
                cp.paid_date,
                (SELECT COUNT(*) FROM chit_members WHERE chit_id = c.id)::int as member_count
            FROM chit_cycles cc
            JOIN chits c ON cc.chit_id = c.id
            JOIN chit_members cm ON c.id = cm.chit_id
            LEFT JOIN cycle_payments cp ON cc.id = cp.cycle_id AND cp.member_id = $1
            WHERE cm.member_id = $1
            ORDER BY cc.month_number DESC, c.name
        `;

        const result = await db.query(sql, [member_id]);

        const history = result.rows.map(row => {
            const commission = row.total_amount * (row.commission_percent / 100);
            const dividendPool = row.bid_amount - commission;
            const dividendPerMember = row.member_count > 0 ? dividendPool / row.member_count : 0;
            const payable = (row.total_amount / row.member_count) - dividendPerMember;

            return {
                chit_name: row.chit_name,
                month_year: row.month_year,
                payable_amount: Math.round(payable),
                status: row.status || 'pending',
                paid_date: row.paid_date,
                total_amount: row.total_amount,
                bid_amount: row.bid_amount
            };
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add member
app.post('/api/members', authenticateToken, requireAdmin, async (req, res) => {
    const { name, contact, notes } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO members (name, contact, notes) VALUES ($1, $2, $3) RETURNING id',
            [name, contact, notes]
        );
        res.json({ id: result.rows[0].id, name, contact, notes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CHITS ---

// Get all chits
app.get('/api/chits', async (req, res) => {
    try {
        const sql = `
      SELECT c.*, (SELECT COUNT(*) FROM chit_members WHERE chit_id = c.id)::int as member_count 
      FROM chits c
    `;
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create chit
app.post('/api/chits', authenticateToken, requireAdmin, async (req, res) => {
    const { name, total_amount, start_date, duration_months, commission_percent } = req.body;
    const commission = commission_percent || 5.0;
    try {
        const result = await db.query(
            'INSERT INTO chits (name, total_amount, start_date, duration_months, commission_percent) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, total_amount, start_date, duration_months, commission]
        );
        res.json({ id: result.rows[0].id, name, total_amount, start_date, duration_months, commission_percent: commission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add member to chit
app.post('/api/chits/:id/members', authenticateToken, requireAdmin, async (req, res) => {
    const { member_id } = req.body;
    const chit_id = req.params.id;
    try {
        // Check if limit reached
        const chitRes = await db.query('SELECT duration_months FROM chits WHERE id = $1', [chit_id]);
        if (chitRes.rows.length === 0) {
            return res.status(404).json({ error: 'Chit not found' });
        }
        const duration = chitRes.rows[0].duration_months;

        const countRes = await db.query('SELECT COUNT(*) FROM chit_members WHERE chit_id = $1', [chit_id]);
        const currentCount = parseInt(countRes.rows[0].count);

        if (currentCount >= duration) {
            return res.status(400).json({ error: `Chit member limit reached (${duration} members max)` });
        }

        await db.query(
            'INSERT INTO chit_members (chit_id, member_id) VALUES ($1, $2)',
            [chit_id, member_id]
        );
        res.json({ message: 'Member added to chit' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get members of a chit
app.get('/api/chits/:id/members', async (req, res) => {
    try {
        const sql = `
      SELECT m.* FROM members m
      JOIN chit_members cm ON m.id = cm.member_id
      WHERE cm.chit_id = $1
    `;
        const result = await db.query(sql, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CYCLES ---

// Record a cycle
app.post('/api/chits/:id/cycles', authenticateToken, requireAdmin, async (req, res) => {
    const { month_number, month_year, bid_amount, winner_member_id } = req.body;
    const chit_id = req.params.id;
    try {
        const result = await db.query(
            'INSERT INTO chit_cycles (chit_id, month_number, month_year, bid_amount, winner_member_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [chit_id, month_number, month_year, bid_amount, winner_member_id]
        );
        res.json({ id: result.rows[0].id, chit_id, month_number, month_year, bid_amount, winner_member_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get cycles for a chit
app.get('/api/chits/:id/cycles', async (req, res) => {
    try {
        const sql = 'SELECT * FROM chit_cycles WHERE chit_id = $1 ORDER BY month_number';
        const result = await db.query(sql, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PAYMENTS ---

// Get payments for a cycle
app.get('/api/cycles/:id/payments', async (req, res) => {
    try {
        const sql = `
      SELECT cp.*, m.name as member_name 
      FROM cycle_payments cp
      JOIN members m ON cp.member_id = m.id
      WHERE cp.cycle_id = $1
    `;
        const result = await db.query(sql, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update payment status
app.post('/api/cycles/:id/payments', authenticateToken, requireAdmin, async (req, res) => {
    const { member_id, status } = req.body;
    const cycle_id = req.params.id;
    const paid_date = status === 'paid' ? new Date().toISOString() : null;

    try {
        const sql = `
      INSERT INTO cycle_payments (cycle_id, member_id, status, paid_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(cycle_id, member_id) 
      DO UPDATE SET status = EXCLUDED.status, paid_date = EXCLUDED.paid_date
    `;
        await db.query(sql, [cycle_id, member_id, status, paid_date]);
        res.json({ message: 'Payment updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUMMARY ---
app.get('/api/summary', async (req, res) => {
    const { month_year } = req.query;
    try {
        const sql = `
      SELECT 
        c.name as chit_name, 
        c.total_amount, 
        c.commission_percent,
        cc.bid_amount, 
        cc.winner_member_id,
        (SELECT COUNT(*) FROM chit_members WHERE chit_id = c.id)::int as member_count
      FROM chit_cycles cc
      JOIN chits c ON cc.chit_id = c.id
      WHERE cc.month_year = $1
    `;

        const result = await db.query(sql, [month_year]);

        const summary = result.rows.map(row => {
            const commission = row.total_amount * (row.commission_percent / 100);
            const dividend_pool = row.bid_amount - commission;

            return {
                ...row,
                commission_amount: commission,
                dividend_pool
            };
        });

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD ---
// Get current month payment status
app.get('/api/dashboard/current-month-status', async (req, res) => {
    try {
        // Get current month/year
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        const sql = `
            SELECT 
                c.id as chit_id,
                c.name as chit_name,
                cc.id as cycle_id,
                cc.month_year,
                (SELECT COUNT(*) FROM chit_members WHERE chit_id = c.id)::int as total_members,
                (SELECT COUNT(*) FROM cycle_payments 
                 WHERE cycle_id = cc.id AND status = 'paid')::int as paid_count
            FROM chit_cycles cc
            JOIN chits c ON cc.chit_id = c.id
            WHERE cc.month_year = $1 AND c.status = 'active'
            ORDER BY c.name
        `;

        const result = await db.query(sql, [currentMonthYear]);

        const status = result.rows.map(row => ({
            ...row,
            pending_count: row.total_members - row.paid_count
        }));

        res.json({
            current_month: currentMonthYear,
            chits: status
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- STATS ---
app.get('/api/stats', async (req, res) => {
    const stats = {};
    try {
        const activeChits = await db.query('SELECT COUNT(*) as count FROM chits WHERE status = \'active\'');
        stats.activeChits = parseInt(activeChits.rows[0].count);

        const totalMembers = await db.query('SELECT COUNT(*) as count FROM members');
        stats.totalMembers = parseInt(totalMembers.rows[0].count);

        const totalCollection = await db.query('SELECT SUM(bid_amount) as total FROM chit_cycles');
        stats.totalCollection = parseInt(totalCollection.rows[0].total || 0);

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
