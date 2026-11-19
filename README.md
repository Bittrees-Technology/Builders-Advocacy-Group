# bag-ui

Web UI for [www.buildersadvocacy.org](https://www.buildersadvocacy.org/) (BAG - Builders Advocacy Group).

Includes:

- React via [Create React App](https://github.com/facebook/create-react-app) plus TypeScript
- [RainbowKit](https://www.rainbowkit.com/)
- [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/)

## Scripts

### Run site locally

Run `REACT_APP_ENABLE_TESTNETS=true yarn start`

Make sure you bring in latest ABI!

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Build app

Run `yarn build`.

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Public HTML and route policy

The root is the only public page currently included in the sitemap. Its canonical
uses `https://www.buildersadvocacy.org/`, the verified primary hostname. The
existing non-www host redirect is managed by the deployment and is not changed
here. The public introduction is taken from the existing Mint page; membership
benefits or commitments are not added.

After the normal CRA build, `postbuild` compiles and renders the pure `src/App.tsx`
component through a static router. It does not import the wallet providers,
member content, restricted documents, or administration handlers. The generated
root uses the same component and metadata as the client. The temporary CommonJS
renderer is written to ignored `build-ssr/`; only `build/` is deployed.

`/members`, `/visionstatement`, and `/billofrights` retain their existing membership
checks. `/mint` retains the wallet transaction interface. These four routes have
separate noindex HTML shells, no canonical, and no sitemap entry. Client navigation
removes the root canonical and share metadata when entering them. Vision and Bill
of Rights are gated in the current source and must not be prerendered as public
documentation without an explicit publication decision.

Vercel's CRA preset includes a blanket fallback to `index.html`. To prevent root
metadata from reaching arbitrary paths, `vercel.json` selects the Other preset
(`framework: null`) with an explicit CRA build command and output directory. The
four app routes have explicit rewrites; all existing administration/API rewrites
are retained. Production verification showed that the hosting integration still
served the homepage for unknown extensionless paths after the preset override.
An explicit status-404 route therefore sends only those paths to the noindex
404 document. It excludes the exact app routes, administration, the API namespace,
and file paths, leaving their existing resolution intact. Static and SEO files
retain their extensions; their namespaces do not exempt missing extensionless
paths from the guard. Vercel's
current configuration supports this status route alongside the existing
rewrites, redirects and headers; those rules are not replaced. Missing files
continue to use the native 404 response. The direct `/index.html`
alias redirects to `/`. Root-relative asset paths keep deep links independent of
their trailing slash without changing administration redirects.

The existing consent script and wallet/membership/administration code remain in
place. Robots directives govern indexing; they do not replace access checks.

```bash
yarn build
yarn test:seo
CI=true yarn test --watchAll=false --runInBand
node --test scripts/shared-session-refresh.node.mjs
```

Before publication, verify the actual deployed primary-host redirect, root
canonical, app-route noindex responses, asset loading, consent behavior and true
404 status. Existing shared-session checks remain required. A local build does
not prove Vercel response status or Google indexing.


