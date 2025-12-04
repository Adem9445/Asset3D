# Running `cleanup-react-app` Locally

The repository at <https://github.com/niallpaterson/cleanup-react-app> is a starter that
removes the default boilerplate from a `create-react-app` scaffold. If you need to get it
running on your own machine, follow the steps below.

> **Note**
> This environment cannot clone directly from GitHub (corporate proxy returns `CONNECT tunnel failed, response 403`).
> The instructions below explain how to perform the same steps on a workstation with
> regular GitHub access.

## 1. Prerequisites

- Node.js 18 LTS or newer (use `node -v` to confirm)
- npm 9+ (`npm -v`)
- Git with HTTPS access to GitHub

If you work behind a proxy, configure Git first:

```bash
git config --global http.proxy http://<proxy-host>:<proxy-port>
git config --global https.proxy http://<proxy-host>:<proxy-port>
```

## 2. Clone the repository

```bash
cd <folder-where-you-want-the-project>
git clone https://github.com/niallpaterson/cleanup-react-app.git
cd cleanup-react-app
```

## 3. Install dependencies

```bash
npm install
```

The project is a plain React SPA, so a single `npm install` at the root is sufficient.
If the install fails because of a corporate proxy, export your proxy variables first:

```bash
export HTTP_PROXY=http://<proxy-host>:<proxy-port>
export HTTPS_PROXY=http://<proxy-host>:<proxy-port>
```

## 4. Start the dev server

```bash
npm start
```

`create-react-app` uses the `start` script to run a Vite-like dev server on
`http://localhost:3000`. Open the browser and verify that the default landing page
shows “Cleanup React App” instead of the CRA boilerplate. Any file edits under `src/`
will hot-reload automatically.

## 5. Build for production (optional)

```bash
npm run build
```

The production build outputs a minified bundle in `build/`. Deploy that folder to any
static host (Netlify, GitHub Pages, S3, etc.).

## 6. Useful extras

| Command            | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `npm run lint`     | Run ESLint using the repo’s config        |
| `npm test`         | Execute the default CRA test runner       |
| `npm run format`   | Apply Prettier (if configured in repo)    |

## 7. Troubleshooting

1. **Port already in use** – Stop the existing process or set `PORT=4000 npm start`.
2. **Proxy/SSL errors** – Configure `HTTP_PROXY`, `HTTPS_PROXY`, or add
   the corporate certificate via `NODE_EXTRA_CA_CERTS`.
3. **Dependency cache issues** – Delete `node_modules` and `package-lock.json`,
   then rerun `npm install`.

Following these steps will reproduce the same result locally as if we had run the
repo directly in this environment.
