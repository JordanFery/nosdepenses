# Dépenses du couple — Jordan & Samya

Application de suivi des dépenses communes d'un couple, avec équilibrage
automatique 50/50.

Chaque fois que Jordan ou Samya dépense de l'argent, la personne ajoute la
dépense dans l'application. L'app calcule ensuite qui doit combien à qui pour
que tout reste équilibré, mois par mois, catégorie par catégorie.

## Stack technique

- **Next.js 16** (App Router) + **React 19** — JavaScript, pas TypeScript
- **Tailwind CSS v4**
- **Prisma ORM** + **PostgreSQL** (hébergé sur **Supabase**)
- API via les **Route Handlers** de Next.js (pas de backend séparé)
- **Lucide React** pour les icônes

```
Next.js
├── Frontend React (App Router)
├── API Route Handlers
└── Prisma
      ↓
PostgreSQL (Supabase)
```

## Fonctionnalités

- Dashboard mensuel : total du mois, total par personne, équilibrage 50/50
- Navigation entre les mois (`< septembre 2026 >`)
- Dépenses par catégorie, triées par montant décroissant
- Comparaison "qui a payé quoi" par catégorie
- Liste des dépenses groupée par jour, avec filtres combinables
  (personne + catégorie)
- Ajout / modification / suppression de dépenses, avec validation serveur
- **Remboursements en argent** : de l'argent donné directement d'une
  personne à l'autre (ex : du cash remis en main propre) s'impute
  intégralement sur la balance plutôt que d'être réparti 50/50
- Gestion des catégories (ajout / modification / suppression)
- Montants stockés en `Decimal` (jamais `Float`), calculs faits en cents
  pour une précision parfaite à deux décimales
- États de chargement, erreurs, mois vide, confirmation de suppression
- Responsive desktop / tablette / mobile (navigation en barre du bas sur
  mobile, ajout de dépense en un tap via le bouton flottant)

## Structure du projet

```
app/
├── api/
│   ├── expenses/          # GET, POST /api/expenses ; GET, PUT, DELETE /api/expenses/[id]
│   ├── users/             # GET /api/users
│   ├── categories/        # GET, POST /api/categories ; PUT, DELETE /api/categories/[id]
│   └── stats/             # GET /api/stats?month=YYYY-MM
├── dashboard/
├── expenses/
├── categories/
├── layout.js
└── page.js                # redirige vers /dashboard

components/
├── dashboard/              # MonthNav, SummaryCards, BalanceCard, catégories...
├── expenses/                # ExpenseList, ExpenseFormModal, ExpenseFilters...
├── categories/
└── ui/                      # Button, Card, Modal, ConfirmDialog...

lib/
├── prisma.js               # client Prisma (singleton paresseux)
├── calculations.js         # logique d'équilibrage et de statistiques
├── money.js                # arithmétique monétaire en cents
├── dates.js                # gestion des mois / dates (UTC-safe)
├── validation.js           # validation serveur
└── api-client.js           # wrappers fetch côté client

prisma/
├── schema.prisma
├── seed.js
└── migrations/

__tests__/
└── calculations.test.js    # tests de la logique d'équilibrage
```

## Installation

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un nouveau
   projet.
2. Dans **Project Settings → Database**, récupérez :
   - la **Connection string** en mode **Transaction pooler** (port `6543`,
     avec `?pgbouncer=true&connection_limit=1`) → utilisée en `DATABASE_URL`.
   - la **Connection string** en mode **Session / direct** (port `5432`)
     → utilisée en `DIRECT_URL`, nécessaire pour que Prisma puisse exécuter
     les migrations.

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Puis complétez `.env` avec vos identifiants Supabase :

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

⚠️ Ne committez jamais votre fichier `.env` (il est déjà ignoré par
`.gitignore`) et n'exposez jamais `DATABASE_URL` côté client (aucune
variable `NEXT_PUBLIC_*` n'est utilisée pour la base de données).

### 3. Installer les dépendances

```bash
npm install
```

### 4. Générer le client Prisma et créer les tables

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Cette commande crée les tables `users`, `categories` et `expenses` dans
votre base Supabase (le SQL exact est déjà versionné dans
`prisma/migrations/`).

### 5. Initialiser les données (Jordan, Samya, catégories, démo)

```bash
npx prisma db seed
```

Le seed est idempotent : le relancer ne crée pas de doublons. Il crée :

- les utilisateurs **Jordan** et **Samya** ;
- les catégories **Courses, Restaurant, Logement, Transport, Loisirs,
  Abonnements, Santé, Shopping, Autre** ;
