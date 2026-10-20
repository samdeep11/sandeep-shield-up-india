let chain = JSON.parse(localStorage.getItem('shield_final_up_realtime') || '[]');
let walletId = "Public-Test-Wallet";
let qrScanner = null;
const GACS = "https://gacs.app/api/public";

if (chain.length === 0) {
  chain.push({
    type: "HUB_GENESIS",
    msg: "SANDEEP SHIELD - Real-Time Fraud Shield - Created by SANDEEP - UP, INDIA - Genesis Oct 17 2026 - Chain ID 98765 - 10 Chain Support",
    time: Date.now(),
    hash: "HUB-GENESIS-SANDEEP-SHIELD-98765-UP-INDIA",
    walletId: "OWNER-SANDEEP-UP-INDIA",
    qkey: "QKYB-UP-INDIA-LIVE",
    cat: "genesis",
    chainType: "GENESIS",
    fraud: false
  });
  localStorage.setItem('shield_final_up_realtime', JSON.stringify(chain));
}

function save() {
  localStorage.setItem('shield_final_up_realtime', JSON.stringify(chain));
  render();
}

function render() {
  document.getElementById('upiTx').innerText = chain.filter(c => c.cat === 'upi').length;
  document.getElementById('cryptoTx').innerText = chain.filter(c => c.cat === 'crypto').length;
  document.getElementById('socialTx').innerText = chain.filter(c => c.cat === 'social').length;
  document.getElementById('blocked').innerText = chain.filter(c => c.fraud).length;
  document.getElementById('wAddr').innerText = walletId;

  const g = chain.find(c => c.type === 'HUB_GENESIS');
  if (g) {
    document.getElementById('genesisClear').innerHTML =
      `<b style="color:#f9d678">⭐ HUB_GENESIS - UP, INDIA ⭐</b><br>
       <b>${g.msg}</b><br>
       <span style="color:#f9d678">Tx:</span> <b>${g.hash}</b><br>
       Owner: ${g.walletId}`;
  }

  let h = "";
  chain.slice().reverse().forEach(b => {
    if (b.type === 'HUB_GENESIS') return;

    let badgeClass = 'crypto';
    if (b.cat === 'upi') badgeClass = b.fraud ? 'fraud' : 'safe';
    if (b.cat === 'social') badgeClass = b.fraud ? 'fraud' : 'social';

    const ct = b.chainType || '';
    if (ct === 'ETH') badgeClass = 'crypto';
    if (ct === 'BSC') badgeClass = 'bsc';
    if (ct === 'POLY') badgeClass = 'poly';
    if (ct === 'BASE') badgeClass = 'base';
    if (ct === 'ARB') badgeClass = 'arb';
    if (ct === 'OP') badgeClass = 'op';
    if (ct === 'AVAX') badgeClass = 'avax';
    if (ct === 'SOL') badgeClass = 'sol';
    if (ct === 'BTC') badgeClass = 'btc';
    if (ct === 'TRON') badgeClass = 'tron';
    if (b.fraud) badgeClass = 'fraud';

    h += `<div style="border-bottom:1px solid #1e293b;padding:8px 0">
      <span class="badge live">SCANNED</span>
      <span class="badge ${badgeClass}">${(b.chainType || b.cat).toUpperCase()}</span>
      <b>${b.msg}</b><br>
      <small>Tx: ${b.hash} | QKey: ${b.qkey}</small>
    </div>`;
  });

  document.getElementById('ledger').innerHTML = h || "<small>Koi scan history nahi hai.</small>";
}

function connectWallet() {
  walletId = "0x" + Math.random().toString(16).slice(2, 8).toUpperCase() + "...SIM";
  render();
}

function shield(msg, fraud, extra = "") {
  return `<div style="padding:10px;border-radius:10px;background:${fraud ? '#ef444425' : '#22c55e25'};border:1px solid ${fraud ? '#ef4444' : '#22c55e'}">
    <b>${fraud ? '🚨 HIGH RISK' : '✅ NO KNOWN MATCH'}</b><br>
    ${msg}<br>${extra}
    <br><small>Scam intelligence by <a href="https://gacs.app" target="_blank" rel="noopener">GACS</a></small>
  </div>`;
}

function addLedger(cat, chainType, data, fraud, detail) {
  const hash = "TX-" + cat.toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-98765-UP";
  chain.push({
    data,
    fraud,
    cat,
    chainType,
    msg: `${fraud ? '🚨' : '✅'} ${chainType}: ${data.slice(0, 45)} | ${detail}`,
    time: Date.now(),
    hash,
    qkey: "QKYB-" + hash
  });
  save();
  return hash;
}

function getHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^@/, "");
  }
}

