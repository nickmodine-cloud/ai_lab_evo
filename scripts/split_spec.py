#!/usr/bin/env python3
"""Split the master specification into per-service markdown files with UI guidelines."""

from __future__ import annotations

import argparse
import pathlib
import re
import textwrap
import unicodedata
from typing import Iterable, Tuple


HEADER_PATTERN = re.compile(r"^###\s+(5\.\d+)\s+(.+)$", re.MULTILINE)
SECTION_4_PATTERN = re.compile(r"^##\s+4\.\s+.+$", re.MULTILINE)
SECTION_5_PATTERN = re.compile(r"^##\s+5\.\s+.+$", re.MULTILINE)


def slugify(text: str) -> str:
    """Create a filesystem-safe slug that keeps digits intact."""
    normalised = unicodedata.normalize("NFKD", text)
    without_diacritics = "".join(ch for ch in normalised if not unicodedata.combining(ch))
    lowered = without_diacritics.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return slug


def extract_global_frontend(markdown: str) -> str:
    """Return the general frontend guidance block from section 4."""
    match_section4 = SECTION_4_PATTERN.search(markdown)
    match_section5 = SECTION_5_PATTERN.search(markdown)
    if not match_section4:
        return ""
    start = match_section4.end()
    end = match_section5.start() if match_section5 else len(markdown)
    block = markdown[start:end].strip()
    if not block:
        return ""

    # Normalise the heading to avoid numbering duplication inside service docs.
    lines = block.splitlines()
    heading = "## Глобальные элементы UI/UX (общие инструкции)"
    # Skip leading separators or blank lines when rebuilding the block.
    trimmed_lines = [line for line in lines if line.strip()]
    body = "\n".join(trimmed_lines)
    # Replace the original first heading with our normalised version.
    body = re.sub(r"^#+\s+4\.[^\n]*", heading, body, count=1)
    if heading not in body:
        body = f"{heading}\n\n{block}"
    return body.strip()


def iter_sections(markdown: str) -> Iterable[Tuple[str, str, str]]:
    """Yield (number, title, body) tuples for each 5.x section."""
    matches = list(HEADER_PATTERN.finditer(markdown))
    for idx, match in enumerate(matches):
        number, raw_title = match.group(1), match.group(2).strip()
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown)
        body = markdown[start:end].strip("\n")
        yield number, raw_title, body


def write_section(
    number: str,
    title: str,
    body: str,
    frontend_block: str,
    output_dir: pathlib.Path,
) -> None:
    slug = slugify(title)
    filename = f"{number.replace('.', '-')}-{slug}.md"
    output_path = output_dir / filename

    header = f"# {number} {title}\n\n"
    disclaimer = textwrap.dedent(
        """
        > Автоматически сгенерировано из файла `initial requirements.md`.
        > Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.
        """
    ).strip()

    sections = [header.rstrip(), disclaimer]
    if frontend_block:
        sections.append(frontend_block)
    sections.append(body.strip())

    output_path.write_text("\n\n".join(sections) + "\n", encoding="utf-8")


def build_index(sections: Iterable[Tuple[str, str, str]], output_dir: pathlib.Path) -> None:
    output_path = output_dir / "README.md"

    lines = [
        "# Модули и сервисы",
        "",
        textwrap.dedent(
            """
            Ниже перечислены все сервисы, выделенные из мастер-спецификации. Каждый раздел
            генерируется автоматически скриптом `scripts/split_spec.py`.
            """
        ).strip(),
        "",
    ]

    for number, title, _ in sections:
        slug = slugify(title)
        filename = f"{number.replace('.', '-')}-{slug}.md"
        lines.append(f"- [{number} {title}]({filename})")

    lines.append("")
    output_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=pathlib.Path,
        default=pathlib.Path("initial requirements.md"),
        help="Путь к исходному файлу спецификации.",
    )
    parser.add_argument(
        "--output",
        type=pathlib.Path,
        default=pathlib.Path("docs/services"),
        help="Директория для сохранения разделов.",
    )
    args = parser.parse_args()

    markdown = args.input.read_text(encoding="utf-8")
    args.output.mkdir(parents=True, exist_ok=True)

    frontend_block = extract_global_frontend(markdown)
    sections = list(iter_sections(markdown))

    for number, title, body in sections:
        write_section(number, title, body, frontend_block, args.output)

    build_index(sections, args.output)


if __name__ == "__main__":
    main()