- quelques dépenses de démonstration (préfixées `[Démo]`) pour que le
  dashboard ne soit pas vide au premier lancement.

### 6. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous êtes redirigé
vers `/dashboard`.

## Scripts disponibles

```bash
npm run dev        # serveur de développement
npm run build      # build de production
npm run start      # démarre le build de production
npm run lint       # ESLint
npm run test       # tests de la logique d'équilibrage (node --test)
npm run db:seed    # relance le seed manuellement
```

## Migrations Prisma

Après toute modification de `prisma/schema.prisma` :

```bash
npx prisma migrate dev --name description_du_changement
```

En production (Vercel, CI) :

```bash
npx prisma migrate deploy
```

## Déploiement sur Vercel

1. Poussez le projet sur GitHub.
2. Importez le repo dans [Vercel](https://vercel.com/new).
3. Renseignez les variables d'environnement `DATABASE_URL` et `DIRECT_URL`
   dans les paramètres du projet Vercel (mêmes valeurs que votre `.env`).
4. Le script `postinstall` du projet lance automatiquement
   `prisma generate` à chaque déploiement.
5. Après le premier déploiement, exécutez une fois (en local, pointé sur la
   base Supabase de production, ou via `vercel env pull` + `npx prisma
   migrate deploy`) :
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Logique d'équilibrage

Toutes les dépenses sont considérées comme communes et réparties à 50/50.

```
difference    = |totalJordan - totalSamya|
remboursement = difference / 2
```

- Si `totalJordan > totalSamya` → Samya doit `remboursement` à Jordan.
- Si `totalSamya > totalJordan` → Jordan doit `remboursement` à Samya.
- Si égaux → "Dépenses équilibrées".

Voir `lib/calculations.js` et les tests dans `__tests__/calculations.test.js`
(5 cas du cahier des charges + un test de précision décimale + un test de
cohérence globale des statistiques).

### Remboursements en argent

En plus des dépenses communes, vous pouvez enregistrer un **remboursement** :
de l'argent donné directement d'une personne à l'autre (ex : du cash remis
en main propre pour éponger une partie de la dette).

Contrairement à une dépense commune, un remboursement **ne se répartit pas
50/50** — il s'impute intégralement sur la balance :

```
Samya dépense 100 $ à Costco (dépense commune)
  -> Jordan doit 50 $ à Samya

Jordan remet 50 $ en cash à Samya (remboursement)
  -> la balance tombe à 0 $ (et non à 25 $)
```

Pour ajouter un remboursement, ouvrez le formulaire "Ajouter une dépense" et
sélectionnez le type **Remboursement** en haut du formulaire. Un
remboursement n'a pas de catégorie ; le champ "Payé par" devient
"Remis par" (la personne qui donne l'argent).

Les remboursements sont exclus des totaux "dépensé" et de la répartition
par catégorie du dashboard (ce ne sont pas des dépenses), mais apparaissent
listés dans la carte "Équilibrage" et dans la liste des dépenses (avec une
icône distincte).

## Précision monétaire

Les montants sont stockés en `Decimal(10,2)` dans PostgreSQL (jamais
`Float`). Toutes les additions/soustractions côté serveur sont effectuées en
**cents (entiers)** via `lib/money.js`, puis reconverties en dollars
uniquement pour l'affichage — ce qui élimine les erreurs d'arrondi
classiques des nombres flottants.

## Notes sur cet environnement de développement

Ce projet a été construit et vérifié dans un environnement sandbox dont
l'accès réseau est restreint à une liste de domaines précise, qui
n'inclut pas `binaries.prisma.sh` (le serveur depuis lequel Prisma
télécharge ses moteurs de requête/migration). En conséquence :

- `npx prisma generate` n'a pas pu être exécuté avec succès dans cet
  environnement, et les appels réels à la base de données n'ont donc pas pu
  être vérifiés de bout en bout ici.
- **`npm run build` a bien été vérifié et compile sans erreur**, tout comme
  **`npm run lint`** (aucune erreur) et **`npm run test`** (7/7 tests
  passent).
- Le schéma SQL a été vérifié en l'appliquant directement (via `psql`) sur
  une base PostgreSQL locale : il est valide et cohérent avec
  `schema.prisma`.

Sur votre machine ou sur Vercel, `binaries.prisma.sh` est normalement
accessible : `npx prisma generate` et `npx prisma migrate dev` devraient
fonctionner sans problème particulier. Si vous rencontriez malgré tout une
erreur de téléchargement de moteur Prisma, vérifiez votre pare-feu/proxy
réseau.
#   n o s d e p e n s e s  
 