function detectCryptoChain(address) {
  const a = address.trim();

  if (/^0x[a-fA-F0-9]{40}$/.test(a)) return "EVM";
  if (/^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(a)) return "BTC";
  if (/^T[A-Za-z0-9]{33}$/.test(a)) return "TRON";
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) return "SOL";

  return "UNKNOWN";
}

async function scanUPI() {
  const d = document.getElementById('upiInp').value.trim();
  if (!d) return alert("UPI ID dalo!");

  document.getElementById('upiOut').innerHTML = "⏳ UPI risk signals check ho rahe hain...";

  const low = d.toLowerCase();
  const riskyWords = ["rbi", "gov", "official", "refund", "kyc", "lottery", "cashback", "verification"];
  const keywordHit = riskyWords.some(k => low.includes(k));
  const invalid = !/^[a-z0-9._-]+@[a-z]+$/i.test(d);

  const fraud = invalid || keywordHit;
  const reason = invalid
    ? "UPI format invalid lag raha hai"
    : keywordHit
      ? "High-risk keyword mila: RBI/gov/refund/KYC type claim"
      : "Koi known keyword risk nahi mila";

  const hash = addLedger('upi', 'UPI-RISK', d, fraud, reason);

  document.getElementById('upiOut').innerHTML = shield(
    `${d}<br>${reason}`,
    fraud,
    `Tx: ${hash}<br><b>Note:</b> Payment se pehle UPI app mein payee name zaroor verify karein.`
  );
}

