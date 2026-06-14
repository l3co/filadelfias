#!/usr/bin/env python3
"""
Extrator do Manual Presbiteriano 2019 — v3

Usa get_text("dict") para separar o texto dos artigos das notas de rodapé
com base no tamanho da fonte, produzindo uma estrutura hierárquica fiel ao
documento original (Partes → Capítulos → Seções → Artigos).

Classificação de fontes:
  size >= 30           → título de parte (Constituição, Código de Disciplina, etc.)
  size >= 9.5          → conteúdo principal (artigos, cabeçalhos de capítulo/seção)
  size < 7.0           → marcador de nota inline (superscript no corpo do artigo)
  5.2 + 9.0 mesma linha → definição de nota de rodapé
  size 9.0 linha só    → continuação de nota ou cabeçalho de página (ignorar)
"""

import json
import re
from pathlib import Path

try:
    import fitz
except ImportError:
    import subprocess
    subprocess.check_call(["pip", "install", "PyMuPDF"])
    import fitz


# ─────────────────────────────────────────────────────────────────────────────
# Helpers de classificação
# ─────────────────────────────────────────────────────────────────────────────

PAGE_HEADER_RE = re.compile(
    r"^(\d+\s*[–-]\s*Manual Presbiteriano"
    r"|Manual Presbiteriano\s*[–-]\s*\d+"
    r"|Constituição\s*[–-]\s*\d+"
    r"|Código de Disciplina\s*[–-]\s*\d+"
    r"|Liturgia\s*[–-]\s*\d+"
    r"|Estatuto\s*[–-]\s*\d+"
    r"|Regimento Interno\s*[–-]\s*\d+"
    r"|Modelo de\s*.+[–-]\s*\d+)$",
    re.IGNORECASE,
)


def is_bold(span: dict) -> bool:
    font = span.get("font", "")
    return "Bold" in font or "bold" in font


def dominant_size(spans: list[dict]) -> float:
    sizes = [round(s["size"], 1) for s in spans if s["text"].strip()]
    return sizes[0] if sizes else 0.0


def line_text_from_spans(spans: list[dict], main_only: bool = False) -> str:
    """Concatena spans. Se main_only=True, ignora spans de footnote (< 7.0)."""
    parts = []
    for span in spans:
        txt = span["text"]
        size = round(span["size"], 1)
        if main_only and size < 7.0:
            continue
        parts.append(txt)
    return "".join(parts)


def footnote_markers_in_spans(spans: list[dict]) -> list[str]:
    """Extrai números de notas inline (spans com size < 7.0)."""
    markers = []
    for span in spans:
        if round(span["size"], 1) < 7.0:
            num = span["text"].strip()
            if num.isdigit():
                markers.append(num)
    return markers


