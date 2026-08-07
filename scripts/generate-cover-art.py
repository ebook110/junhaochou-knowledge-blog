"""Generate local, text-free abstract cover art for the static site."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

WIDTH, HEIGHT = 1600, 900
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "images" / "covers"

ASSETS = {
    "hero-engineering": ("#0f5b9b", "#13a4c7", 11),
    "vps-secure-ubuntu": ("#175f91", "#2896c9", 21),
    "docker-sub2api": ("#146c77", "#24aab0", 31),
    "network-client-formats": ("#365b9b", "#5687e7", 41),
    "u-card-risk-basics": ("#9a5a1a", "#d69a37", 51),
    "ansys-codex-workflow": ("#6a4a9c", "#9671c7", 61),
    "linux-service-checklist": ("#24734d", "#47aa76", 71),
    "tools-reliable-resources": ("#287681", "#46a6ad", 81),
    "knowledge-base-method": ("#355f9a", "#658fd1", 91),
}


def rgb(hex_value: str) -> tuple[int, int, int]:
    return tuple(int(hex_value[index : index + 2], 16) for index in (1, 3, 5))


def cover(name: str, base_hex: str, accent_hex: str, seed: int) -> None:
    random.seed(seed)
    base, accent = rgb(base_hex), rgb(accent_hex)
    image = Image.new("RGB", (WIDTH, HEIGHT), (242, 247, 250))
    pixels = image.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            wave = 0.5 + 0.5 * math.sin(x / 125 + y / 240)
            amount = (x / WIDTH) * 0.82 + (y / HEIGHT) * 0.12 + wave * 0.06
            pixels[x, y] = tuple(int(244 * (1 - amount) + value * amount) for value in base)

    draw = ImageDraw.Draw(image, "RGBA")
    for x in range(-120, WIDTH + 120, 80):
        draw.line((x, 0, x + 230, HEIGHT), fill=(*accent, 31), width=2)
    for y in range(0, HEIGHT + 1, 75):
        draw.line((0, y, WIDTH, y), fill=(*base, 28), width=1)

    origin_x, origin_y = WIDTH * 0.62, HEIGHT * 0.48
    points: list[tuple[float, float]] = []
    for ring, count in ((120, 5), (235, 8), (360, 12)):
        for index in range(count):
            angle = (math.tau / count) * index + random.uniform(-0.12, 0.12)
            points.append((origin_x + math.cos(angle) * ring, origin_y + math.sin(angle) * ring * 0.72))
    for point in points:
        target = random.choice(points)
        draw.line((*point, *target), fill=(*accent, random.randint(36, 92)), width=2)
    for x, y in points:
        radius = random.randint(7, 15)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*accent, 210))
        draw.ellipse((x - radius / 2, y - radius / 2, x + radius / 2, y + radius / 2), fill=(244, 249, 252, 220))

    for index in range(4):
        offset = index * 46
        draw.rounded_rectangle(
            (74, 78 + offset, 480 - offset * 0.35, 106 + offset),
            radius=8,
            fill=(*base, 45 + index * 12),
        )
    image = image.filter(ImageFilter.GaussianBlur(radius=0.15))
    image.save(OUTPUT / f"{name}.webp", "WEBP", quality=88, method=6)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, (base, accent, seed) in ASSETS.items():
        cover(name, base, accent, seed)


if __name__ == "__main__":
    main()
