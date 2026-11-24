# MERN — Séance 6 : État Global (useContext & Redux Toolkit)

**TechStore** - Application de démonstration pour la gestion d'état global en React

## 📋 Description

Ce projet illustre la gestion d'état global en React avec deux approches complémentaires :
- **useContext** : Pour les préférences légères (thème clair/sombre) avec persistance localStorage
- **Redux Toolkit (RTK)** : Pour l'état métier transactionnel (panier d'achats)

## 🎯 Objectifs Pédagogiques

- Résoudre le problème du **Prop Drilling**
- Maîtriser l'API native **useContext** pour les préférences globales
- Implémenter un flux unidirectionnel avec **Redux Toolkit**
- Comprendre les sélecteurs chirurgicaux avec **useSelector**
- Gérer l'immutabilité avec **Immer**

## 🛠️ Technologies

- React 19.3.1
- Vite 8.3.4
- Redux Toolkit 2.14.0
- React-Redux 9.3.1

## 📦 Installation

```bash
npm install
```

## 🚀 Lancer le projet

```bash
npm run dev
```

Puis ouvrir http://localhost:5173

## 📂 Architecture du Projet

```
mon-app-state/
├── src/
│   ├── components/
│   │   ├── Cart.jsx           # Composant panier Redux
│   │   ├── Navbar.jsx          # Barre de navigation avec badge
│   │   └── ProductList.jsx     # Catalogue de produits
│   ├── context/
│   │   └── ThemeContext.jsx    # Contexte de thème avec localStorage
│   ├── data/
│   │   └── products.js         # Données des produits
│   ├── redux/
│   │   ├── cartSlice.js        # Slice Redux pour le panier
│   │   └── store.js            # Store Redux configuré
│   ├── App.jsx                 # Composant principal
│   ├── main.jsx                # Point d'entrée avec Providers
│   └── index.css               # Styles globaux
├── package.json
└── README.md
```

## 🎨 Fonctionnalités Implémentées

### 1. Gestion du Thème (useContext)
- **Thème clair/sombre** basculable via bouton
- **Persistance** dans localStorage
- **Hook personnalisé** `useTheme()` pour faciliter l'utilisation
- **0 prop drilling** : composants accèdent directement au contexte

### 2. Panier d'Achats (Redux Toolkit)
- **Actions** :
  - `addItem` : Ajouter un produit ou incrémenter sa quantité
  - `removeItem` : Décrémenter la quantité ou retirer l'article
  - `clearCart` : Vider le panier
- **State** :
  - `items` : Tableau des produits avec quantités
  - `totalCount` : Nombre total d'articles
  - `totalPrice` : Montant total en DT
- **Recalcul automatique** des totaux via Immer
- **Sélecteurs chirurgicaux** : seuls les composants abonnés se re-rendent

### 3. Interface Utilisateur
- **Catalogue** de 4 produits TechStore
- **Badge réactif** dans la navbar montrant le nombre d'articles
- **Panier détaillé** avec contrôles +/- pour chaque article
- **Responsive design** adapté mobile/desktop

## 🔄 Flux de Données

### useContext (Thème)
```
ThemeContext.jsx (Provider)
    ↓ value={{ theme, toggleTheme }}
Navbar.jsx (useTheme())
    ↓ onClick={toggleTheme}
localStorage.setItem('app_theme', theme)
```

### Redux Toolkit (Panier)
```
ProductList.jsx
    ↓ dispatch(addItem(product))
cartSlice.js (reducer + Immer)
    ↓ state.items.push(...)
store.js (Store central)
    ↓ state.cart.totalCount
Navbar.jsx (useSelector)
    ↓ Re-rendu ciblé uniquement
```

## 🧪 Test de l'Application

1. **Ajouter des produits** : Cliquez sur "+ Ajouter" dans le catalogue
2. **Vérifier le badge** : Le compteur dans la navbar s'incrémente
3. **Modifier les quantités** : Utilisez +/- dans le panier
4. **Basculer le thème** : Cliquez sur "Mode Sombre"/"Mode Clair"
5. **Recharger la page** (F5) : Le thème persiste grâce à localStorage

## 📊 Exemple de Test

**Scénario** : 
- Ajouter 1 Écran UltraWide (850 DT)
- Ajouter 2 Claviers Mécaniques (180 DT)

**Résultat attendu** :
- Badge : `3`
- Total : `1210 DT`
- 2 lignes dans le panier

## 🔍 Inspection Redux DevTools

L'extension Redux DevTools permet de :
- Visualiser l'état complet du store
- Tracer chaque action dispatchée
- Voir les diffs d'état produits par Immer
- Voyager dans le temps (time-travel debugging)

## 📚 Concepts Clés

### Prop Drilling vs État Global
- **Prop Drilling** (❌) : Passer des props à travers des composants intermédiaires qui ne les utilisent pas
- **État Global** (✅) : Accès direct via Context ou Redux sans traverser l'arbre

### useContext vs Redux Toolkit
| Critère | useContext | Redux Toolkit |
|---------|-----------|---------------|
| Configuration | Zéro dépendance | @reduxjs/toolkit + Provider |
| Re-rendu | Tous les abonnés | Sélecteurs chirurgicaux |
| Usage optimal | Thème, langue, auth | Panier, listes, calculs |
| Poids bundle | 0 Ko | ~11 Ko |

### Immer & Immutabilité
Redux Toolkit utilise **Immer** en interne :
```javascript
// ✅ Syntaxe naturelle (Immer intercepte)
existing.quantity += 1;

// 🔄 Produit en réalité (immuable)
return { ...state, items: [...state.items, { ...existing, quantity: existing.quantity + 1 }] }
```

## 🏆 Défis Avancés (Optionnels)

### Défi 1 : Persistance du Panier (★)
Sauvegarder `items` dans localStorage pour conserver le panier après F5

### Défi 2 : Code Promo (★★)
Implémenter une réduction de 20% avec le code `POLY2027`

### Défi 3 : Notifications Toast (★★★)
Créer un `uiSlice` pour afficher des notifications lors de l'ajout d'articles

## 👨‍🏫 Auteur

**Dr. Abdelweheb GUEDDES**  
École Polytechnique de Sousse — 2026-2027  
Cours MERN Stack — Séance 6

## 📝 Licence

Projet pédagogique - MERN Stack