def clean(text: str) -> str:
    """Limpeza básica: remove soft-hyphens, normaliza espaços."""
    text = text.replace("­", "")  # soft hyphen
    text = text.replace(" ", " ")  # en space
    text = re.sub(r"-\s*\n\s*", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_chapter_header(line_text: str, spans: list[dict]) -> bool:
    stripped = line_text.strip()
    if not stripped:
        return False
    bold_flag = any(is_bold(s) for s in spans if s["text"].strip())
    size = dominant_size(spans)
    if not bold_flag or size < 9.5:
        return False
    upper = stripped.upper()
    return (
        re.match(r"^CAPÍTULO\s+", upper)
        or upper in ("PREÂMBULO", "DISPOSIÇÕES GERAIS", "DISPOSIÇÕES TRANSITÓRIAS")
        or re.match(r"^ÍNDICE REMISSIVO", upper)
    )


def is_section_header(line_text: str, spans: list[dict]) -> bool:
    stripped = line_text.strip()
    bold_flag = any(is_bold(s) for s in spans if s["text"].strip())
    size = dominant_size(spans)
    return bool(
        bold_flag
        and size >= 9.5
        and re.match(r"^Seção\s+\d", stripped)
    )


def is_article_start(spans: list[dict]) -> tuple[bool, str]:
    """Retorna (is_article, article_number)."""
    for span in spans:
        if round(span["size"], 1) < 9.5:
            continue
        txt = span["text"].strip()
        m = re.match(r"^Art\.\s*(\d+)[º°]?", txt)
        if m:
            return True, m.group(1)
    return False, ""


def is_paragraph_marker(spans: list[dict]) -> tuple[bool, str]:
    """Retorna (is_paragraph, marker_text) para § ou alíneas."""
    for span in spans:
        if round(span["size"], 1) < 9.5:
            continue
        if not is_bold(span):
            continue
        txt = span["text"].strip()
        if re.match(r"^§\s*\d+[º°ª]?", txt):
            return True, txt
        if re.match(r"^Parágrafo único", txt, re.IGNORECASE):
            return True, txt
    return False, ""


# ─────────────────────────────────────────────────────────────────────────────
# Extração principal
# ─────────────────────────────────────────────────────────────────────────────

def extract_manual(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)

    parts: list[dict] = []
    current_part: dict | None = None
    current_chapter: dict | None = None
    current_section: dict | None = None
    current_article: dict | None = None
    current_paragraph: dict | None = None
    footnotes: dict[str, str] = {}  # number → text
    pending_footnote_num: str | None = None
    expecting_chapter_subtitle = False

    def flush_paragraph():
        nonlocal current_paragraph
        if current_paragraph and current_article is not None:
            text = clean(current_paragraph["text"])
            if text:
                current_paragraph["text"] = text
                current_article["structure"].append(current_paragraph)
        current_paragraph = None

    def flush_article():
        nonlocal current_article
        flush_paragraph()
        if current_article is not None:
            # Build final article text from structure
            if not current_article["text"]:
                current_article["text"] = " ".join(
                    p["text"] for p in current_article["structure"]
                )
            current_article["text"] = clean(current_article["text"])
            target = (
                current_section["articles"]
                if current_section is not None
                else current_chapter["articles"] if current_chapter is not None
                else None
            )
            if target is not None and current_article["text"]:
                # note_markers kept for later resolution (footnotes may not be
                # collected yet — they appear at page bottom, after article body)
                target.append(current_article)
        current_article = None

    def flush_section():
        nonlocal current_section
        flush_article()
        if current_section is not None and current_chapter is not None:
            if current_section["articles"]:
                current_chapter["sections"].append(current_section)
        current_section = None

    def flush_chapter():
        nonlocal current_chapter
        flush_section()
        flush_article()
        if current_chapter is not None and current_part is not None:
            has_content = (
                current_chapter["articles"]
                or current_chapter["sections"]
            )
            if has_content:
                current_part["chapters"].append(current_chapter)
        current_chapter = None

    def flush_part():
        nonlocal current_part
        flush_chapter()
        if current_part is not None and (
            current_part["chapters"] or current_part.get("_pending_title")
        ):
            if current_part["chapters"]:
                parts.append(current_part)
        current_part = None

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("dict")["blocks"]

        # Reset footnote continuation state per page
        pending_footnote_num = None

        for block in blocks:
            if block.get("type") != 0:
                continue

            for line in block.get("lines", []):
                spans = line.get("spans", [])
                if not spans:
                    continue

                raw_text = "".join(s["text"] for s in spans)
                if not raw_text.strip():
                    continue

                d_size = dominant_size(spans)

                # ── Part title (36pt) ──────────────────────────────────────
                if d_size >= 28.0:
                    flush_part()
                    part_title = raw_text.strip()
                    # Parts can span multiple lines — accumulate in _pending_title
                    # We create the part lazily so we can join multi-line titles
                    if current_part is None:
                        current_part = {
                            "id": f"p{len(parts)}",
                            "title": part_title,
                            "chapters": [],
                            "_pending_title": part_title,
                        }
                    else:
                        current_part["_pending_title"] += " " + part_title
                        current_part["title"] = current_part["_pending_title"]
                    pending_footnote_num = None
                    expecting_chapter_subtitle = False
                    continue

                # ── Page header / footer (skip) ────────────────────────────
                line_for_check = clean(raw_text)
                if PAGE_HEADER_RE.match(line_for_check):
                    continue
                # Also skip lines like "C" + "onstituição" split header
                if len(line_for_check) <= 2 and d_size == 9.0:
                    continue

                # ── Footnote definition lines (5.2 number + 9.0 text) ──────
                # These appear at the bottom of pages
                has_tiny = any(round(s["size"], 1) <= 5.5 for s in spans if s["text"].strip())
                if has_tiny:
                    # Collect footnote number from tiny span
                    tiny_text = ""
                    rest_text = ""
                    for span in spans:
                        if round(span["size"], 1) <= 5.5:
                            tiny_text += span["text"].strip()
                        else:
                            rest_text += span["text"]
                    if tiny_text.isdigit():
                        pending_footnote_num = tiny_text
                        rest = clean(rest_text)
                        footnotes[pending_footnote_num] = rest
                    else:
                        # Could be inline superscript inside article text handled below
                        pass
                    continue

                # ── Footnote continuation (9.0 lines after a definition) ───
                if d_size <= 9.5 and d_size >= 7.0:
                    if pending_footnote_num is not None:
                        # Continuation of last footnote
                        footnotes[pending_footnote_num] = (
                            footnotes.get(pending_footnote_num, "") + " " + clean(raw_text)
                        ).strip()
                    # If no pending footnote, skip (page header or noise)
                    continue

                # ─────────────────────────────────────────────────────────────
                # Main content lines (size >= 9.5)
                # ─────────────────────────────────────────────────────────────
                pending_footnote_num = None

                main_text = line_text_from_spans(spans, main_only=True).strip()
                markers = footnote_markers_in_spans(spans)

                # ── Chapter header ─────────────────────────────────────────
                if is_chapter_header(main_text, spans):
                    flush_chapter()
                    flush_section()
                    chapter_id = f"ch{len(current_part['chapters']) if current_part else 0}"
                    # Count globally across parts for stable IDs
                    total_chapters = sum(len(p["chapters"]) for p in parts)
                    if current_part:
                        total_chapters += len(current_part["chapters"])
                    current_chapter = {
                        "id": f"ch{total_chapters}",
                        "number": "",
                        "title": main_text,
                        "subtitle": "",
                        "sections": [],
                        "articles": [],
                    }
                    # Extract chapter number if present
                    m = re.match(r"^CAPÍTULO\s+([IVXLCivxlc\d]+)", main_text, re.IGNORECASE)
                    if m:
                        current_chapter["number"] = m.group(1)
                        current_chapter["title"] = main_text
                    expecting_chapter_subtitle = True
                    continue

                # ── Chapter subtitle (line immediately after chapter header) ─
                if (
                    expecting_chapter_subtitle
                    and current_chapter is not None
                    and not main_text.startswith("Art.")
                    and not re.match(r"^§", main_text)
                ):
                    current_chapter["subtitle"] = main_text
                    current_chapter["title"] = main_text  # use subtitle as display title
                    expecting_chapter_subtitle = False
                    continue

                expecting_chapter_subtitle = False

                # ── Section header (Seção Nª) ──────────────────────────────
                if is_section_header(main_text, spans):
                    flush_section()
                    # Next line is the section subtitle
                    m = re.match(r"^(Seção\s+\d+[ªaAº°]?)", main_text)
                    sec_number = m.group(1) if m else main_text
                    # Rest of line (after "Seção Nª – ...") if inline
                    sec_rest = re.sub(r"^Seção\s+\d+[ªaAº°]?\s*[–\-]?\s*", "", main_text).strip()
                    current_section = {
                        "id": f"sec{len(current_chapter['sections']) if current_chapter else 0}",
                        "number": sec_number,
                        "title": sec_rest or sec_number,
                        "articles": [],
                    }
                    expecting_chapter_subtitle = True  # re-use flag for section subtitle
                    continue

                # ── Article start ──────────────────────────────────────────
                is_art, art_num = is_article_start(spans)
                if is_art:
                    flush_article()
                    # Article text = everything in this line after "Art. Xº"
                    text_after = re.sub(r"^Art\.\s*\d+[º°]?\s*", "", main_text).strip()
                    current_article = {
                        "id": "",  # filled later
                        "number": art_num,
                        "text": text_after,
                        "structure": [],
                        "note_markers": list(markers),
                        "notes": [],
                    }
                    if text_after:
                        current_paragraph = {
                            "id": f"art{art_num}-caput",
                            "type": "caput",
                            "marker": None,
                            "text": text_after,
                        }
                    continue

                # ── Paragraph marker (§) ───────────────────────────────────
                is_par, par_marker = is_paragraph_marker(spans)
                if is_par and current_article is not None:
                    flush_paragraph()
                    par_text = re.sub(
                        r"^(§\s*\d+[º°ª]?|Parágrafo único)\s*", "", main_text
                    ).strip()
                    current_paragraph = {
                        "id": f"art{current_article['number']}-par",
                        "type": "section",
                        "marker": par_marker,
                        "text": par_text,
                    }
                    if current_article:
                        current_article["note_markers"].extend(markers)
                    continue

                # ── Article body continuation ──────────────────────────────
                if current_article is not None:
                    if current_paragraph is not None:
                        current_paragraph["text"] += " " + main_text
                    else:
                        current_article["text"] += " " + main_text
                    current_article["note_markers"].extend(markers)
                    continue

    # Flush remaining state
    flush_part()
    doc.close()

    return parts, footnotes


def _resolve_notes(
    markers: list[str], footnotes: dict[str, str]
) -> list[dict]:
    seen = set()
    result = []
    for num in markers:
        if num in seen:
            continue
        seen.add(num)
        text = footnotes.get(num, "")
        result.append({"id": f"note-{num}", "number": num, "text": text})
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Assign stable IDs and clean up
# ─────────────────────────────────────────────────────────────────────────────

def assign_ids(parts: list[dict], footnotes: dict[str, str]) -> dict:
    total_articles = 0
    for pi, part in enumerate(parts):
        part["id"] = f"p{pi}"
        part.pop("_pending_title", None)
        for ci, chapter in enumerate(part["chapters"]):
            chapter["id"] = f"p{pi}/ch{ci}"
            for si, section in enumerate(chapter["sections"]):
                section["id"] = f"p{pi}/ch{ci}/sec{si}"
                for ai, article in enumerate(section["articles"]):
                    article["id"] = f"p{pi}/ch{ci}/sec{si}/art{ai}"
                    article["notes"] = _resolve_notes(article.pop("note_markers", []), footnotes)
                    total_articles += 1
            for ai, article in enumerate(chapter["articles"]):
                article["id"] = f"p{pi}/ch{ci}/art{ai}"
                article["notes"] = _resolve_notes(article.pop("note_markers", []), footnotes)
                total_articles += 1

    return {
        "metadata": {
            "title": "Manual Presbiteriano",
            "editionYear": 2019,
            "language": "pt-BR",
            "source": {"type": "pdf", "fileName": "Manual-Presbiteriano-2019.pdf"},
            "schemaVersion": "4.0.0",
        },
        "parts": parts,
        "total_articles": total_articles,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────────────────────────────────────

def validate(manual: dict) -> None:
    total = 0
    empty = []
    for part in manual["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                for article in section["articles"]:
                    total += 1
                    if not article["text"].strip():
                        empty.append(article["id"])
            for article in chapter["articles"]:
                total += 1
                if not article["text"].strip():
                    empty.append(article["id"])

    print(f"  Partes:   {len(manual['parts'])}")
    print(f"  Artigos:  {total}")
    if empty:
        print(f"  ⚠  Artigos sem texto: {len(empty)} — {empty[:5]}")
    else:
        print("  ✅ Todos os artigos têm texto")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    pdf_path = project_root / "references" / "Manual-Presbiteriano-2019.pdf"
    output_path = project_root / "apps" / "backend" / "src" / "assets" / "manual_2019.json"

    if not pdf_path.exists():
        print(f"❌ PDF não encontrado: {pdf_path}")
        return

    print(f"Extraindo: {pdf_path.name}")
    parts, footnotes = extract_manual(str(pdf_path))

    print(f"Montando estrutura...")
    manual = assign_ids(parts, footnotes)

    print("Validando...")
    validate(manual)

    print(f"Salvando em: {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manual, f, ensure_ascii=False, indent=2)

    print("✅ Concluído!")


if __name__ == "__main__":
    main()
