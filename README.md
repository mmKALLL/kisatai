# Kisatai

Kisatai is a 2D fighting game forked from KiltaGear (https://github.com/VsKatshuma/KiltaGear)

![真・mmKALLL](src/assets/sprites/original-true-mmkalll.jpg?raw=true 'True mmKALLL')

### Kanban and backlog

https://kanbanflow.com/board/PHB3xT

### Installing on local machine

1. Have `yarn` and Node.js 10.15.0 or newer installed (see https://yarnpkg.com/lang/en/docs/install/).
2. Run `yarn` to install local dependencies.

### Running locally

1. `yarn start`
2. Open _http://localhost:1234/_ in your favourite browser.
3. Enjoy _kisatai_!

### Troubleshooting

On Windows platforms, some users may need to install TypeScript and Parcel locally as part of their Node.js installation.

`yarn global add typescript && yarn global add parcel-bundler`

Then you should be able to run the game with `parcel index.html`.

#### Upload notes

- Delete release directory `rm -rf release` _careful here_
- Run `yarn build`
- Zip the release directory, rename it to `release-0.x.x`, upload zip to itch.io
- Congratulate yourself on a successful release!

#### Old upload notes

- Delete dist directory `rm -rf dist` _carefully_
- Run `parcel index.html assets/sprites/*` _production build will not work with itch_ (can't always resolve hashed filenames to assets)
- Rename newly made dist directory to release-0.x
- In release-0.x, remove slash from kisatai.js path in index.html
- In kisatai.xxxxxxxx.js, replace all upper/root directory access. ../ as ./ and exports="/..." as exports="...". As regex: `"\.\./assets/sprites/` -> `"./assets/sprites/`, `exports="/` -> `exports="`
- Zip the release directory, check that the filename has no spaces, and upload zip to itch.io

In the future, could consider `parcel build src/index.html --public-url='./'`, see https://github.com/parcel-bundler/parcel/issues/2624
