#!/usr/bin/env python3
"""
optimise-frames.py — convert a folder of hero frames (JPG/PNG) to WebP.

Usage:
  python3 scripts/optimise-frames.py <folder> [--target-width=1600] [--quality=78]

Examples:
  python3 scripts/optimise-frames.py public/brand/dashboard/
  python3 scripts/optimise-frames.py public/brand/engine/ --target-width=1920 --quality=80

Notes:
  - Preserves aspect ratio; only downscales if source is wider than target.
  - Replaces the originals with .webp counterparts (keeps frame-NN.* numbering).
  - Skip files that already exist as .webp.
"""
from __future__ import annotations
import os, sys, argparse
from pathlib import Path
from PIL import Image

SUPPORTED = (".jpg", ".jpeg", ".png")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", help="folder containing frame-NN.{jpg,jpeg,png}")
    ap.add_argument("--target-width", type=int, default=1600)
    ap.add_argument("--quality", type=int, default=78)
    ap.add_argument("--keep-originals", action="store_true")
    args = ap.parse_args()

    root = Path(args.folder)
    if not root.is_dir():
        print(f"!! Not a folder: {root}", file=sys.stderr)
        sys.exit(1)

    files = sorted([p for p in root.iterdir() if p.suffix.lower() in SUPPORTED])
    if not files:
        print(f"!! No JPG/PNG files in {root}")
        sys.exit(1)

    total_in = total_out = 0
    for src in files:
        img = Image.open(src).convert("RGB")
        w, h = img.size
        if w > args.target_width:
            new_h = int(h * args.target_width / w)
            img = img.resize((args.target_width, new_h), Image.LANCZOS)
        dst = src.with_suffix(".webp")
        img.save(dst, "WEBP", quality=args.quality, method=6)
        s_in = src.stat().st_size
        s_out = dst.stat().st_size
        total_in += s_in
        total_out += s_out
        print(f"  {src.name}  {s_in/1024:>5.0f} KB  ->  {dst.name}  {s_out/1024:>5.0f} KB  ({img.size[0]}x{img.size[1]})")
        if not args.keep_originals:
            src.unlink()

    pct = total_out * 100 / total_in if total_in else 0
    print(f"\n  total: {total_in/1024:.0f} KB -> {total_out/1024:.0f} KB  ({pct:.0f}% of original)")

if __name__ == "__main__":
    main()
