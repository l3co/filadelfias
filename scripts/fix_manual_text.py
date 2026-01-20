#!/usr/bin/env python3
"""
Script para revisar e corrigir textos do Manual Presbiteriano 2019.
Corrige espaços extras, hifenização incorreta e melhora formatação.
"""

import json
import re
from pathlib import Path


def fix_hyphenation(text: str) -> str:
    """Remove hifenização incorreta de quebra de linha."""
    # Remove hífen seguido de espaço (quebra de linha do PDF)
    text = re.sub(r'-\s+', '', text)
    # Remove espaços antes de hífen no meio de palavras
    text = re.sub(r'\s+-\s*', '-', text)
    return text


def fix_multiple_spaces(text: str) -> str:
    """Remove espaços múltiplos."""
    return re.sub(r'\s{2,}', ' ', text)


def fix_spacing_around_punctuation(text: str) -> str:
    """Corrige espaçamento ao redor de pontuação."""
    # Remove espaço antes de pontuação
    text = re.sub(r'\s+([.,;:!?\)])', r'\1', text)
    # Adiciona espaço após pontuação se não houver
    text = re.sub(r'([.,;:!?])([A-Za-zÀ-ÿ])', r'\1 \2', text)
    # Remove espaço após parêntese de abertura
    text = re.sub(r'\(\s+', '(', text)
    # Remove espaço antes de parêntese de fechamento
    text = re.sub(r'\s+\)', ')', text)
    return text


def fix_quotes(text: str) -> str:
    """Padroniza aspas."""
    # Converte aspas curvas para retas
    text = text.replace('"', '"')
    text = text.replace('"', '"')
    text = text.replace(''', "'")
    text = text.replace(''', "'")
    return text


def fix_numbers_and_references(text: str) -> str:
    """Corrige formatação de números e referências."""
    # Adiciona espaço após número de artigo no início
    text = re.sub(r'^(\d+)\s*([A-Z])', r'\1 \2', text)
    # Corrige "Art." sem espaço
    text = re.sub(r'Art\.(\d)', r'Art. \1', text)
    # Corrige "§" sem espaço
    text = re.sub(r'§(\d)', r'§ \1', text)
    return text


def fix_paragraph_markers(text: str) -> str:
    """Melhora formatação de marcadores de parágrafo."""
    # Adiciona quebra antes de § se não houver
    text = re.sub(r'([.;])\s*(§\s*\d)', r'\1\n\2', text)
    # Adiciona quebra antes de alíneas a), b), etc.
    text = re.sub(r'([.;:])\s*([a-z]\))', r'\1\n\2', text)
    return text


def clean_pdf_artifacts(text: str) -> str:
    """Remove artefatos da extração do PDF."""
    # Remove números de página soltos
    text = re.sub(r'\s+\d+\s+–\s+Manual Presbiteriano', '', text)
    text = re.sub(r'Manual Presbiteriano\s+–\s+\d+', '', text)
    text = re.sub(r'Constituição\s+–\s+\d+', '', text)
    # Remove referências de rodapé duplicadas no meio do texto
    text = re.sub(r'(\d+)\s+Art\.\s+\d+[º°]?\s+do\s+estatuto[^.]*\.', '', text)
    return text


def fix_common_ocr_errors(text: str) -> str:
    """Corrige erros comuns de OCR."""
    replacements = {
        ' ,': ',',
        ' .': '.',
        ' ;': ';',
        ' :': ':',
        '( ': '(',
        ' )': ')',
        '  ': ' ',
        '- -': '-',
        ' - ': '-',
        'ção ': 'ção ',
        'são ': 'são ',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def process_text(text: str) -> str:
    """Aplica todas as correções ao texto."""
    if not text:
        return text
    
    # Aplica correções em ordem
    text = fix_hyphenation(text)
    text = clean_pdf_artifacts(text)
    text = fix_multiple_spaces(text)
    text = fix_spacing_around_punctuation(text)
    text = fix_quotes(text)
    text = fix_numbers_and_references(text)
    text = fix_common_ocr_errors(text)
    
    # Limpa espaços no início e fim
    text = text.strip()
    
    # Remove espaços múltiplos novamente (pode ter criado novos)
    text = fix_multiple_spaces(text)
    
    return text


def process_article(article: dict) -> dict:
    """Processa um artigo, corrigindo texto e estrutura."""
    if 'text' in article:
        article['text'] = process_text(article['text'])
    
    if 'structure' in article:
        for item in article['structure']:
            if 'text' in item:
                item['text'] = process_text(item['text'])
    
    if 'notes' in article:
        for note in article['notes']:
            if 'text' in note:
                note['text'] = process_text(note['text'])
    
    return article


def main():
    # Caminhos
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    json_path = project_root / "apps" / "backend" / "src" / "assets" / "manual_2019.json"
    
    print(f"Carregando JSON: {json_path}")
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)
    
    # Processa todos os artigos
    articles_processed = 0
    for part in data.get("parts", []):
        for chapter in part.get("chapters", []):
            for article in chapter.get("articles", []):
                process_article(article)
                articles_processed += 1
            
            for section in chapter.get("sections", []):
                for article in section.get("articles", []):
                    process_article(article)
                    articles_processed += 1
    
    print(f"Artigos processados: {articles_processed}")
    
    # Salva o JSON corrigido
    print(f"Salvando JSON corrigido: {json_path}")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Revisão concluída!")


if __name__ == "__main__":
    main()
