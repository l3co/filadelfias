#!/usr/bin/env python3
"""
Script para extrair o conteúdo completo do Manual Presbiteriano 2019 do PDF.
Gera um arquivo JSON estruturado com todos os artigos, parágrafos e notas.

Melhorias v2:
- Quebra parágrafos jurídicos (§ 1º, § 2º, etc.)
- Extrai notas numéricas do texto
- Gera IDs estáveis para anchors
- Valida integridade da extração
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


# Índice global de notas
notes_index: dict[str, dict] = {}


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
    """Limpa o texto removendo quebras de linha desnecessárias e hifenização."""
    # Remove hífen seguido de quebra de linha (palavra dividida)
    text = re.sub(r'-\s*\n\s*', '', text)
    # Remove hífen "soft" (­) usado para quebra de linha
    text = text.replace('­', '')
    # Remove hífen seguido de espaços (quebra de linha do PDF)
    text = re.sub(r'-\s{2,}', '', text)
    # Substitui múltiplas quebras de linha por espaço
    text = re.sub(r'\n+', ' ', text)
    # Remove espaços múltiplos
    text = re.sub(r'\s+', ' ', text)
    # Remove espaços antes de pontuação
    text = re.sub(r'\s+([.,;:!?)])', r'\1', text)
    # Adiciona espaço após pontuação se seguido de letra
    text = re.sub(r'([.,;:!?])([A-Za-zÀ-ÿ])', r'\1 \2', text)
    return text.strip()


def extract_notes_from_text(text: str, article_id: str) -> tuple[str, list[dict]]:
    """
    Extrai notas numéricas do texto e retorna texto limpo + lista de notas.
    Exemplo: "membros em plena comunhão31 e se reunirá" 
    -> ("membros em plena comunhão e se reunirá", [{"id": "note-31", "number": "31"}])
    """
    notes = []
    
    # Padrão para notas: número após letra/pontuação (sem espaço antes)
    # Ex: "comunhão31" ou "concílios.14" ou "assembleia,7"
    # Captura: letra ou pontuação + número de 1-3 dígitos
    note_pattern = r'([a-zA-ZÀ-ÿ.,;:!?)])(\d{1,3})(?=\s|[.,;:!?)\]]|$)'
    
    def replace_note(match):
        char_before = match.group(1)
        note_num = match.group(2)
        note_id = f"{article_id}-note-{note_num}"
        
        # Adiciona ao índice global
        if note_id not in notes_index:
            notes_index[note_id] = {
                "id": note_id,
                "number": note_num,
                "source": article_id,
                "text": ""  # Será preenchido se encontrarmos o texto da nota
            }
        
        notes.append({
            "id": note_id,
            "number": note_num
        })
        
        return char_before  # Remove o número, mantém a letra/pontuação
    
    # Aplica múltiplas vezes para pegar notas consecutivas
    prev_text = ""
    clean = text
    while prev_text != clean:
        prev_text = clean
        clean = re.sub(note_pattern, replace_note, clean)
    
    return clean, notes


def parse_paragraphs(text: str, article_num: str) -> list[dict]:
    """
    Quebra o texto em parágrafos jurídicos.
    Identifica: § 1º, § 2º, alíneas a), b), etc.
    """
    paragraphs = []
    article_id = f"art-{article_num}"
    
    # Primeiro, limpa o texto
    text = clean_text(text)
    
    # Padrão para parágrafos: § seguido de número
    para_pattern = r'(§\s*\d+[º°]?)'
    
    # Padrão para alíneas: letra seguida de )
    alinea_pattern = r'\b([a-z])\)'
    
    # Divide o texto por parágrafos
    parts = re.split(para_pattern, text)
    
    current_para_num = 0
    
    for i, part in enumerate(parts):
        part = part.strip()
        if not part:
            continue
        
        # Verifica se é um marcador de parágrafo
        if re.match(para_pattern, part):
            # É um marcador, o próximo item será o conteúdo
            continue
        
        # Verifica se o item anterior era um marcador
        marker = None
        para_type = "paragraph"
        
        if i > 0 and re.match(para_pattern, parts[i-1].strip()):
            marker = parts[i-1].strip()
            para_type = "section"
            current_para_num += 1
        elif current_para_num == 0:
            # Primeiro parágrafo (caput do artigo)
            para_type = "caput"
        
        # Extrai notas do texto
        clean_part, notes = extract_notes_from_text(part, article_id)
        
        # Gera ID estável para anchor
        if marker:
            para_id = f"{article_id}-par-{current_para_num}"
        else:
            para_id = f"{article_id}-caput" if para_type == "caput" else f"{article_id}-p-{len(paragraphs)}"
        
        paragraphs.append({
            "id": para_id,
            "type": para_type,
            "marker": marker,
            "text": clean_part,
            "notes": notes
        })
    
    # Se não conseguiu quebrar, retorna o texto inteiro como um parágrafo
    if not paragraphs:
        clean_text_result, notes = extract_notes_from_text(text, article_id)
        paragraphs.append({
            "id": f"{article_id}-caput",
            "type": "caput",
            "marker": None,
            "text": clean_text_result,
            "notes": notes
        })
    
    return paragraphs


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
            # Parse parágrafos jurídicos e extrai notas
            structure = parse_paragraphs(article_text, article_num)
            
            # Texto limpo (sem notas) para exibição
            clean_article_text = " ".join([p["text"] for p in structure])
            
            # Coleta todas as notas do artigo
            all_notes = []
            for para in structure:
                all_notes.extend(para.get("notes", []))
            
            articles.append({
                "id": f"art-{article_num}",
                "type": "article",
                "number": article_num,
                "text": clean_article_text,
                "structure": structure,
                "notes": all_notes
            })
    
    return articles


def build_manual_structure(articles: list[dict]) -> dict:
    """Constrói a estrutura do manual com todos os artigos extraídos."""
    
    structure = {
        "metadata": {
            "title": "Manual Presbiteriano",
            "editionYear": 2019,
            "language": "pt-BR",
            "source": {
                "type": "pdf",
                "fileName": "Manual-Presbiteriano-2019.pdf"
            },
            "schemaVersion": "3.0.0"  # Nova versão com parágrafos e notas
        },
        "parts": [],
        "notesIndex": {}  # Índice global de notas
    }
    
    # Separa artigos por faixas de numeração (diferentes partes do Manual)
    # Constituição: Art. 1-152
    # Código de Disciplina: Art. 1-xxx (reinicia numeração)
    # Princípios de Liturgia: Art. 1-xxx
    # etc.
    
    constituicao_arts = []
    outros_arts = []
    
    for article in articles:
        try:
            art_num = int(article["number"])
            # Artigos 1-200 são provavelmente da Constituição
            # Artigos com números muito altos (>1000) são de outras seções
            if art_num <= 200:
                constituicao_arts.append(article)
            else:
                outros_arts.append(article)
        except ValueError:
            continue
    
    # Ordena artigos da Constituição
    constituicao_arts.sort(key=lambda a: int(a["number"]))
    
    # Agrupa artigos da Constituição em capítulos de 50
    chapters = []
    chapter_num = 0
    
    for i in range(0, len(constituicao_arts), 50):
        batch = constituicao_arts[i:i+50]
        if batch:
            first_num = batch[0]["number"]
            last_num = batch[-1]["number"]
            
            chapter = {
                "id": f"ch{chapter_num}",
                "number": str(chapter_num + 1),
                "title": f"Artigos {first_num} a {last_num}",
                "sections": [],
                "articles": []
            }
            
            for article in batch:
                article_copy = article.copy()
                article_copy["id"] = f"ch{chapter_num}/art{article['number']}"
                chapter["articles"].append(article_copy)
            
            chapters.append(chapter)
            chapter_num += 1
    
    # Adiciona artigos de outras seções como capítulo separado (se houver)
    if outros_arts:
        outros_arts.sort(key=lambda a: int(a["number"]))
        chapter = {
            "id": f"ch{chapter_num}",
            "number": str(chapter_num + 1),
            "title": "Outras Disposições",
            "sections": [],
            "articles": []
        }
        for article in outros_arts:
            article_copy = article.copy()
            article_copy["id"] = f"ch{chapter_num}/art{article['number']}"
            chapter["articles"].append(article_copy)
        chapters.append(chapter)
    
    # Cria uma única parte com todos os capítulos
    part = {
        "id": "p0",
        "title": "Constituição da Igreja Presbiteriana do Brasil",
        "chapters": chapters
    }
    
    structure["parts"].append(part)
    
    # Adiciona índice global de notas
    structure["notesIndex"] = notes_index
    
    return structure


def validate_extraction(manual: dict) -> dict:
    """
    Valida a extração garantindo:
    - Nenhum artigo sem parágrafos
    - Nenhuma nota órfã
    """
    issues = {
        "articles_without_paragraphs": [],
        "orphan_notes": [],
        "empty_texts": [],
        "total_articles": 0,
        "total_paragraphs": 0,
        "total_notes": 0,
        "valid": True
    }
    
    all_note_refs = set()
    
    for part in manual.get("parts", []):
        for chapter in part.get("chapters", []):
            for article in chapter.get("articles", []):
                issues["total_articles"] += 1
                
                # Verifica se tem parágrafos
                structure = article.get("structure", [])
                if not structure:
                    issues["articles_without_paragraphs"].append(article["id"])
                    issues["valid"] = False
                
                issues["total_paragraphs"] += len(structure)
                
                # Verifica texto vazio
                if not article.get("text", "").strip():
                    issues["empty_texts"].append(article["id"])
                    issues["valid"] = False
                
                # Coleta referências de notas
                for note in article.get("notes", []):
                    all_note_refs.add(note["id"])
                    issues["total_notes"] += 1
    
    # Verifica notas órfãs (no índice mas não referenciadas)
    notes_index = manual.get("notesIndex", {})
    for note_id in notes_index:
        if note_id not in all_note_refs:
            issues["orphan_notes"].append(note_id)
    
    return issues


def main():
    # Caminhos
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    pdf_path = project_root / "references" / "Manual-Presbiteriano-2019.pdf"
    output_path = project_root / "apps" / "backend" / "src" / "assets" / "manual_2019.json"
    validation_path = project_root / "references" / "manual_2019_validation_report.json"
    
    if not pdf_path.exists():
        print(f"Erro: PDF não encontrado em {pdf_path}")
        return
    
    # Limpa o índice global de notas
    global notes_index
    notes_index = {}
    
    print(f"Extraindo texto do PDF: {pdf_path}")
    pages = extract_text_from_pdf(str(pdf_path))
    print(f"Total de páginas: {len(pages)}")
    
    print("Extraindo artigos com parágrafos e notas...")
    articles = extract_articles_from_pages(pages)
    print(f"Total de artigos encontrados: {len(articles)}")
    
    print("Construindo estrutura do manual...")
    manual = build_manual_structure(articles)
    
    # Valida a extração
    print("Validando extração...")
    validation = validate_extraction(manual)
    
    print(f"\n=== Relatório de Validação ===")
    print(f"Total de artigos: {validation['total_articles']}")
    print(f"Total de parágrafos: {validation['total_paragraphs']}")
    print(f"Total de notas: {validation['total_notes']}")
    print(f"Notas no índice: {len(manual.get('notesIndex', {}))}")
    
    if validation["articles_without_paragraphs"]:
        print(f"⚠️  Artigos sem parágrafos: {len(validation['articles_without_paragraphs'])}")
    if validation["empty_texts"]:
        print(f"⚠️  Artigos com texto vazio: {len(validation['empty_texts'])}")
    if validation["orphan_notes"]:
        print(f"⚠️  Notas órfãs: {len(validation['orphan_notes'])}")
    
    if validation["valid"]:
        print("✅ Extração válida!")
    else:
        print("❌ Extração com problemas - verifique o relatório")
    
    # Salva relatório de validação
    with open(validation_path, "w", encoding="utf-8") as f:
        json.dump(validation, f, ensure_ascii=False, indent=2)
    print(f"\nRelatório salvo em: {validation_path}")
    
    # Salva o JSON do manual
    print(f"Salvando JSON em: {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manual, f, ensure_ascii=False, indent=2)
    
    print("\n✅ Extração concluída!")


if __name__ == "__main__":
    main()