async function scanCrypto() {
  const d = document.getElementById('cryptoInp').value.trim();
  if (!d) return alert("Wallet address dalo!");

  const detected = detectCryptoChain(d);

  if (detected === "UNKNOWN") {
    document.getElementById('cryptoOut').innerHTML = shield(
      "Address format valid nahi lag raha. ETH/BSC/Polygon/Base/Arbitrum/Optimism/Avalanche, BTC, SOL ya TRON address paste karein.",
      true
    );
    return;
  }

  let selected = document.getElementById('chainSel').value;

  if (detected === "EVM") {
    if (!["ETH", "BSC", "POLY", "BASE", "ARB", "OP", "AVAX"].includes(selected)) {
      selected = "ETH";
      document.getElementById('chainSel').value = "ETH";
    }
  }
  if (detected === "BTC") selected = "BTC";
  if (detected === "TRON") selected = "TRON";
  if (detected === "SOL") selected = "SOL";

  document.getElementById('chainSel').value = selected;
  document.getElementById('cryptoOut').innerHTML = `⏳ ${selected} wallet ko GACS blocklist se check kiya ja raha hai...`;

  let fraud = false;
  let detail = "GACS wallet blocklist mein match nahi mila";
  let report = "";

  try {
    const res = await fetch(`${GACS}/wallets.csv?_=${Date.now()}`);
    const csv = await res.text();
    const hit = csv.split("
").find(line => line.toLowerCase().includes(d.toLowerCase()));

    if (hit) {
      fraud = true;
      const parts = hit.split(",");
      detail = `GACS blocklist match: ${parts[1] || "Unknown chain"} | ${parts[2] || "Scam"}`;
      report = parts[3] || "";
    }
  } catch {
    detail = "GACS blocklist temporarily unavailable. Manual verification karein.";
  }

  const hash = addLedger('crypto', selected + '-WALLET', d, fraud, detail);

  document.getElementById('cryptoOut').innerHTML = shield(
    `${d.slice(0, 24)}...<br>${detail}`,
    fraud,
    `${report ? `<a href="${report}" target="_blank" rel="noopener">GACS report dekhein</a><br>` : ""}Tx: ${hash}`
  );
}

async function scanSocial() {
  const d = document.getElementById('socialInp').value.trim();
  if (!d) return alert("Social link, handle ya website URL dalo!");

  document.getElementById('socialOut').innerHTML = "⏳ Social handle / link check ho raha hai...";

  let platform = "twitter";
  let handle = d.replace(/^@/, "");

  if (d.includes("t.me") || d.toLowerCase().includes("telegram")) {
    platform = "telegram";
    handle = d.split("/").filter(Boolean).pop();
  } else if (d.includes("instagram")) {
    platform = "instagram";
    handle = d.split("/").filter(Boolean).pop();
  } else if (d.includes("x.com") || d.includes("twitter")) {
    platform = "twitter";
    handle = d.split("/").filter(Boolean).pop();
  } else if (d.includes("youtube")) {
    platform = "youtube";
    handle = d.split("/").filter(Boolean).pop();
  }

  let fraud = false;
  let detail = "GACS social scan se koi red flag nahi mila";
  let report = "";

  try {
    const res = await fetch(`${GACS}/social-scan?handle=${encodeURIComponent(handle)}&platform=${platform}`);
    const j = await res.json();

    if (j.found) {
      fraud = j.verdict === "red" || (j.risk_score || 0) >= 60;
      detail = `GACS verdict: ${j.verdict} | Risk score: ${j.risk_score ?? "N/A"} | ${j.headline || ""}`;
      report = j.report_url || "";
    } else {
      detail = "GACS database mein is handle ka record nahi mila";
    }
  } catch {
    detail = "GACS social scan temporarily unavailable. Link kholne se pehle manual verification karein.";
  }

  const hash = addLedger('social', platform.toUpperCase(), d, fraud, detail);

  document.getElementById('socialOut').innerHTML = shield(
    `${d}<br>${detail}`,
    fraud,
    `${report ? `<a href="${report}" target="_blank" rel="noopener">GACS report dekhein</a><br>` : ""}Tx: ${hash}`
  );
}

function detectQRType(text) {
  const t = text.trim().toLowerCase();

  if (t.startsWith("upi://")) return "upi";
  if (/^[a-z0-9._-]+@[a-z]+$/i.test(text.trim())) return "upi";
  if (detectCryptoChain(text.trim()) !== "UNKNOWN") return "crypto";
  if (/^(https?://|www.)/i.test(text.trim())) return "link";

  return "unknown";
}

function extractUPI(text) {
  try {
    const url = new URL(text);
    const pa = url.searchParams.get("pa");
    if (pa) return pa;
  } catch {}
  return text.trim();
}

async function handleQR(text) {
  const type = detectQRType(text);
  let label = "";
  let output = "";

  if (type === "upi") {
    const upi = extractUPI(text);
    document.getElementById('upiInp').value = upi;
    await scanUPI();
    label = "UPI QR";
    output = document.getElementById('upiOut').innerHTML;
  }

  else if (type === "crypto") {
    document.getElementById('cryptoInp').value = text.trim();
    await scanCrypto();

    const selected = document.getElementById('chainSel').value;
    label = selected + " Wallet QR";
    output = document.getElementById('cryptoOut').innerHTML;
  }

  else if (type === "link") {
    let url = text.trim();
    if (!/^https?:///i.test(url)) url = "https://" + url;

    const low = getHost(url).toLowerCase();
    const suspicious = [
      "telegram", "whatsapp", "giveaway", "double", "elon",
      "refund", "kyc", "lottery", "free-crypto", "airdrop"
    ].some(k => low.includes(k));

    const hash = addLedger('social', 'QR-LINK', url, suspicious,
      suspicious ? "Suspicious QR link pattern detected" : "QR link scanned; domain-level risk check recommended");

    output = shield(
      `${url}<br>${suspicious ? "QR link suspicious pattern detect hua" : "QR link scan ho gaya; link kholne se pehle scanner use karein"}`,
      suspicious,
      `Tx: ${hash}`
    );

    label = "Website / Link QR";
  }

  else {
    output = shield(
      `QR content samajh nahi aaya:<br><b>${text.slice(0, 120)}</b>`,
      true,
      "Manual review karein. Unknown QR par click ya payment na karein."
    );
    label = "Unknown QR";
  }

  document.getElementById('qrOut').innerHTML = `
    <div style="background:#1e293b;border-radius:10px;padding:10px;margin-bottom:8px">
      <b style="color:#f59e0b">📷 ${label} detected</b><br>
      <small style="word-break:break-all">${text.slice(0, 200)}</small>
    </div>
    ${output}
  `;
}

async function startQR() {
  stopQR();
  qrScanner = new Html5Qrcode("qrReader");

  try {
    await qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      decodedText => {
        stopQR();
        handleQR(decodedText);
      },
      () => {}
    );
    document.getElementById('qrOut').innerHTML = "⏳ Camera active hai — QR code camera ke saamne rakhein...";
  } catch {
    document.getElementById('qrOut').innerHTML = shield(
      "Camera access nahi mila. Browser permission allow karein ya gallery se QR image upload karein.",
      true
    );
  }
}

function stopQR() {
  if (qrScanner) {
    qrScanner.stop()
      .then(() => {
        qrScanner.clear();
        qrScanner = null;
      })
      .catch(() => {
        qrScanner = null;
      });
  }
}

async function scanQRImage(file) {
  if (!file) return;
  stopQR();

  const tempScanner = new Html5Qrcode("qrReader");

  try {
    const text = await tempScanner.scanFile(file, true);
    tempScanner.clear();
    handleQR(text);
  } catch {
    tempScanner.clear();
    document.getElementById('qrOut').innerHTML = shield(
      "QR image read nahi ho payi. Clear photo upload karein.",
      true
    );
  }
}

render();