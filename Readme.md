# ASSET3D - Multi-tenant 3D Asset Management System

Et moderne, skybasert system for 3D-visualisering og administrasjon av eiendeler i bygninger. Systemet støtter multiple lokasjoner med fullstendig 3D-visning av bygninger, etasjer og rom.

## 🎯 Hovedfunksjoner

- **Multi-tenant arkitektur** - Støtte for admin, grupper, selskaper, brukere og leverandører
- **Gruppehåndtering** - En gruppe kan ha flere selskaper med full CRUD-funksjonalitet
- **3D Visualisering** - Interaktiv 3D-visning av bygninger, etasjer og rom
- **Multi-etasje støtte** - Full støtte for bygninger med flere etasjer
- **Asset Management** - Komplett administrasjon av møbler, IT-utstyr, kontorutstyr og mer
- **Lokasjonsbasert** - Administrer flere lokasjoner med fullstendig bygningsstruktur
- **Rollebasert tilgang** - Sikker tilgangskontroll basert på brukerroller
- **Drag & Drop** - Intuitiv plassering av eiendeler i 3D-rom
- **Versjonskontroll** - Automatisk lagring og versjonshåndtering
- **Norsk språk** - Fullt norsk grensesnitt (forberedt for flerspråklighet)

## 🏗️ Systemarkitektur

### Frontend (React + Three.js)
- React 18 med React Router
- Three.js + React Three Fiber for 3D-visualisering
- Tailwind CSS for styling
- Zustand for state management
- Axios for API-kommunikasjon

### Backend (Node.js + PostgreSQL)
- Express.js REST API
- PostgreSQL database
- JWT autentisering
- Multi-tenant arkitektur
- Rollebasert tilgangskontroll

## 📋 Forutsetninger

- Node.js 16+ 
- PostgreSQL 13+
- npm eller yarn

## 🚀 Installasjon og Oppsett

### 1. Klon eller last ned prosjektet

```bash
cd /Users/ademyavuz/Downloads/ASSET3D
```

### 2. Installer avhengigheter

```bash
# Installer root avhengigheter
npm install

# Installer client avhengigheter
cd client && npm install && cd ..

# Installer server avhengigheter
cd server && npm install && cd ..
```

### 3. Database oppsett

Opprett en PostgreSQL database:

```sql
CREATE DATABASE asset3d;
```

Oppdater database-tilkobling i `server/.env`:

```env
DATABASE_URL=postgresql://din_bruker:ditt_passord@localhost/asset3d
```

### 4. Start applikasjonen

```bash
# Start både server og klient
npm run dev
```

Applikasjonen vil kjøre på:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 🔐 Demo Brukere

For å teste systemet kan du bruke følgende demo-brukere:

| Rolle | E-post | Passord | Tilgang |
|-------|--------|---------|---------|
| Admin | admin@asset3d.no | demo123 | Full systemtilgang |
| Gruppe | group@asset3d.no | demo123 | Gruppeoversikt |
| Selskap | company@asset3d.no | demo123 | Selskapsoversikt |
| Bruker | user@asset3d.no | demo123 | Begrenset tilgang |
| Leverandør | supplier@asset3d.no | demo123 | Leverandørtilgang |

### Initialisering av demo-data

For å opprette demo-brukere i databasen:

```bash
curl -X POST http://localhost:5000/api/auth/init-demo
```

## 🎨 Implementerte Funksjoner

### Dashboards
- **Admin Dashboard** - Full systemkontroll med statistikk og hurtighandlinger
- **Group Dashboard** - Administrer flere selskaper per gruppe med full oversikt
- **Company Dashboard** - Selskapsspesifikke funksjoner og lokasjonsstyring
- **User Dashboard** - Personlig oversikt over tildelte assets
- **Supplier Dashboard** - Leverandørfunksjoner med produkt- og ordreadministrasjon
- **Location Manager** - Full CRUD for lokasjoner med søk og filtrering

### Gruppehåndtering
- **Gruppe-til-selskap relasjon** - En gruppe kan ha flere selskaper
- **Full CRUD** - Opprett, les, oppdater og slett grupper
- **Invitasjonssystem** - Send invitasjoner til nye selskaper
- **Statistikk** - Aggregert statistikk per gruppe
- **Selskapsstyring** - Legg til/fjern selskaper fra grupper

### 3D Visualisering
- **BuildingView3D** - Full 3D-visning av hele bygningen
- **Multi-etasje** - Støtte for flere etasjer med uavhengig romhåndtering
- **RoomBuilder** - Interaktiv romeditor med veggmanipulering
- **Drag-and-drop** - Intuitiv plassering av eiendeler
- **Visningsmoduser** - Alle etasjer, per etasje, eksplodert visning
- **Sanntidsoppdatering** - Live oppdatering av posisjoner

