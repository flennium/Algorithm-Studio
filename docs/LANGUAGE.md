# Algorithm Studio language reference

Algorithm Studio implements a defined teaching dialect of French pseudocode. Pseudocode is not standardized: spellings and block markers vary between universities. This dialect follows the common introductory core while keeping every accepted form executable and testable.

## Complete program

```algorithm
Algorithme SommePaire
Constantes
    LIMITE = 10
Variables
    i, total : Entier
Debut
    total <- 0
    Pour i <- 1 A LIMITE Faire
        Si i MOD 2 = 0 Alors
            total <- total + i
        FinSi
    FinPour
    Ecrire("Somme : ", total)
Fin
```

Keywords are case-insensitive. Accented and unaccented forms are accepted where they commonly differ. Comments start with `//`.

## Declarations and expressions

The recognized classroom types are `Entier`, `Reel`, `Chaine`, `Caractere`, and `Booleen`. Boolean literals are `Vrai` and `Faux`. Constants use `=` or `<-` and cannot be reassigned.

| Family | Operators |
|---|---|
| grouping | `( … )` |
| unary | `+`, `-`, `NON` |
| multiplication | `*`, `/`, `DIV`, `MOD` |
| addition | `+`, `-` |
| comparison | `=`, `<>`, `!=`, `<`, `<=`, `>`, `>=` |
| Boolean | `ET`, `OU` |

`DIV` performs integer division. `MOD` returns the remainder. `+` joins text when either operand is a string.

## Decisions and loops

```algorithm
Si note >= 10 Alors
    Ecrire("Admis")
Sinon
    Ecrire("Ajourné")
FinSi

Pour i <- 1 A 10 Faire
    Ecrire(i)
FinPour

TantQue compteur < 10 Faire
    compteur <- compteur + 1
FinTantQue

Repeter
    compteur <- compteur - 1
JusquA compteur = 0
```

`Pour` accepts an optional `Pas`, including a negative step. The runtime stops after 100,000 executed statements and reports a diagnostic instead of hanging on an infinite loop.

## Current boundary

The executable core currently covers scalar programs. Interactive `Lire`, arrays and matrices, records, files, procedures/functions, recursion, and drawing are not yet part of the runtime. They remain explicit here instead of being presented as working syntax.

## Academic basis

The scope was checked against introductory material from Université Lyon 1 (functions/procedures, parameter passing, arrays, strings, structures, files), Université de Lille (control and data structures), and Universitat Politècnica de Catalunya (loops, types/scope, subprograms, recursion, vectors, multidimensional vectors, structures, sorting, numerical algorithms). These sources define a curriculum inventory, not one universal syntax.
