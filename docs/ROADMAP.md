# Algorithm Studio 1.0 Roadmap

This roadmap describes the next three patch releases after 1.0.0. The order is
intentional: stabilize the language first, improve the learning experience
second, and introduce visual output only after the interpreter is dependable.

Patch releases must remain compatible with valid 1.0 programs. If a proposal
changes existing syntax or program behavior, it belongs in a future minor or
major release instead.

## Version 1.0.1 — Reliability and polish

The first update should make the current release dependable for daily use in a
classroom. It should focus on correctness rather than adding language syntax.

### Interpreter

- Add conformance tests for every documented statement, expression, type, and
  diagnostic code.
- Test nested control structures, recursion limits, negative array bounds,
  input into array elements, and Unicode identifiers.
- Ensure runtime errors stop execution at the responsible statement without
  producing misleading output afterward.
- Keep French and English diagnostics synchronized and give every error a
  useful correction hint.

### Editor and guide

- Use Algorithm-aware syntax colors in every guide example.
- Keep autocomplete, editor highlighting, and guide terminology consistent.
- Improve keyboard navigation, visible focus states, screen-reader labels, and
  contrast in both light and dark themes.
- Fix layout issues on small laptop screens and narrow browser windows.

### Distribution

- Run type checking, tests, coverage, and both production builds in continuous
  integration.
- Publish installer checksums with every GitHub release.
- Document supported Windows and Node.js versions.

### Ready to release when

- All language tests pass on the continuous-integration runner.
- Language-engine line coverage remains at or above 95 percent.
- The Electron and web builds pass from a clean checkout.
- Every documented code example is covered by a test or executable example.
- No known issue can lose or overwrite a user's source file.

## Version 1.0.2 — A better learning workflow

The second update should reduce the distance between reading an example and
understanding it. A student should be able to discover syntax, try it, and
understand a mistake without leaving the application.

### Projects and examples

- Add a welcome screen with **New program**, **Open file**, and a small set of
  curated examples.
- Provide examples for input/output, conditions, loops, arrays, functions,
  procedures, and recursion.
- Remember recent files locally, while allowing entries to be removed from the
  list.
- Add safe draft recovery after an unexpected close or browser refresh.
- Show the current file name and unsaved state clearly.

### Learning tools

- Add a **Try in editor** action to guide examples.
- Link diagnostics directly to the relevant guide topic.
- Show the expected type, received value, and likely fix for type errors.
- Add a compact execution summary containing output, elapsed time, and the
  number of executed instructions. Do not restore the unnecessary variables
  panel or “program terminated” message.
- Make search include guide titles, explanations, code, and error codes.

### Editor quality

- Add bracket and block matching for `Si`, loops, functions, and procedures.
- Indent new lines according to the surrounding Algorithm block.
- Add formatting for indentation and keyword casing without changing program
  meaning.
- Preserve editor settings and the selected interface language locally.

### Ready to release when

- Every bundled example executes without diagnostics.
- Draft recovery is tested in Electron and in the browser.
- All guide-to-editor actions work with keyboard navigation.
- A new user can create, run, save, reopen, and recover a program without
  manually creating a `.algo` file.

## Version 1.0.3 — Visual output

The third update should deliver the first drawing experience requested for
Algorithm Studio. It should be a small, teachable graphics module rather than
a general-purpose canvas API.

### Drawing language

- Add a drawing surface beside the console that remains hidden for programs
  that do not draw.
- Introduce a documented set of French drawing procedures:
  `EffacerDessin`, `Couleur`, `Ligne`, `Rectangle`, `Cercle`, and `Texte`.
- Use a simple top-left coordinate system measured in pixels and document its
  limits clearly.
- Validate coordinates, sizes, colors, and argument counts with normal
  `ALG-S` diagnostics.
- Keep drawing deterministic so the same program produces the same result on
  the web and desktop.

Proposed syntax:

```algo
Algorithme PremierDessin
Debut
    EffacerDessin("#ffffff")
    Couleur("#6d5dfc")
    Rectangle(40, 40, 160, 90)
    Cercle(120, 85, 28)
    Texte(62, 155, "Mon premier dessin")
Fin
```

### User experience

- Allow the drawing panel to be resized or closed.
- Add an action to export the result as a PNG image.
- Include drawing examples in the welcome screen and language guide.
- Explain invalid dimensions and unsupported colors in plain French and
  English.
- Make the canvas usable with light and dark application themes without
  changing the colors selected by the program.

### Safety and limits

- Cap the canvas dimensions and total drawing operations per run.
- Clear all drawing state before a new execution unless the program explicitly
  requests otherwise in a future version.
- Do not add animation, image loading, mouse input, or sound in 1.0.3. Those
  features require a separate design and security review.

### Ready to release when

- Every drawing procedure has parser, runtime, validation, and rendering tests.
- Identical drawing programs produce equivalent results in Electron and on the
  website.
- Exported PNG files match the visible drawing.
- Existing non-drawing programs and the complete 1.0 conformance suite still
  pass unchanged.

## Not planned for these releases

Records, pointers, dynamic memory, file access from Algorithm programs,
networking, user-defined types, animation, and debugger stepping are valuable
ideas, but they are larger language decisions. They should be researched and
specified separately instead of being added quietly in a patch release.

The roadmap may change in response to classroom feedback, but a version should
only be marked complete when its release checklist is satisfied.
