#!/usr/bin/env python3
"""
Script para extrair o conteúdo completo do Manual Presbiteriano 2019 do PDF.
Gera um arquivo JSON estruturado com todos os artigos.
"""

import json
import re
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Instalando PyMuPDF...")
    import subprocess
    subprocess.check_call(["pip", "install", "PyMuPDF"])
    import fitz


def extract_text_from_pdf(pdf_path: str) -> list[dict]:
    """Extrai texto de todas as páginas do PDF."""
    doc = fitz.open(pdf_path)
    pages = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        pages.append({
            "page": page_num + 1,
            "text": text
        })
    
    doc.close()
    return pages


def clean_text(text: str) -> str:
    """Limpa o texto removendo quebras de linha desnecessárias."""
    # Remove hífens de quebra de linha
    text = re.sub(r'-\s*\n\s*', '', text)
    # Substitui múltiplas quebras de linha por espaço
    text = re.sub(r'\n+', ' ', text)
    # Remove espaços múltiplos
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_article(text: str, article_num: str) -> dict:
    """Parse um artigo individual."""
    # Limpa o texto
    cleaned = clean_text(text)
    
    # Extrai notas de rodapé (números sobrescritos)
    notes = []
    note_pattern = r'(\d+)\s*([A-Z][^0-9]*?)(?=\d+\s*[A-Z]|$)'
    
    return {
        "number": article_num,
        "text": cleaned,
        "structure": [{"type": "paragraph", "marker": None, "text": cleaned}],
        "notes": notes
    }


def extract_articles_from_pages(pages: list[dict]) -> list[dict]:
    """Extrai artigos das páginas do PDF."""
    full_text = "\n\n".join([p["text"] for p in pages])
    
    # Padrão para encontrar artigos: "Art. X" no início de linha ou após quebra
    # Evita capturar referências como "Art. 1º do estatuto"
    article_pattern = r'(?:^|\n)\s*Art\.\s*(\d+)[º°]?\s*[–\-.]?\s*'
    
    # Encontra todas as posições de artigos
    matches = list(re.finditer(article_pattern, full_text))
    
    # Deduplica - mantém apenas a primeira ocorrência de cada número
    seen_numbers = set()
    unique_matches = []
    for match in matches:
        num = match.group(1)
        if num not in seen_numbers:
            seen_numbers.add(num)
            unique_matches.append(match)
    
    articles = []
    for i, match in enumerate(unique_matches):
        article_num = match.group(1)
        start = match.end()
        
        # Fim é o início do próximo artigo ou fim do texto
        if i + 1 < len(unique_matches):
            end = unique_matches[i + 1].start()
        else:
            end = len(full_text)
        
        article_text = full_text[start:end].strip()
        
        # Remove texto muito curto (provavelmente referência, não artigo)
        if len(article_text) < 50:
            continue
        
        # Limita o tamanho para evitar pegar muito texto
        if len(article_text) > 8000:
            article_text = article_text[:8000] + "..."
        
        if article_text:
            articles.append({
                "id": f"art{article_num}",
                "type": "article",
                "number": article_num,
                "text": clean_text(article_text),
                "structure": [{"type": "paragraph", "marker": None, "text": clean_text(article_text)}],
                "notes": []
            })
    
    return articles


def build_manual_structure(articles: list[dict]) -> dict:
    """Constrói a estrutura do manual com todos os artigos extraídos."""
    
    # Estrutura simplificada - todos os artigos em uma única parte
    structure = {
        "metadata": {
            "title": "Manual Presbiteriano",
            "editionYear": 2019,
            "language": "pt-BR",
            "source": {
                "type": "pdf",
                "fileName": "Manual-Presbiteriano-2019.pdf"
            },
            "schemaVersion": "2.0.0"
        },
        "parts": []
    }
    
    # Agrupa artigos por centenas para criar capítulos
    # Isso facilita a navegação
    chapters = {}
    
    for article in articles:
        try:
            art_num = int(article["number"])
            # Agrupa por centenas (1-99, 100-199, etc.)
            chapter_num = (art_num - 1) // 50
            
            if chapter_num not in chapters:
                start = chapter_num * 50 + 1
                end = (chapter_num + 1) * 50
                chapters[chapter_num] = {
                    "id": f"ch{chapter_num}",
                    "number": str(chapter_num + 1),
                    "title": f"Artigos {start} a {end}",
                    "sections": [],
                    "articles": []
                }
            
            article_copy = article.copy()
            article_copy["id"] = f"ch{chapter_num}/art{article['number']}"
            chapters[chapter_num]["articles"].append(article_copy)
        except ValueError:
            # Artigo com número não numérico, pula
            continue
    
    # Ordena capítulos e artigos
    sorted_chapters = []
    for ch_num in sorted(chapters.keys()):
        ch = chapters[ch_num]
        # Ordena artigos dentro do capítulo
        ch["articles"].sort(key=lambda a: int(a["number"]) if a["number"].isdigit() else 0)
        sorted_chapters.append(ch)
    
    # Cria uma única parte com todos os capítulos
    part = {
        "id": "p0",
        "title": "Manual Presbiteriano 2019",
        "chapters": sorted_chapters
    }
    
    structure["parts"].append(part)
    
    return structure


def main():
    # Caminhos
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    pdf_path = project_root / "references" / "Manual-Presbiteriano-2019.pdf"
    output_path = project_root / "apps" / "backend" / "src" / "assets" / "manual_2019.json"
    
    if not pdf_path.exists():
        print(f"Erro: PDF não encontrado em {pdf_path}")
        return
    
    print(f"Extraindo texto do PDF: {pdf_path}")
    pages = extract_text_from_pdf(str(pdf_path))
    print(f"Total de páginas: {len(pages)}")
    
    print("Extraindo artigos...")
    articles = extract_articles_from_pages(pages)
    print(f"Total de artigos encontrados: {len(articles)}")
    
    print("Construindo estrutura do manual...")
    manual = build_manual_structure(articles)
    
    # Conta artigos na estrutura final
    total_articles = sum(
        len(ch["articles"]) 
        for part in manual["parts"] 
        for ch in part["chapters"]
    )
    print(f"Artigos na estrutura final: {total_articles}")
    
    print(f"Salvando JSON em: {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manual, f, ensure_ascii=False, indent=2)
    
    print("Extração concluída!")


if __name__ == "__main__":
    main()
