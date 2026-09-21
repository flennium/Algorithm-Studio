# Algorithm Studio

Algorithm Studio makes the pseudocode taught in introductory university courses
feel like a real language. Write an algorithm, run it, and get a useful answer
instead of wondering whether the syntax is correct.

The desktop app is built for students who should not need to create file
extensions, configure a compiler, or learn an IDE before writing their first
program.

Use it online at [flennium.github.io/Algorithm-Studio](https://flennium.github.io/Algorithm-Studio/), or install the Windows desktop version. Both targets run the same React interface and language engine.

## What works today

- Create a named `.algo` program from inside the app.
- Open and save `.algo`, `.alg`, and plain-text source files.
- Highlight Algorithm syntax and complete common keywords.
- Run constants, scalar declarations, arithmetic and Boolean expressions,
  decisions, the three standard loop forms, comments, and `Ecrire`.
- Explain syntax and runtime errors at the relevant line and column.
- Read the language guide without leaving the editor.
- Use the interface in French or English. French is the default.
- Follow the system light or dark theme, with a manual override.

The executable core is deliberately honest about its boundary. Interactive
input, arrays, procedures, functions, files, and drawing are documented as
future language work rather than presented as working features.

## Install

Download the latest Windows installer from
[GitHub Releases](https://github.com/flennium/Algorithm-Studio/releases).

Algorithm Studio is not code-signed yet, so Windows may show a SmartScreen
notice for early releases. Release checksums are published alongside each
installer.

## Develop locally

You need Node.js 22.12 or 24 and npm.

```bash
git clone https://github.com/flennium/Algorithm-Studio.git
cd Algorithm-Studio
npm ci
npm run dev
```

Run the same application in a browser:

```bash
npm run dev:web
```

Before opening a pull request:

```bash
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run build:web
```

Create a Windows installer with:

```bash
npm run dist
```

The installer is written to `release/Algorithm-Studio-Setup-<version>.exe`.

## Project map

```text
src/main/          Electron window, native dialogs, and file access
src/preload/       Small typed bridge between Electron and React
src/renderer/      Shared web and desktop application
src/language/      Expressions, parser, runtime, shared types, and public API
src/shared/        Platform-neutral contracts
docs/              Canonical language reference
```

The language engine and interface have no dependency on Electron. A small
document adapter uses native dialogs on desktop and browser import/download on
the web. This keeps the behavior in one source tree while allowing each
platform to handle files naturally.

## Language reference

The in-app guide is the quickest reference for students. The repository also
contains the current [language reference](docs/LANGUAGE.md), including exact
syntax and implementation limits.

## Contributing

Small, focused changes are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md)
before starting. Language changes should include an example, an interpreter
test, and a matching documentation update.

## License

Algorithm Studio is available under the [MIT License](LICENSE).
