# Algorithm Studio implementation plan

## 1. Product definition

### Audience

University students learning the French-style Algorithm pseudocode dialect and
teachers who need a reliable way to demonstrate and verify programs.

### Primary job

Make an educational language immediately testable and observable. The product
must explain what a program is doing, not merely announce whether it worked.

### Product principles

1. Diagnostics teach: every error identifies the source range, cause, and a
   likely correction.
2. Execution is visible: the active line and every state change can be traced.
3. The language engine is independent of Electron and the user interface.
4. Beginner-friendly behavior must not make the grammar inconsistent.
5. A program produces identical results in normal and step-through execution.

## 2. MVP boundary

### Included

- desktop application for Windows;
- one editable program at a time;
- syntax highlighting and automatic indentation;
- keyword and declared-symbol completion;
- open, save, and save-as actions;
- lexer, parser, semantic validator, and tree-walking interpreter;
- scalar declarations, assignment, expressions, and comments;
- `Lire` and `Ecrire` console operations;
- `Si`, `Pour`, and `TantQue` control flow;
- source diagnostics with line and column ranges;
- Run, Stop, and Clear console actions;
- light and dark editor themes;
- a bundled set of example programs.

### Deferred until the core is reliable

- procedures and functions;
- arrays and matrices;
- step debugger and breakpoints;
- variable and call-stack inspectors;
- execution timeline;
- drawing canvas and graphics standard library;
- lessons, accounts, cloud sync, plugins, and collaboration;
- mobile or browser versions.

## 3. Technical architecture

Use a small workspace so the language remains portable without fragmenting the
application into unnecessary services.

```text
algorithm-studio/
├── apps/
│   └── desktop/
│       ├── src/main/          Electron lifecycle and file operations
│       ├── src/preload/       Narrow, typed IPC bridge
│       └── src/renderer/      React interface
├── packages/
│   ├── language-core/         Lexer, parser, AST, validator, runtime
│   └── language-service/      Completion, hover, formatting, Monaco adapter
├── examples/                  Valid and invalid sample programs
├── docs/
└── package.json
```

### Desktop application

- Electron with Vite, React, and TypeScript.
- Tailwind CSS for layout and design tokens.
- Monaco Editor for editing and language features.
- Zustand for UI, session, console, and debugger state.
- Canvas or SVG for later runtime visualization.

### Electron security boundary

- Keep `contextIsolation` enabled.
- Keep `nodeIntegration` disabled in the renderer.
- Expose only typed file-dialog and file-operation methods through preload.
- Validate all IPC arguments in the main process.
- Do not evaluate generated JavaScript or use `eval` to run student programs.

### Language pipeline

```text
Source text
   │
   ▼
Lexer ───────► lexical diagnostics
   │ tokens
   ▼
Parser ──────► syntax diagnostics
   │ AST
   ▼
Validator ───► name and type diagnostics
   │ checked AST
   ▼
Interpreter ─► console, input requests, runtime events, runtime diagnostics
```

Every token and AST node carries a source span. The UI never has to reconstruct
which source text caused an error or runtime event.

### Runtime model

The interpreter is a state machine rather than a recursive function that runs
to completion. Its public operations should eventually be:

```ts
createSession(program, options)
session.continue()
session.step()
session.provideInput(value)
session.stop()
```

Runtime output is represented by structured events such as `outputWritten`,
`inputRequested`, `statementEntered`, `variableChanged`, `completed`, and
`failed`. The MVP consumes console events; the debugger and visualizer can later
consume the same stream without replacing the interpreter.

Run the interpreter in a Web Worker or worker thread so an accidental infinite
loop cannot freeze the interface. Apply an instruction budget and allow the
user to stop execution.

## 4. UI and interaction design

### Layout

The workspace is left-aligned and editor-first. The console shares the main
horizontal axis with the code, while inspectors occupy a collapsible right
rail only when useful.

```text
┌────────────────────────────────────────────────────────────────┐
│ Algorithm Studio       lesson.algo        Run  Step  Stop       │
├───────────┬───────────────────────────────┬────────────────────┤
│ Examples  │                               │ Variables          │
│ Files     │          Code editor          │ and execution      │
│           │                               │ details            │
├───────────┴───────────────────────────────┴────────────────────┤
│ Console             Problems             Execution trace       │
└────────────────────────────────────────────────────────────────┘
```

For narrow windows, the left and right rails become drawers and the bottom
panel becomes a switchable Console/Problems panel. The editor always receives
the largest area.

### Visual system

| Token | Value | Role |
|---|---:|---|
| Graphite | `#18212B` | Primary text and light-theme chrome |
| Paper | `#F5F7F8` | Main light surface |
| Slate | `#24313D` | Secondary surfaces and separators |
| Execution blue | `#247BA0` | Active instruction and primary actions |
| Success green | `#2D8A63` | Completed execution and valid state |
| Error red | `#D04A4A` | Diagnostics and failed execution |

- Atkinson Hyperlegible: navigation, controls, explanations, and diagnostics.
- Iosevka: source code, console output, variables, and source locations.
- Use compact radii and structural separators; avoid a dashboard of floating
  cards.
- Motion is reserved for execution: a brief connection from the active source
  line to a changed variable. Respect reduced-motion preferences.
