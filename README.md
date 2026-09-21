# Algorithm Studio

Algorithm Studio makes the pseudocode taught in introductory university courses
feel like a real language. Write an algorithm, run it, and get a useful answer
instead of wondering whether the syntax is correct.

The desktop app is built for students who should not need to create file
extensions, configure a compiler, or learn an IDE before writing their first
program.

## What works today

- Create a named `.algo` program from inside the app.
- Open and save `.algo`, `.alg`, and plain-text source files.
- Highlight Algorithm syntax and complete common keywords.
- Run declarations, assignments, arithmetic expressions, strings, comments,
  and `Ecrire`.
- Explain syntax and runtime errors at the relevant line and column.
- Read the language guide without leaving the editor.
- Use the interface in French or English. French is the default.
- Follow the system light or dark theme, with a manual override.

The language is deliberately small at this stage. Input, conditions, loops,
arrays, procedures, functions, and drawing are documented as planned rather
than presented as working features.

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

Before opening a pull request:

```bash
npm run typecheck
npm test
npm run build
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
src/renderer/      Editor, guide, themes, and translations
src/language/      Lexer, parser, diagnostics, and interpreter
docs/              Language and implementation notes
```

The language engine has no dependency on Electron. Keeping that boundary makes
it possible to test the interpreter directly and reuse it in another interface
later.

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
