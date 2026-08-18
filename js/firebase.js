// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyBxc-JFWwxlauY6U4A3IKTxxd5UFiDzjhI",
  authDomain: "recofatima-ferramenta.firebaseapp.com",
  projectId: "recofatima-ferramenta",
  storageBucket: "recofatima-ferramenta.firebasestorage.app",
  messagingSenderId: "561979864363",
  appId: "1:561979864363:web:4577c584f4802261c0016e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== AUTH =====
function register(email, password, name, surname) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection('birdcut_users').doc(cred.user.uid).set({
        name, surname, email,
        phone: '', birthday: '', addresses: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
}

function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function logout() {
  return auth.signOut();
}

function onAuthChange(cb) {
  return auth.onAuthStateChanged(cb);
}

// ===== USER DATA =====
function getUserProfile(uid) {
  return db.collection('birdcut_users').doc(uid).get()
    .then(doc => doc.exists ? doc.data() : null);
}

function updateUserProfile(uid, data) {
  return db.collection('birdcut_users').doc(uid).update(data);
}

// ===== ORDERS =====
function createOrder(orderData) {
  return db.collection('birdcut_orders').add({
    ...orderData,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function getUserOrders(uid) {
  return db.collection('birdcut_orders')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })));
}

function getOrder(orderId) {
  return db.collection('birdcut_orders').doc(orderId).get()
    .then(doc => doc.exists ? { id: doc.id, ...doc.data() } : null);
}
