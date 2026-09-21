import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import {
  BookOpen, CircleAlert, Code2, FileCode2, FolderOpen, Languages, Moon, Play,
  Plus, Save, Sun, TerminalSquare, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { run, type Diagnostic, type RunResult } from "../../language";
import { registerAlgorithmLanguage } from "./editor-language";
import { LanguageGuide } from "./LanguageGuide";
import { format, getCopy, type Locale } from "./i18n";

type Theme = "light" | "dark";
type View = "editor" | "guide";
type Starter = "blank" | "example";

const exampleSource = `Algorithme Addition
Variables
    a, b, resultat : Entier
Debut
    a <- 12
    b <- 8
    resultat <- a + b
    Ecrire("Resultat : ", resultat)
Fin`;

function initialTheme(): Theme {
  const saved = localStorage.getItem("algorithm-studio-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initialLocale(): Locale {
  return localStorage.getItem("algorithm-studio-locale") === "en" ? "en" : "fr";
}

function fileName(path: string | null, fallback: string): string {
  return path?.split(/[\\/]/).pop() ?? `${fallback}.algo`;
}

function safeProgramName(value: string): string {
  const compact = value.trim().replace(/[^\p{L}\p{N}_]/gu, "");
  return compact || "NouveauProgramme";
}

function starterSource(name: string, starter: Starter): string {
  if (starter === "example") {
    return `Algorithme ${name}\nVariables\n    nombre : Entier\nDebut\n    nombre <- 5\n    Ecrire("Valeur : ", nombre)\nFin`;
  }
  return `Algorithme ${name}\n\nDebut\n    \nFin`;
}

export default function App(): React.JSX.Element {
  const [source, setSource] = useState(exampleSource);
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("programme");
  const [result, setResult] = useState<RunResult>({ output: [], diagnostics: [], variables: {} });
  const [hasRun, setHasRun] = useState(false);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [view, setView] = useState<View>("editor");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [starter, setStarter] = useState<Starter>("blank");
  const monacoRef = useRef<Monaco | null>(null);
  const modelRef = useRef<MonacoEditor.ITextModel | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const copy = getCopy(locale);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("algorithm-studio-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("algorithm-studio-locale", locale);
  }, [locale]);

  const status = useMemo(() => {
    if (result.diagnostics.length > 0) {
      const count = result.diagnostics.length;
      return `${count} ${copy.errors}${count > 1 ? "s" : ""}`;
    }
    return copy.ready;
  }, [copy, result.diagnostics.length]);

  function showDiagnostics(diagnostics: Diagnostic[]): void {
    const monaco = monacoRef.current;
    const model = modelRef.current;
    if (!monaco || !model) return;
    monaco.editor.setModelMarkers(model, "algorithm", diagnostics.map((diagnostic) => ({
      severity: monaco.MarkerSeverity.Error,
      message: diagnostic.suggestion ? `${diagnostic.message}\n${diagnostic.suggestion}` : diagnostic.message,
      code: diagnostic.code,
      startLineNumber: diagnostic.span.start.line,
      startColumn: diagnostic.span.start.column,
      endLineNumber: diagnostic.span.end.line,
      endColumn: Math.max(diagnostic.span.end.column, diagnostic.span.start.column + 1),
    })));
  }

  function execute(): void {
    const next = run(source, locale);
    setResult(next);
    setHasRun(true);
    showDiagnostics(next.diagnostics);
  }

  const mountEditor: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    modelRef.current = editor.getModel();
    editor.addAction({
      id: "algorithm.run", label: copy.run,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], run: execute,
    });
  };

  function resetRun(): void {
    setHasRun(false);
    setResult({ output: [], diagnostics: [], variables: {} });
    showDiagnostics([]);
  }

  async function openDocument(): Promise<void> {
    const document = await window.desktop.openDocument();
    if (!document) return;
    setSource(document.content);
    setDocumentPath(document.path);
    setDocumentName(fileName(document.path, "programme").replace(/\.(algo|alg|txt)$/i, ""));
    resetRun();
    setView("editor");
  }

  async function saveDocument(): Promise<void> {
    const saved = await window.desktop.saveDocument(documentPath, source);
    if (saved) setDocumentPath(saved.path);
  }

  function createProgram(): void {
    const name = safeProgramName(newName);
    setSource(starterSource(name, starter));
    setDocumentName(name);
    setDocumentPath(null);
    setNewDialogOpen(false);
    setNewName("");
    resetRun();
    setView("editor");
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function revealDiagnostic(diagnostic: Diagnostic): void {
    setView("editor");
    requestAnimationFrame(() => {
      editorRef.current?.revealLineInCenter(diagnostic.span.start.line);
      editorRef.current?.setPosition({ lineNumber: diagnostic.span.start.line, column: diagnostic.span.start.column });
      editorRef.current?.focus();
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("editor")} aria-label="Algorithm Studio">
          <span className="brand-mark" aria-hidden="true"><Code2 size={20} /></span>
          <span><strong>Algorithm Studio</strong><small>{copy.tagline}</small></span>
        </button>
        <nav className="view-switcher" aria-label="Navigation">
          <button className={view === "editor" ? "active" : ""} onClick={() => setView("editor")}><FileCode2 size={16} />{copy.editor}</button>
          <button className={view === "guide" ? "active" : ""} onClick={() => setView("guide")}><BookOpen size={16} />{copy.guide}</button>
        </nav>
        <div className="toolbar">
          <button className="primary-quiet" onClick={() => setNewDialogOpen(true)}><Plus size={17} />{copy.newProgram}</button>
          <button className="icon-button" onClick={() => void openDocument()} aria-label={copy.open} title={copy.open}><FolderOpen size={17} /></button>
          <button className="icon-button" onClick={() => void saveDocument()} aria-label={copy.save} title={copy.save}><Save size={17} /></button>
          <button className="language-button" onClick={() => setLocale((current) => current === "fr" ? "en" : "fr")}><Languages size={16} />{copy.language}</button>
          <button className="icon-button" aria-label={theme === "dark" ? copy.themeLight : copy.themeDark} title={theme === "dark" ? copy.themeLight : copy.themeDark} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          {view === "editor" && <button className="run-button" onClick={execute}><Play size={17} fill="currentColor" />{copy.run}</button>}
        </div>
      </header>

      {view === "guide" ? <LanguageGuide locale={locale} onOpenEditor={() => setView("editor")} /> : (
        <>
          <section className="editor-workspace">
            <div className="editor-pane" aria-label={copy.editor}>
              <div className="pane-bar">
                <span><FileCode2 size={15} />{fileName(documentPath, documentName)}{!documentPath && <em>{copy.fileUnsaved}</em>}</span>
                <span className={result.diagnostics.length ? "status error" : "status"}>
                  {result.diagnostics.length ? <CircleAlert size={14} /> : <span className="status-dot" />}{status}
                </span>
              </div>
              <div className="editor-wrap">
                <Editor defaultLanguage="algorithm" beforeMount={registerAlgorithmLanguage} onMount={mountEditor}
                  onChange={(value) => setSource(value ?? "")} value={source}
                  theme={theme === "dark" ? "algorithm-night" : "algorithm-day"}
                  options={{ automaticLayout: true, fontFamily: "Iosevka, Cascadia Code, Consolas, monospace", fontSize: 15, lineHeight: 24, minimap: { enabled: false }, padding: { top: 20 }, renderLineHighlight: "all", scrollBeyondLastLine: false, tabSize: 4 }} />
              </div>
            </div>
          </section>

          <section className="bottom-panel">
            <div className="console-title">
              <span><TerminalSquare size={16} /><strong>{copy.output}</strong></span>
              {result.diagnostics.length > 0 && <span className="problem-count"><CircleAlert size={14} />{result.diagnostics.length} {copy.problems}</span>}
              <small>{copy.keyboardRun}</small>
            </div>
            <div className="console-output" aria-live="polite">
              {result.diagnostics.length > 0 ? <div className="problems-list">
                {result.diagnostics.map((diagnostic) => <button className="problem-card" onClick={() => revealDiagnostic(diagnostic)} key={`${diagnostic.code}-${diagnostic.span.start.offset}`}>
                  <CircleAlert size={18} /><span><strong>{diagnostic.message}</strong>
                    <small>{diagnostic.code} · {format(copy.problemAt, { line: diagnostic.span.start.line, column: diagnostic.span.start.column })}</small>
                    {diagnostic.suggestion && <em><b>{copy.suggestion}:</b> {diagnostic.suggestion}</em>}</span>
                </button>)}
              </div> : result.output.length > 0 ? result.output.map((line, index) => <div key={`${line}-${index}`}><span className="prompt">›</span>{line}</div>) : <span className="muted">{hasRun ? copy.noProblems : copy.emptyOutput}</span>}
            </div>
          </section>
        </>
      )}

      {newDialogOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setNewDialogOpen(false)}>
        <section className="new-dialog" role="dialog" aria-modal="true" aria-labelledby="new-program-title">
          <button className="dialog-close" onClick={() => setNewDialogOpen(false)} aria-label={copy.cancel}><X size={18} /></button>
          <div className="dialog-symbol"><Plus size={21} /></div><h2 id="new-program-title">{copy.newTitle}</h2><p>{copy.newDescription}</p>
          <label>{copy.programName}<input autoFocus value={newName} placeholder={copy.programPlaceholder} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && createProgram()} /></label>
          <fieldset><legend>{copy.template}</legend>
            <label className={starter === "blank" ? "selected" : ""}><input type="radio" name="starter" checked={starter === "blank"} onChange={() => setStarter("blank")} /><FileCode2 size={18} /><span><strong>{copy.blank}</strong><small>Algorithme · Debut · Fin</small></span></label>
            <label className={starter === "example" ? "selected" : ""}><input type="radio" name="starter" checked={starter === "example"} onChange={() => setStarter("example")} /><Code2 size={18} /><span><strong>{copy.example}</strong><small>Variable · Calcul · Ecrire</small></span></label>
          </fieldset>
          <div className="dialog-actions"><button onClick={() => setNewDialogOpen(false)}>{copy.cancel}</button><button className="create-button" onClick={createProgram}><Plus size={17} />{copy.create}</button></div>
        </section>
      </div>}
    </main>
  );
}
