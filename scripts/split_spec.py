#!/usr/bin/env python3
"""Split the master K2Tech AI Lab specification into service-specific docs."""
from __future__ import annotations

import argparse
import pathlib
import re
import textwrap
import unicodedata
from typing import Iterable, Tuple


HEADER_PATTERN = re.compile(r"^###\s+(5\.\d+)\s+(.+)$", re.MULTILINE)


def slugify(text: str) -> str:
    """Create a filesystem-friendly slug preserving digits."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def iter_sections(markdown: str) -> Iterable[Tuple[str, str, str]]:
    """Yield (number, title, body) tuples for each 5.x section."""
    matches = list(HEADER_PATTERN.finditer(markdown))
    for idx, match in enumerate(matches):
        number, title = match.group(1), match.group(2).strip()
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown)
        body = markdown[start:end].strip("\n")
        yield number, title, body


def write_section(number: str, title: str, body: str, output_dir: pathlib.Path) -> None:
    slug = slugify(title)
    filename = f"{number.replace('.', '-')}-{slug}.md"
    output_path = output_dir / filename
    header = f"# {number} {title}\n\n"
    disclaimer = (
        "> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.\n"
        "> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации."
    )
    content = f"{header}{disclaimer}\n\n{body.strip()}\n"
    output_path.write_text(content, encoding="utf-8")


def build_index(sections: Iterable[Tuple[str, str, str]], output_dir: pathlib.Path) -> None:
    output_path = output_dir / "README.md"
    lines = ["# Модули и сервисы", ""]
    lines.append(
        textwrap.dedent(
            """
            Ниже перечислены все сервисы, выделенные из мастер-спецификации. Каждый раздел генерируется
            автоматически скриптом `scripts/split_spec.py`.
            """
        ).strip()
    )
    lines.append("")
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
        default=pathlib.Path("k_2_tech_ai_lab_полная_спецификация_v_1 (1).md"),
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

    sections = list(iter_sections(markdown))
    for number, title, body in sections:
        write_section(number, title, body, args.output)

    build_index(sections, args.output)


if __name__ == "__main__":
    main()