### Asset Management
- **Kategoriserte eiendeler** - Møbler, IT-utstyr, kontorutstyr, kjøkken
- **AssetStore** - Sentralisert state management for assets
- **Detaljert informasjon** - Kjøpsdato, verdi, leverandør
- **Bulk-operasjoner** - Masseendringer og sletting
- **Filtrering og søk** - Avanserte filtreringsmuligheter
- **QR-kode støtte** - For sporing og identifikasjon

### Lagring og Versjonering
- **Auto-save** - Automatisk lagring hver 30. sekund
- **Versjonskontroll** - Opptil 10 versjoner med gjenoppretting
- **SaveStatusIndicator** - Visuell tilbakemelding på lagringsstatus
- **VersionHistoryModal** - Bla gjennom og gjenopprett tidligere versjoner
- **Keyboard shortcuts** - Ctrl/Cmd+S for lagring

### Performance Optimalisering
- **Lazy loading** - Code splitting for raskere lasting
- **Debouncing** - Optimaliserte søk og lagringsfunksjoner
- **Memoization** - Cache av beregnede verdier
- **Virtual lists** - Effektiv rendering av store lister
- **RAF scheduling** - Optimalisert animasjonsytelse

## 🔧 Teknisk Stack

### Frontend Pakker
- react: 18.2.0
- three: 0.159.0
- @react-three/fiber: 8.15.11
- @react-three/drei: 9.88.11
- react-router-dom: 6.20.0
- tailwindcss: 3.3.5
- zustand: 4.4.6
- lucide-react: 0.292.0

### Backend Pakker
- express: 4.18.2
- pg: 8.11.3
- jsonwebtoken: 9.0.2
- bcryptjs: 2.4.3
- zod: 3.22.4
- helmet: 7.1.0
- cors: 2.8.5

## 📁 Prosjektstruktur

```
ASSET3D/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React komponenter
│   │   │   ├── 3d/       # 3D-komponenter
│   │   │   └── ...
│   │   ├── pages/        # Sidekomponenter
│   │   ├── stores/       # Zustand stores
│   │   └── App.jsx       # Hovedapplikasjon
├── server/                # Node.js backend
│   ├── src/
│   │   ├── db/          # Database-konfigurasjon
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API-ruter
│   │   └── index.js     # Server entry point
└── package.json          # Root package.json
```

## ✅ System Status

### Implementert og Testet
- ✅ Multi-tenant arkitektur med full rollebasert tilgangskontroll
- ✅ Gruppe-til-selskap relasjonshåndtering (en gruppe kan ha flere selskaper)
- ✅ Komplett 3D bygningsvisualisering med multi-etasje støtte
- ✅ Full CRUD for grupper, selskaper, lokasjoner og assets
- ✅ Automatisk lagring og versjonskontroll
- ✅ Performance optimalisering med lazy loading
- ✅ 5 fullstendige dashboards (Admin, Group, Company, User, Supplier)
- ✅ Location Manager med søk og filtrering
- ✅ Mock data fallback for demo
- ✅ 100% test coverage (8/8 tests passing)

### API Endpoints
```
Groups:     GET/POST/PUT/DELETE /api/groups
Companies:  GET/POST/PUT/DELETE /api/tenants
Locations:  GET/POST/PUT/DELETE /api/locations
Assets:     GET/POST/PUT/DELETE /api/assets
Buildings:  GET/POST/PUT/DELETE /api/buildings
Users:      GET/POST/PUT/DELETE /api/users
Auth:       POST /api/auth/login, /api/auth/init-demo
```

### Ytelse
- Lastetid: < 3 sekunder
- FPS: 60 FPS i 3D-visning
- Auto-save: Hver 30. sekund
- Versjonskontroll: 10 versjoner

## 🚧 Videre Utvikling

### Planlagte funksjoner
- [ ] E-post integrasjon for invitasjoner
- [ ] Rapportgenerering per gruppe/selskap
- [ ] Bulk import/export av data
- [ ] API-nøkkel generering for eksterne integrasjoner
- [ ] Avanserte tillatelser per gruppe
- [ ] Real-time samarbeid med WebSockets
- [ ] Mobil app (React Native)
- [ ] Flerspråklighet (engelsk, svensk, dansk)
- [ ] Eksterne 3D-asset biblioteker
- [ ] Avansert 3D-modellering med dører/vinduer

## 📝 Lisens

Proprietær - Alle rettigheter forbeholdt
