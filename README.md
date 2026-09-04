# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Awarie na produkcji

Serwis zglasza sam awarie, ktorych nie widac przy budowaniu — te, ktore istnieja
dopiero w przegladarce uzytkownika albo przy renderowaniu na serwerze. Obie awarie,
ktore w tym projekcie dojechaly na produkcje, byly wlasnie tego rodzaju i dowiadywalismy
sie o nich ze zrzutu ekranu przyslanego przez uzytkownika.

Zglaszane sa:

- bledy komponentow (`vue:error`), nieobsluzone bledy okna i odrzucone obietnice — z przegladarki,
- bledy 5xx przy obsludze zadania — z serwera (4xx nie, bo stare linki i boty to normalny ruch).

Kazda awaria trafia do logow serwera, ktore zbiera Railway — to dziala bez zadnej
konfiguracji. Zeby dostawac powiadomienia od razu, ustaw zmienna:

| Zmienna | Do czego |
|---|---|
| `ERROR_WEBHOOK_URL` | adres webhooka Slacka lub Discorda; pusty = tylko logi |

Zabezpieczenia, ktore maja znaczenie przy awarii w petli renderowania: najwyzej piec
zgloszen na jedno wejscie na strone, ten sam blad raz na dziesiec minut, najwyzej
trzydziesci zgloszen na minute na proces. Bledy ze skryptow z innych domen (wtyczki
przegladarki) i znane, nieszkodliwe ostrzezenia silnika sa odsiewane.

## Wdrozenie

Railway ma ustawienie **Wait for CI** — wlacz je. Przebieg `Frontend` uruchamia testy
jednostkowe, buduje projekt i otwiera osiemnascie adresow prawdziwa przegladarka
w czterech szerokosciach. Bez tego ustawienia czerwony przebieg nie zatrzymuje wdrozenia.
