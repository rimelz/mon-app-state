# COMPTE RENDU - TP SÉANCE 6
## MERN Stack : État Global (useContext & Redux Toolkit)

---

**Étudiant** : RIMELZ  
**Cours** : MERN Stack - Séance 6  
**Enseignant** : Dr. Abdelweheb GUEDDES  
**Institution** : École Polytechnique de Sousse  
**Année Académique** : 2026-2027  
**Date** : 24 Novembre 2026

---

## 📋 TABLE DES MATIÈRES

1. [Objectifs du TP](#objectifs)
2. [Prérequis et Configuration](#prerequis)
3. [Architecture du Projet](#architecture)
4. [Implémentation Partie 1 : useContext](#partie1)
5. [Implémentation Partie 2 : Redux Toolkit](#partie2)
6. [Tests et Vérifications](#tests)
7. [Résultats Obtenus](#resultats)
8. [Difficultés Rencontrées](#difficultes)
9. [Conclusion](#conclusion)

---

<a name="objectifs"></a>
## 1. OBJECTIFS DU TP

Ce TP avait pour objectifs de :

✅ **Comprendre le problème du Prop Drilling** et ses solutions  
✅ **Maîtriser l'API useContext** pour les préférences globales légères  
✅ **Implémenter Redux Toolkit (RTK)** pour l'état métier complexe  
✅ **Différencier les cas d'usage** : Context vs Redux  
✅ **Utiliser useSelector et useDispatch** pour la réactivité ciblée  
✅ **Comprendre l'immutabilité** avec Immer

---

<a name="prerequis"></a>
## 2. PRÉREQUIS ET CONFIGURATION

### 2.1 Technologies Utilisées

| Technologie | Version | Rôle |
|------------|---------|------|
| Node.js | 20+ | Runtime JavaScript |
| React | 19.3.1 | Bibliothèque UI |
| Vite | 8.3.4 | Build tool rapide |
| Redux Toolkit | 2.14.0 | Gestion d'état Redux |
| React-Redux | 9.3.1 | Bindings React pour Redux |

### 2.2 Installation du Projet

```bash
# Cloner le repository
git clone https://github.com/rimelz/mon-compteur-react.git
cd mon-app-state

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

**URL de développement** : http://localhost:5173

---

<a name="architecture"></a>
## 3. ARCHITECTURE DU PROJET

### 3.1 Structure des Dossiers

```
mon-app-state/
├── src/
│   ├── components/
│   │   ├── Cart.jsx              ← Panier Redux avec useSelector
│   │   ├── Navbar.jsx            ← Barre de navigation (Context + Redux)
│   │   └── ProductList.jsx       ← Catalogue avec useDispatch
│   ├── context/
│   │   └── ThemeContext.jsx      ← Provider de thème avec localStorage
│   ├── data/
│   │   └── products.js           ← Catalogue de 4 produits
│   ├── redux/
│   │   ├── cartSlice.js          ← Slice Redux (actions + reducers)
│   │   └── store.js              ← Store Redux configuré
│   ├── App.jsx                   ← Composant racine
│   ├── main.jsx                  ← Point d'entrée avec Providers
│   └── index.css                 ← Styles globaux (fourni)
├── package.json
└── README.md
```

### 3.2 Flux de Données

#### **useContext (Thème)**
```
localStorage → ThemeProvider (useState) → useTheme() → Navbar
                      ↓
              toggleTheme() → setTheme → localStorage.setItem
```

#### **Redux Toolkit (Panier)**
```
ProductList → dispatch(addItem) → cartSlice.reducer (Immer)
                                        ↓
                                    Store Central
                                        ↓
                        Navbar/Cart ← useSelector(state.cart)
```

---

<a name="partie1"></a>
## 4. IMPLÉMENTATION PARTIE 1 : useContext

### 4.1 Création du ThemeContext (src/context/ThemeContext.jsx)

**Étapes suivies conformément à l'énoncé :**

#### **Étape 1 : Déclaration du Contexte**
```javascript
export const ThemeContext = createContext(null);
```

#### **Étape 2 : Création du Provider**
```javascript
export function ThemeProvider({ children }) {
  // 1. État interne du thème (persiste dans localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // 2. Fonction de modification partagée
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. Diffusion
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### **Étape 3 : Hook Personnalisé useTheme()**
```javascript
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit etre utilise a l\'interieur d\'un <ThemeProvider>');
  }
  return context;
}
```

### 4.2 Branchement du Provider (src/main.jsx)

```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
```

### 4.3 Consommation dans App.jsx

```javascript
export default function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <Navbar />
      <main className="page">
        <ProductList />
        <Cart />
      </main>
    </div>
  );
}
```

**✅ Résultat** : Le thème bascule entre clair et sombre, persiste après F5, sans aucun prop drilling.

---

<a name="partie2"></a>
## 5. IMPLÉMENTATION PARTIE 2 : Redux Toolkit

### 5.1 Création du cartSlice (src/redux/cartSlice.js)

**État Initial :**
```javascript
const initialState = {
  items: [],
  totalCount: 0,
  totalPrice: 0
};
```

**Fonction de Recalcul :**
```javascript
const recalculateTotals = (state) => {
  state.totalCount = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  state.totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};
```

**Reducers (avec Immer) :**

#### **1. addItem**
```javascript
addItem: (state, action) => {
  const existing = state.items.find(
    (item) => item.id === action.payload.id
  );

  if (existing) {
    existing.quantity += 1; // Immer rend cette mutation safe
  } else {
    state.items.push({ ...action.payload, quantity: 1 });
  }

  recalculateTotals(state);
}
```

#### **2. removeItem**
```javascript
removeItem: (state, action) => {
  const existing = state.items.find(
    (item) => item.id === action.payload
  );

  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    }
  }

  recalculateTotals(state);
}
```

#### **3. clearCart**
```javascript
clearCart: (state) => {
  state.items = [];
  state.totalCount = 0;
  state.totalPrice = 0;
}
```

**Export des Actions :**
```javascript
export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

### 5.2 Configuration du Store (src/redux/store.js)

```javascript
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer
  }
});
```

### 5.3 Connexion des Composants

#### **Navbar.jsx (Lecture avec useSelector)**
```javascript
export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const totalCount = useSelector((state) => state.cart.totalCount);

  return (
    <nav className="navbar">
      {/* Badge réactif */}
      <div className="cart-badge">
        <span className="badge-count">{totalCount}</span>
      </div>
    </nav>
  );
}
```

#### **ProductList.jsx (Écriture avec useDispatch)**
```javascript
export default function ProductList() {
  const dispatch = useDispatch();

  return (
    <div className="product-grid">
      {PRODUCTS.map((product) => (
        <button onClick={() => dispatch(addItem(product))}>
          + Ajouter
        </button>
      ))}
    </div>
  );
}
```

#### **Cart.jsx (Lecture & Écriture)**
```javascript
export default function Cart() {
  const { items, totalCount, totalPrice } = useSelector(
    (state) => state.cart
  );
  const dispatch = useDispatch();

  return (
    <div className="cart-card">
      {items.map((item) => (
        <div key={item.id}>
          <button onClick={() => dispatch(removeItem(item.id))}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => dispatch(addItem(item))}>+</button>
        </div>
      ))}
      <p>Total : <strong>{totalPrice} DT</strong></p>
    </div>
  );
}
```

---

<a name="tests"></a>
## 6. TESTS ET VÉRIFICATIONS

### 6.1 Scénario de Test Complet

**Test 1 : Ajout de Produits**
1. Ouvrir http://localhost:5173
2. Cliquer sur "+ Ajouter" pour l'Écran UltraWide (850 DT) → 1 fois
3. Cliquer sur "+ Ajouter" pour le Clavier Mécanique (180 DT) → 2 fois

**Résultats Attendus :**
- Badge dans Navbar : `3`
- Lignes dans le panier : `2` (Écran x1, Clavier x2)
- Total : `1210 DT` (850 + 180×2)

**✅ VALIDÉ**

**Test 2 : Modification des Quantités**
1. Cliquer sur "-" pour le Clavier → Quantité passe à 1
2. Badge : `2`
3. Total : `1030 DT`

**✅ VALIDÉ**

**Test 3 : Vider le Panier**
1. Cliquer sur "Vider"
2. Badge : `0`
3. Message : "Le panier est actuellement vide."

**✅ VALIDÉ**

**Test 4 : Persistance du Thème**
1. Basculer en "Mode Sombre"
2. Recharger la page (F5)
3. Le thème reste sombre

**✅ VALIDÉ** (grâce à localStorage)

### 6.2 Vérification Redux DevTools

**Actions Tracées :**
- `cart/addItem` → Payload : `{ id: 1, name: "Ecran...", price: 850 }`
- `cart/removeItem` → Payload : `1`
- `cart/clearCart` → Payload : `undefined`

**Diff d'État :**
```diff
+ items: [{ id: 1, name: "Ecran UltraWide 4K 34\"", price: 850, quantity: 1 }]
+ totalCount: 1
+ totalPrice: 850
```

**✅ VALIDÉ** : Toutes les actions sont tracées et l'état est prévisible.

---

<a name="resultats"></a>
## 7. RÉSULTATS OBTENUS

### 7.1 Fonctionnalités Implémentées

| Fonctionnalité | Statut | Technologie |
|----------------|--------|-------------|
| Thème clair/sombre basculable | ✅ | useContext |
| Persistance du thème (localStorage) | ✅ | useEffect + localStorage |
| Badge de panier réactif | ✅ | useSelector |
| Ajout de produits au panier | ✅ | useDispatch + addItem |
| Modification des quantités (+/-) | ✅ | addItem / removeItem |
| Vider le panier | ✅ | clearCart |
| Recalcul automatique des totaux | ✅ | Immer + recalculateTotals |
| Interface responsive | ✅ | CSS fourni |
| 0 Prop Drilling | ✅ | Context + Redux |

### 7.2 Comparaison des Approches

**useContext :**
- **Avantage** : Simple, natif, 0 Ko supplémentaire
- **Limite** : Tous les consommateurs se re-rendent
- **Usage** : Thème, langue, auth (données stables)

**Redux Toolkit :**
- **Avantage** : Sélecteurs chirurgicaux, DevTools, standard strict
- **Limite** : ~11 Ko, plus de configuration
- **Usage** : Panier, listes, calculs fréquents

### 7.3 Métriques du Projet

```
Lignes de Code :
- ThemeContext.jsx : 36 lignes
- cartSlice.js : 65 lignes
- store.js : 9 lignes
- Composants : ~150 lignes total

Performance :
- Temps de build : 485 ms
- Poids bundle (dev) : ~2 Mo (avec HMR)
- Re-rendus ciblés : uniquement les composants abonnés
```

---

<a name="difficultes"></a>
## 8. DIFFICULTÉS RENCONTRÉES

### 8.1 Problème 1 : Confusion Entre Context et Redux

**Description** : Au début, j'ai hésité sur quand utiliser Context vs Redux.

**Solution** : Application de l'arbre de décision de l'énoncé :
- Donnée stable (thème) → useContext
- Donnée fréquemment modifiée (panier) → Redux

### 8.2 Problème 2 : Oubli du Provider Redux

**Erreur Console** :
```
could not find react-redux context value
```

**Cause** : Le composant utilisait `useSelector` hors de `<Provider store={store}>`.

**Solution** : Envelopper `<App />` dans `<Provider>` dans `main.jsx`.

### 8.3 Problème 3 : Mutation Directe Sans Immer

**Erreur Potentielle** : Tenter de muter l'état hors d'un reducer Redux.

**Prévention** : Toujours dispatcher des actions via `useDispatch` et laisser Immer gérer l'immutabilité dans les reducers.

---

<a name="conclusion"></a>
## 9. CONCLUSION

### 9.1 Compétences Acquises

✅ **Maîtrise de useContext** : Création de Provider, hook personnalisé, persistance localStorage  
✅ **Maîtrise de Redux Toolkit** : Slices, actions, reducers avec Immer, store configuration  
✅ **Différenciation des outils** : Savoir choisir entre Context, Redux, Zustand selon le besoin  
✅ **Architecture réactive** : Sélecteurs chirurgicaux, re-rendus optimisés  
✅ **Flux unidirectionnel** : Respect strict de dispatch → action → reducer → store → selector

### 9.2 Points Forts du TP

- **Énoncé structuré** : Découpage en 4 étapes (déclarer, fournir, englober, consommer)
- **Code réutilisable** : Hook `useTheme()`, fonction `recalculateTotals()`
- **DevTools** : Traçabilité complète des actions et états
- **Responsive** : Interface adapte mobile/desktop

### 9.3 Perspectives d'Amélioration

**Défis Avancés (optionnels) :**

1. **Persistance du Panier** : Sauvegarder `state.cart.items` dans localStorage (Défi ★)
2. **Code Promo** : Ajouter `discountPercent` au state et reducer `applyPromoCode` (Défi ★★)
3. **Notifications Toast** : Créer `uiSlice` pour afficher des toasts lors d'actions (Défi ★★★)

**Prochaine Séance (Séance 7) :**
- React Router pour la navigation multi-pages (SPA)
- Routes dynamiques (`/articles/:id`)
- Layouts persistants avec `<Outlet />`

### 9.4 Ressources Consultées

- [Documentation Redux Toolkit](https://redux-toolkit.js.org/)
- [React Context API](https://react.dev/reference/react/useContext)
- [Immer - Immutability Made Easy](https://immerjs.github.io/immer/)
- Énoncé de la Séance 6 (Dr. Abdelweheb GUEDDES)

---

## 📊 ANNEXES

### A. Code Principal

**ThemeContext.jsx (extrait)**
```javascript
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit etre utilise a l\'interieur d\'un <ThemeProvider>');
  }
  return context;
}
```

**cartSlice.js (extrait)**
```javascript
addItem: (state, action) => {
  const existing = state.items.find(item => item.id === action.payload.id);
  if (existing) {
    existing.quantity += 1; // Immer magic ✨
  } else {
    state.items.push({ ...action.payload, quantity: 1 });
  }
  recalculateTotals(state);
}
```

### B. Commandes Utilisées

```bash
# Installation
npm install @reduxjs/toolkit react-redux

# Développement
npm run dev

# Git
git init
git add .
git commit -m "MERN Séance 6: Implémentation complète"
git remote add origin https://github.com/rimelz/mon-compteur-react.git
git push -u origin master
```

### C. Liens du Projet

- **GitHub Repository** : https://github.com/rimelz/mon-compteur-react
- **Branche** : `master`
- **Commit Principal** : `73c4e20` (16 fichiers, 1868 insertions)

---

**Signature**  
RIMELZ  
24 Novembre 2026

---

*Ce compte rendu a été rédigé dans le cadre du cours MERN Stack (Séance 6) enseigné par Dr. Abdelweheb GUEDDES à l'École Polytechnique de Sousse.*
