// Area materiali dei volumi — Banca dati Mastro
// Registrazione con verifica email (Firebase Authentication) e accesso ai materiali con il codice del volume (Firestore).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, updateProfile, signOut, reload } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyDm7Gvm0X9jogy7mSA3hYj39PQPxhs7Fz4",
  authDomain: "bancadatimastro.firebaseapp.com",
  projectId: "bancadatimastro",
  storageBucket: "bancadatimastro.firebasestorage.app",
  messagingSenderId: "14673554290",
  appId: "1:14673554290:web:861823b53f840d0778cbeb"
});
const auth = getAuth(app); auth.languageCode = "it";
const db = getFirestore(app);

const root = document.getElementById("area");
const VOL = root.dataset.volume;
const $ = (s) => root.querySelector(s);
const views = ["v-carica", "v-entra", "v-verifica", "v-codice", "v-file"];
function show(id) { views.forEach(v => { const el = document.getElementById(v); if (el) el.hidden = v !== id; }); }
function msg(el, text, kind) { el.textContent = text || ""; el.dataset.kind = kind || ""; }
function busy(btn, on) { btn.disabled = on; btn.setAttribute("aria-busy", on ? "true" : "false"); }
const KEY = "bdm-codice-" + VOL;
const store = { get(){ try { return localStorage.getItem(KEY); } catch { return null; } }, set(v){ try { localStorage.setItem(KEY, v); } catch {} } };

const errori = {
  "auth/email-already-in-use": "Questa email è già registrata: usa «Accedi».",
  "auth/invalid-email": "L'indirizzo email non è valido.",
  "auth/weak-password": "La password deve avere almeno 8 caratteri.",
  "auth/invalid-credential": "Email o password non corretti.",
  "auth/wrong-password": "Email o password non corretti.",
  "auth/user-not-found": "Non esiste un account con questa email: registrati.",
  "auth/too-many-requests": "Troppi tentativi. Riprova tra qualche minuto.",
  "auth/network-request-failed": "Connessione assente. Controlla la rete e riprova."
};
const testoErrore = (e) => errori[e && e.code] || "Si è verificato un problema. Riprova.";
const ritorno = () => ({ url: location.origin + location.pathname });

// Schede Registrati / Accedi
root.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
  root.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
  $("#f-registra").hidden = b.dataset.tab !== "registra";
  $("#f-accedi").hidden = b.dataset.tab !== "accedi";
}));

$("#f-registra").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target, out = $("#m-registra"), btn = f.querySelector("button[type=submit]");
  if (f.password.value.length < 8) return msg(out, "La password deve avere almeno 8 caratteri.", "err");
  if (f.password.value !== f.password2.value) return msg(out, "Le due password non coincidono.", "err");
  if (!f.privacy.checked) return msg(out, "Per registrarti devi accettare l'informativa sulla privacy.", "err");
  busy(btn, true); msg(out, "Registrazione in corso…");
  try {
    const cred = await createUserWithEmailAndPassword(auth, f.email.value.trim(), f.password.value);
    const nome = f.nome.value.trim(), cognome = f.cognome.value.trim();
    await updateProfile(cred.user, { displayName: nome + " " + cognome });
    await setDoc(doc(db, "utenti", cred.user.uid), {
      nome, cognome, email: cred.user.email, volumeIniziale: VOL,
      privacyAccettata: true, newsletter: !!f.newsletter.checked, registratoIl: serverTimestamp()
    });
    await sendEmailVerification(cred.user, ritorno());
    mostraUtente(cred.user);
  } catch (err) { msg(out, testoErrore(err), "err"); }
  busy(btn, false);
});

$("#f-accedi").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target, out = $("#m-accedi"), btn = f.querySelector("button[type=submit]");
  busy(btn, true); msg(out, "Accesso in corso…");
  try { await signInWithEmailAndPassword(auth, f.email.value.trim(), f.password.value); msg(out, ""); }
  catch (err) { msg(out, testoErrore(err), "err"); }
  busy(btn, false);
});

$("#b-reset").addEventListener("click", async () => {
  const f = $("#f-accedi"), out = $("#m-accedi");
  if (!f.email.value.trim()) return msg(out, "Scrivi la tua email qui sopra, poi premi di nuovo «Password dimenticata».", "err");
  try { await sendPasswordResetEmail(auth, f.email.value.trim(), ritorno()); msg(out, "Ti abbiamo inviato un'email per scegliere una nuova password.", "ok"); }
  catch (err) { msg(out, testoErrore(err), "err"); }
});

$("#b-reinvia").addEventListener("click", async (e) => {
  const out = $("#m-verifica"); busy(e.target, true);
  try { await sendEmailVerification(auth.currentUser, ritorno()); msg(out, "Email inviata di nuovo. Controlla anche la posta indesiderata.", "ok"); }
  catch (err) { msg(out, testoErrore(err), "err"); }
  busy(e.target, false);
});
$("#b-confermato").addEventListener("click", async () => {
  await reload(auth.currentUser);
  if (auth.currentUser.emailVerified) { await auth.currentUser.getIdToken(true); mostraUtente(auth.currentUser); }
  else msg($("#m-verifica"), "L'email non risulta ancora confermata. Apri il link che ti abbiamo inviato, poi riprova.", "err");
});
root.querySelectorAll("[data-esci]").forEach(b => b.addEventListener("click", () => signOut(auth)));

async function apri(codice, out) {
  const c = codice.trim().toUpperCase().replace(/\s+/g, "");
  if (!c) return false;
  try {
    const snap = await getDoc(doc(db, "accessi", VOL + "__" + c));
    if (!snap.exists()) { msg(out, "Codice non valido per questo volume. Controlla di averlo scritto come nel libro.", "err"); return false; }
    store.set(c);
    try { await setDoc(doc(db, "utenti", auth.currentUser.uid), { volumi: { [VOL]: serverTimestamp() } }, { merge: true }); } catch {}
    mostraFile(snap.data()); return true;
  } catch (err) { msg(out, "Codice non valido o accesso non consentito.", "err"); return false; }
}
$("#f-codice").addEventListener("submit", async (e) => {
  e.preventDefault(); const btn = e.target.querySelector("button[type=submit]"); busy(btn, true);
  await apri(e.target.codice.value, $("#m-codice")); busy(btn, false);
});

function mostraFile(dati) {
  const ul = $("#lista-file"); ul.textContent = "";
  const files = (dati && dati.files) || [];
  if (!files.length) { $("#nessun-file").hidden = false; }
  else {
    $("#nessun-file").hidden = true;
    files.forEach(f => {
      const li = document.createElement("li"); const a = document.createElement("a");
      a.href = f.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = f.nome || "File";
      li.appendChild(a); if (f.descrizione) { const p = document.createElement("span"); p.textContent = f.descrizione; li.appendChild(p); }
      ul.appendChild(li);
    });
  }
  show("v-file");
}

async function mostraUtente(user) {
  root.querySelectorAll("[data-utente]").forEach(el => el.textContent = user.email);
  if (!user.emailVerified) { show("v-verifica"); return; }
  const salvato = store.get();
  if (salvato && await apri(salvato, $("#m-codice"))) return;
  show("v-codice");
}
onAuthStateChanged(auth, (user) => { if (user) mostraUtente(user); else show("v-entra"); });
