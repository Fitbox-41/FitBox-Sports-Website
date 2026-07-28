import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ArrowLeft,
  Download, Printer,
} from 'lucide-react';
import './WalletPage.css';

const POINT_VALUE_INR = 0.1;

export default function WalletPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | credit | debit

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('fitbox_token');
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${apiUrl}/api/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setBalance(res.data.balance);
          setTransactions(res.data.transactions || []);
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [currentUser, navigate]);

  const shown = transactions.filter((t) => filter === 'all' || t.type === filter);

  const fmtDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const prettySource = (s) => (s || '').replace(/_/g, ' ');

  // Export to CSV (opens in Excel/Sheets) — no library needed.
  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Source', 'Type', 'Points', 'Balance After'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = shown.map((t) => [
      fmtDate(t.createdAt),
      t.description || prettySource(t.source),
      prettySource(t.source),
      t.type,
      `${t.type === 'credit' ? '+' : '-'}${t.amount}`,
      t.balanceAfter ?? '',
    ].map(esc).join(','));
    const csv = [headers.map(esc).join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitbox-wallet-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print / Save as PDF — uses the browser's print dialog (no library needed).
  const printPDF = () => window.print();

  return (
    <div className="wallet-page">
      <Header hideSubHeader={true} />
      <div className="header-spacer" style={{ height: '111px' }} />

      <main className="wallet-main container">
        <button className="wallet-back" onClick={() => navigate('/account')}>
          <ArrowLeft size={16} /> Back to Account
        </button>

        <div className="wallet-head">
          <h1><WalletIcon size={26} /> FitBox Wallet</h1>
          <div className="wallet-actions no-print">
            <button onClick={exportCSV} disabled={!shown.length}>
              <Download size={16} /> Export CSV
            </button>
            <button onClick={printPDF} disabled={!shown.length}>
              <Printer size={16} /> Save as PDF
            </button>
          </div>
        </div>

        <div className="wallet-balance-card">
          <span className="wbc-label">Available Reward Points</span>
          <span className="wbc-amount">{balance}</span>
          <span className="wbc-sub">
            ≈ ₹{(balance * POINT_VALUE_INR).toFixed(2)} · 1 point = ₹{POINT_VALUE_INR.toFixed(2)} · redeemable up to 50% of an order
          </span>
        </div>

        <div className="wallet-tx-head">
          <h2>Transaction History</h2>
          <div className="wallet-filter no-print">
            {['all', 'credit', 'debit'].map((f) => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'credit' ? 'Earned' : 'Spent'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="wallet-empty">Loading transactions…</p>
        ) : shown.length === 0 ? (
          <p className="wallet-empty">No transactions yet.</p>
        ) : (
          <div className="wallet-table-wrap">
            <table className="wallet-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="right">Points</th>
                  <th className="right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t, i) => (
                  <tr key={t._id || i}>
                    <td className="wt-date">{fmtDate(t.createdAt)}</td>
                    <td>
                      <span className="wt-desc">{t.description || prettySource(t.source)}</span>
                      <span className="wt-source">{prettySource(t.source)}</span>
                    </td>
                    <td>
                      <span className={`wt-badge ${t.type}`}>
                        {t.type === 'credit'
                          ? <><ArrowDownLeft size={13} /> Earned</>
                          : <><ArrowUpRight size={13} /> Spent</>}
                      </span>
                    </td>
                    <td className={`right wt-amount ${t.type}`}>
                      {t.type === 'credit' ? '+' : '-'}{t.amount}
                    </td>
                    <td className="right wt-balance">{t.balanceAfter ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
