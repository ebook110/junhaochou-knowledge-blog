"""Generate deterministic, text-free engineering cover art for the static site."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw

WIDTH, HEIGHT = 1600, 900
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "images" / "covers"

# Each article keeps its stable path while receiving one restrained accent and motif seed.
ASSETS = {
    "hero-engineering": ("#2557d6", 11),
    "vps-secure-ubuntu": ("#1e5f91", 21),
    "docker-sub2api": ("#17717a", 31),
    "network-client-formats": ("#3d5fa5", 41),
    "client-subscription-guide": ("#176d71", 46),
    "u-card-risk-basics": ("#a56318", 51),
    "ansys-codex-workflow": ("#6650a2", 61),
    "linux-service-checklist": ("#27734f", 71),
    "tools-reliable-resources": ("#26737d", 81),
    "knowledge-base-method": ("#385f9e", 91),
}

PAPER = (247, 248, 250)
PANEL = (255, 255, 255)
INK = (17, 24, 39)
MUTED = (95, 107, 122)
LINE = (220, 225, 232)


def rgb(hex_value: str) -> tuple[int, int, int]:
    return tuple(int(hex_value[index : index + 2], 16) for index in (1, 3, 5))


def draw_grid(draw: ImageDraw.ImageDraw) -> None:
    """A real measurement field: sparse datum lines, not decorative wallpaper."""
    for x in range(80, WIDTH, 80):
        weight = 2 if x % 320 == 0 else 1
        draw.line((x, 72, x, HEIGHT - 72), fill=(*LINE, 92 if weight == 2 else 48), width=weight)
    for y in range(72, HEIGHT, 72):
        weight = 2 if y % 288 == 0 else 1
        draw.line((72, y, WIDTH - 72, y), fill=(*LINE, 92 if weight == 2 else 48), width=weight)


def draw_frame(draw: ImageDraw.ImageDraw, accent: tuple[int, int, int], seed: int) -> None:
    draw.rectangle((48, 48, WIDTH - 48, HEIGHT - 48), outline=(*INK, 210), width=2)
    draw.line((48, 132, WIDTH - 48, 132), fill=(*INK, 185), width=2)
    draw.rectangle((48, 48, 176, 132), fill=(*accent, 230))
    for offset, length in ((0, 220), (28, 160), (56, 98)):
        draw.rounded_rectangle(
            (218, 67 + offset, 218 + length, 76 + offset), radius=4, fill=(*INK, 165 - offset)
        )
    # Stable seed code expressed as measurement ticks, never rendered text.
    tick_count = 5 + seed % 7
    for index in range(tick_count):
        x = WIDTH - 70 - index * 18
        draw.line((x, 93, x, 118), fill=(*accent, 220), width=3)


def draw_tensile_specimen(
    draw: ImageDraw.ImageDraw, accent: tuple[int, int, int], y: int, width: int = 1180
) -> None:
    x0 = (WIDTH - width) // 2
    x1 = x0 + width
    shoulder = 185
    waist = 37
    half = 74
    points = [
        (x0, y - half),
        (x0 + shoulder, y - half),
        (x0 + shoulder + 76, y - waist),
        (x1 - shoulder - 76, y - waist),
        (x1 - shoulder, y - half),
        (x1, y - half),
        (x1, y + half),
        (x1 - shoulder, y + half),
        (x1 - shoulder - 76, y + waist),
        (x0 + shoulder + 76, y + waist),
        (x0 + shoulder, y + half),
        (x0, y + half),
    ]
    draw.polygon(points, fill=(*PANEL, 238), outline=(*INK, 225))
    draw.line((x0 + shoulder + 76, y, x1 - shoulder - 76, y), fill=(*accent, 235), width=5)
    draw.line((x0 + shoulder + 76, y - 88, x1 - shoulder - 76, y - 88), fill=(*MUTED, 150), width=2)
    for x in (x0 + shoulder + 76, x1 - shoulder - 76):
        draw.line((x, y - 103, x, y - 72), fill=(*MUTED, 175), width=2)


def draw_curve(
    draw: ImageDraw.ImageDraw, accent: tuple[int, int, int], rng: random.Random, origin: tuple[int, int]
) -> None:
    x0, y0 = origin
    draw.line((x0, y0 - 210, x0, y0), fill=(*INK, 190), width=2)
    draw.line((x0, y0, x0 + 330, y0), fill=(*INK, 190), width=2)
    points: list[tuple[float, float]] = []
    for index in range(44):
        t = index / 43
        x = x0 + 18 + t * 292
        response = (1 - math.exp(-5.2 * t)) * (1 - 0.22 * max(0, t - 0.68) / 0.32)
        y = y0 - 18 - response * 170 + rng.uniform(-2.5, 2.5)
        points.append((x, y))
    draw.line(points, fill=(*accent, 240), width=6, joint="curve")
    for x, y in points[::7]:
        draw.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(*PANEL, 255), outline=(*accent, 230), width=3)


def draw_network(
    draw: ImageDraw.ImageDraw, accent: tuple[int, int, int], rng: random.Random, center: tuple[int, int]
) -> None:
    cx, cy = center
    points: list[tuple[float, float]] = []
    for ring, count in ((76, 5), (148, 8), (220, 11)):
        for index in range(count):
            angle = math.tau * index / count + rng.uniform(-0.12, 0.12)
            points.append((cx + math.cos(angle) * ring, cy + math.sin(angle) * ring * 0.72))
    for index, point in enumerate(points):
        distances = sorted(
            (math.dist(point, candidate), candidate)
            for candidate in points
            if candidate != point
        )[:2]
        for _, candidate in distances:
            draw.line((*point, *candidate), fill=(*INK, 65), width=2)
        radius = 8 if index % 3 else 13
        draw.ellipse(
            (point[0] - radius, point[1] - radius, point[0] + radius, point[1] + radius),
            fill=(*accent, 225 if index % 3 else 255),
            outline=(*PANEL, 240),
            width=3,
        )


def draw_modules(
    draw: ImageDraw.ImageDraw, accent: tuple[int, int, int], rng: random.Random, top: int
) -> None:
    widths = [rng.randint(155, 260) for _ in range(4)]
    x = 175
    for index, module_width in enumerate(widths):
        height = 94 + (index % 2) * 34
        draw.rounded_rectangle(
            (x, top, x + module_width, top + height),
            radius=8,
            fill=(*PANEL, 248),
            outline=(*INK, 130),
            width=2,
        )
        draw.rectangle((x, top, x + 13, top + height), fill=(*accent, 210))
        draw.line((x + 38, top + 34, x + module_width - 25, top + 34), fill=(*INK, 120), width=5)
        draw.line((x + 38, top + 62, x + module_width - 72, top + 62), fill=(*MUTED, 90), width=3)
        if index < len(widths) - 1:
            draw.line((x + module_width, top + height // 2, x + module_width + 42, top + height // 2), fill=(*accent, 180), width=3)
        x += module_width + 42


def cover(name: str, accent_hex: str, seed: int) -> None:
    rng = random.Random(seed)
    accent = rgb(accent_hex)
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_grid(draw)
    draw_frame(draw, accent, seed)

    motif = seed % 4
    if motif == 0:
        draw_tensile_specimen(draw, accent, 420)
        draw_curve(draw, accent, rng, (170, 760))
        draw_network(draw, accent, rng, (1165, 690))
    elif motif == 1:
        draw_network(draw, accent, rng, (1040, 465))
        draw_curve(draw, accent, rng, (170, 715))
        draw_modules(draw, accent, rng, 230)
    elif motif == 2:
        draw_modules(draw, accent, rng, 246)
        draw_tensile_specimen(draw, accent, 650, width=1260)
    else:
        draw_tensile_specimen(draw, accent, 390, width=1110)
        draw_network(draw, accent, rng, (1160, 680))
        draw_curve(draw, accent, rng, (170, 760))

    image.save(OUTPUT / f"{name}.webp", "WEBP", quality=90, method=6)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, (accent, seed) in ASSETS.items():
        cover(name, accent, seed)


if __name__ == "__main__":
    main()
