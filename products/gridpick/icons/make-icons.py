#!/usr/bin/env python3
"""Draw the Gridpick icon and write PNGs. No dependencies.

The icon is a stack of rounded rectangles, so it is drawn by supersampling a
coverage mask 4x and compositing — sharper at 16px than a browser downscale,
and identical on every machine.
"""
import struct, zlib, os

SS = 4  # supersample factor

# (x, y, w, h, radius, rgb, alpha) on a 128x128 grid
SHAPES = [
    (0,   0, 128, 128, 28, (0x0F, 0x14, 0x19), 1.0),   # body
    (24, 26,  80,  18,  4, (0xF3, 0x9C, 0x12), 1.0),   # header bar
    (24, 52,  34,  16,  3, (0x3A, 0x42, 0x4C), 1.0),   # left column
    (24, 76,  34,  16,  3, (0x3A, 0x42, 0x4C), 1.0),
    (24,100,  34,  10,  3, (0x2A, 0x31, 0x3A), 1.0),
    (66, 52,  38,  16,  3, (0xF3, 0x9C, 0x12), 0.95),  # picked column
    (66, 76,  38,  16,  3, (0xF3, 0x9C, 0x12), 0.70),
    (66,100,  38,  10,  3, (0xF3, 0x9C, 0x12), 0.40),
]


def inside(px, py, x, y, w, h, r):
    """Is this point inside the rounded rect?"""
    if not (x <= px < x + w and y <= py < y + h):
        return False
    for cx, cy in ((x + r, y + r), (x + w - r, y + r), (x + r, y + h - r), (x + w - r, y + h - r)):
        # Only the corner quadrants are curved.
        if (px < x + r or px > x + w - r) and (py < y + r or py > y + h - r):
            near = min(
                ((px - ax) ** 2 + (py - ay) ** 2)
                for ax, ay in ((x + r, y + r), (x + w - r, y + r), (x + r, y + h - r), (x + w - r, y + h - r))
            )
            return near <= r * r
    return True


def render(size):
    scale = 128.0 / (size * SS)
    # Straight (non-premultiplied) RGBA accumulation.
    buf = [[0.0, 0.0, 0.0, 0.0] for _ in range(size * size)]

    for sy in range(size * SS):
        for sx in range(size * SS):
            px, py = (sx + 0.5) * scale, (sy + 0.5) * scale
            r = g = b = a = 0.0
            for (x, y, w, h, rad, rgb, alpha) in SHAPES:
                if inside(px, py, x, y, w, h, rad):
                    sr, sg, sb = (c / 255.0 for c in rgb)
                    # source-over
                    na = alpha + a * (1 - alpha)
                    if na > 0:
                        r = (sr * alpha + r * a * (1 - alpha)) / na
                        g = (sg * alpha + g * a * (1 - alpha)) / na
                        b = (sb * alpha + b * a * (1 - alpha)) / na
                    a = na
            i = (sy // SS) * size + (sx // SS)
            buf[i][0] += r * a; buf[i][1] += g * a; buf[i][2] += b * a; buf[i][3] += a

    n = SS * SS
    rows = []
    for y in range(size):
        row = bytearray([0])  # filter byte
        for x in range(size):
            pr, pg, pb, pa = (v / n for v in buf[y * size + x])
            if pa > 0.0001:
                row += bytes((
                    min(255, int(round(pr / pa * 255))),
                    min(255, int(round(pg / pa * 255))),
                    min(255, int(round(pb / pa * 255))),
                    min(255, int(round(pa * 255))),
                ))
            else:
                row += b"\0\0\0\0"
        rows.append(bytes(row))
    return b"".join(rows)


def png(size, raw):
    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


here = os.path.dirname(os.path.abspath(__file__))
for s in (16, 32, 48, 128):
    with open(os.path.join(here, f"{s}.png"), "wb") as f:
        f.write(png(s, render(s)))
    print(f"wrote {s}.png")