- Keyboard focus must always be visible and color must never be the only error
  indicator.

### Design review

The initial concept risked looking like a generic dark IDE. The revised design
uses a quiet, light application frame around a configurable code surface and
spends its visual emphasis on one subject-specific feature: the live connection
between a statement and the state it changes. This makes the interface belong
to an educational interpreter rather than a general-purpose editor.

## 5. Core contracts

Define these interfaces before building UI features around them:

```ts
type SourcePosition = { offset: number; line: number; column: number };
type SourceSpan = { start: SourcePosition; end: SourcePosition };

type Diagnostic = {
  severity: "error" | "warning" | "information";
  code: string;
  message: string;
  span: SourceSpan;
  suggestion?: string;
};

type RuntimeEvent =
  | { type: "outputWritten"; value: string }
  | { type: "inputRequested"; expectedType: string; span: SourceSpan }
  | { type: "statementEntered"; span: SourceSpan }
  | { type: "variableChanged"; name: string; value: unknown; span: SourceSpan }
  | { type: "completed" }
  | { type: "failed"; diagnostic: Diagnostic };
```

The exact AST types follow the validated grammar and should use discriminated
unions with exhaustive handling.

## 6. Delivery sequence

### Phase 0 — Validate the dialect

Deliverables:

- at least ten real course programs;
- a vocabulary of keywords and operators;
- decisions for every open item in the language draft;
- expected output for valid examples;
- expected diagnostics for invalid examples.

Exit criterion: the language draft matches the material used by the intended
students and teachers.

### Phase 1 — Repository and desktop shell

Deliverables:

- workspace, TypeScript, linting, formatting, and tests;
- Electron main/preload/renderer separation;
- responsive application shell and Monaco integration;
- typed IPC for open and save;
- CI commands for type checking, tests, and production builds.

Exit criterion: the packaged application opens, edits, saves, and restores an
Algorithm source file without exposing Node.js to the renderer.

### Phase 2 — First language vertical slice

Deliverables:

- lexer and parser with source spans;
- program, declarations, literals, expressions, assignment, and `Ecrire`;
- Problems panel and Monaco diagnostic markers;
- interpreter output connected to the console;
- unit and end-to-end tests for the vertical slice.

Exit criterion: the application runs a small non-interactive program and points
to malformed syntax precisely.

### Phase 3 — Interactive MVP

Deliverables:

- `Lire`, typed input, conditions, `Pour`, and `TantQue`;
- semantic validation for undeclared names and incompatible types;
- execution worker, cancellation, and instruction budget;
- autocomplete for keywords and visible declarations;
- example library and empty/error states.

Exit criterion: the first product milestone in the README passes as an automated
acceptance test.

### Phase 4 — Observable execution

Deliverables:

- deterministic runtime event stream;
- step, continue, pause, stop, and breakpoints;
- current-line highlight, variables, arrays, and call-stack inspectors;
- execution speed control and reduced-motion behavior.

Exit criterion: stepping and uninterrupted execution produce the same result,
and the interface accurately explains every state transition.

### Phase 5 — Extended language and drawing

Deliverables:

- arrays, matrices, procedures, and functions;
- documented graphics standard library;
- sandboxed SVG or Canvas renderer;
- exportable drawing output;
- performance and accessibility review.

Exit criterion: course-level programs and documented drawing examples execute
consistently without UI access from interpreted code.

## 7. Testing strategy

- Lexer: token snapshots plus malformed literal/comment cases.
- Parser: AST assertions and recovery from incomplete editor input.
- Validator: table-driven name, scope, and type cases.
- Interpreter: source-to-output golden tests and runtime failure cases.
- Property tests: arithmetic expression precedence and token/source spans.
- UI: editor markers, console input/output, file actions, and cancellation.
- End to end: package and launch the Windows application, run a sample, save it,
  reopen it, and verify the output.

Every reported language bug should become a small source fixture before it is
fixed.

## 8. First implementation sprint

The first sprint should stay deliberately narrow:

1. Validate the minimal grammar using three authentic course programs.
2. Scaffold the workspace and Electron security boundary.
3. Build the application frame and mount Monaco.
4. Implement tokens for program structure, declarations, identifiers, numbers,
   strings, assignment, arithmetic, and `Ecrire`.
5. Parse and interpret one complete non-interactive example.
6. Display output and source diagnostics in the application.
7. Add automated tests and produce a development build.

### Sprint acceptance program

```algorithm
Algorithme Addition
Variables
    a, b, resultat : Entier
Debut
    a <- 12
    b <- 8
    resultat <- a + b
    Ecrire("Resultat : ", resultat)
Fin
```

Expected output:

```text
Resultat : 20
```

This example is provisional until its syntax is confirmed against course
material.

## 9. Decisions required before grammar implementation

1. Exact spellings and accents for every keyword.
2. Whether keyword and identifier matching is case-sensitive.
3. Whether declarations appear before `Debut`, inside it, or both.
4. Assignment operator: `<-`, `←`, `:=`, or accepted aliases.
5. Index origin and array declaration syntax.
6. Numeric division and conversion rules.
7. String escaping and concatenation rules.
8. Block endings such as `FinSi` versus `Fin Si`.
9. Parameter modes and function return syntax.
10. Whether friendly aliases are permitted or strict course syntax is required.

