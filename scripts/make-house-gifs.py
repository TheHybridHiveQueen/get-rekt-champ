"""Original house-loop GIFs for Get Rekt Champ. Props and type, not portraits."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path("/workspace/public/gifs")
W, H = 480, 360
INK = (20, 17, 14)
PAPER = (243, 236, 223)
DOT = (226, 214, 196)
REKT = (214, 58, 40)
GOLD = (226, 176, 67)
LEATHER = (42, 28, 22)

FONT = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 42)
SMALL = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 22)
TINY = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 16)


def canvas():
    im = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(im)
    for y in range(16, H - 12, 12):
        for x in range(16, W - 12, 12):
            draw.ellipse((x, y, x + 2, y + 2), fill=DOT)
    draw.rectangle((6, 6, W - 7, H - 7), outline=INK, width=5)
    return im, draw


def label(draw, top, bottom):
    draw.text((24, 18), top, font=FONT, fill=INK)
    draw.text((24, H - 62), bottom, font=SMALL, fill=REKT)


def stamp(draw, frame, text="REKT"):
    if frame < 6:
        return
    t = min(1, (frame - 6) / 3)
    size = int(18 + 10 * t)
    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", size)
    x, y = W - 132, 24
    draw.ellipse((x - 8, y - 4, x + 108, y + 46), outline=REKT, width=4)
    draw.text((x + 8, y + 4), text, font=font, fill=REKT)


def pack(frames, name):
    base = frames[0].quantize(colors=32, method=Image.Quantize.MEDIANCUT)
    pals = [frame.quantize(palette=base, dither=Image.Dither.NONE) for frame in frames]
    path = OUT / name
    pals[0].save(path, save_all=True, append_images=pals[1:], duration=90, loop=0, optimize=True, disposal=2)
    print(path.name, path.stat().st_size)


def rocket(frame, n=12):
    im, draw = canvas()
    label(draw, "3AM POST", "BEAT THE ROCKET")
    bob = int(8 * ((frame % 4) - 1.5))
    y = 118 + bob
    draw.polygon([(150, y + 70), (190, y), (230, y + 70)], fill=GOLD, outline=INK)
    draw.rectangle((168, y + 62, 212, y + 92), fill=INK)
    flame = 16 + (frame % 3) * 14
    draw.polygon([(176, y + 92), (190, y + 92 + flame), (204, y + 92)], fill=REKT)
    px = 280 + (frame * 6) % 40
    draw.rounded_rectangle((px, 200, px + 70, 270), radius=8, fill=INK)
    dots = "." * ((frame % 3) + 1)
    draw.text((px + 16, 220), dots, font=FONT, fill=GOLD)
    stamp(draw, frame)
    return im


def headset(frame, n=12):
    im, draw = canvas()
    label(draw, "METAVERSE", "NO LEGS INVITED")
    y = 130 + int(6 * ((frame % 4) - 1.5))
    draw.arc((150, y, 310, y + 70), 200, 340, fill=INK, width=10)
    draw.rounded_rectangle((138, y + 40, 188, y + 78), radius=10, fill=INK)
    draw.rounded_rectangle((272, y + 40, 322, y + 78), radius=10, fill=INK)
    draw.pieslice((176, y + 18, 284, y + 90), 20, 160, fill=(90, 170, 190), outline=INK)
    shoe = 20 + frame * 18
    draw.ellipse((shoe, 250, shoe + 46, 272), fill=GOLD, outline=INK)
    draw.ellipse((shoe + 36, 256, shoe + 78, 276), fill=GOLD, outline=INK)
    stamp(draw, frame)
    return im


def jacket(frame, n=12):
    im, draw = canvas()
    label(draw, "THE JACKET", "LEATHER AGAIN")
    grow = 1 + (frame % 4) * 0.04
    cx, cy = 210, 190
    w, h = int(90 * grow), int(110 * grow)
    draw.rounded_rectangle((cx - w, cy - h // 2, cx + w, cy + h // 2), radius=16, fill=LEATHER, outline=INK, width=3)
    draw.line((cx, cy - h // 2, cx, cy + h // 2), fill=GOLD, width=4)
    draw.polygon([(cx - w, cy - 20), (cx - w - 28, cy + 10), (cx - w, cy + 30)], fill=LEATHER, outline=INK)
    draw.polygon([(cx + w, cy - 20), (cx + w + 28, cy + 10), (cx + w, cy + 30)], fill=LEATHER, outline=INK)
    slide = -80 + frame * 28
    draw.rectangle((slide, 150, slide + 150, 186), fill=REKT)
    draw.text((slide + 12, 154), "SOLD OUT", font=SMALL, fill=PAPER)
    stamp(draw, frame)
    return im


def podium(frame, n=12):
    im, draw = canvas()
    label(draw, "THE SPEECH", "SAID IT LOUDER")
    words = ["BIG", "BIGGER", "BIGGEST"]
    word = words[min(frame // 3, 2)]
    size = 28 + frame * 2
    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", size)
    draw.rounded_rectangle((150, 168, 330, 250), radius=8, fill=GOLD, outline=INK, width=4)
    draw.rectangle((210, 250, 270, 290), fill=GOLD, outline=INK)
    draw.text((36, 100), word, font=font, fill=INK)
    stamp(draw, frame)
    return im


def table(frame, n=12):
    im, draw = canvas()
    label(draw, "THE MEETING", "BRING A TELESCOPE")
    length = 80 + frame * 26
    draw.polygon([(40, 230), (40 + length, 180), (40 + length, 200), (40, 250)], fill=(168, 132, 90), outline=INK)
    draw.rectangle((48, 188, 78, 250), fill=INK)
    far = 40 + length - 16
    draw.rectangle((far, 168, far + 10, 190), fill=REKT)
    stamp(draw, frame)
    return im


def boxes(frame, n=12):
    im, draw = canvas()
    label(draw, "THE THRONE", "CARDBOARD CROWN")
    wobble = int(4 * ((frame % 2) * 2 - 1))
    count = 1 + frame // 3
    for i in range(min(count, 4)):
        x = 150 + wobble * (i % 2)
        y = 250 - i * 42
        draw.rectangle((x, y, x + 160, y + 48), fill=(196, 154, 96), outline=INK, width=3)
        draw.line((x + 80, y, x + 80, y + 48), fill=INK, width=2)
    stamp(draw, frame)
    return im


def eras(frame, n=12):
    im, draw = canvas()
    label(draw, "NEW ERA", "GDP SAID THANKS")
    colors = [GOLD, REKT, INK, (90, 140, 170)]
    color = colors[frame % len(colors)]
    draw.rounded_rectangle((70, 120, 250, 250), radius=12, fill=PAPER, outline=INK, width=4)
    draw.rectangle((70, 120, 250, 156), fill=color)
    draw.text((92, 176), f"ERA {frame % 4 + 1}", font=FONT, fill=INK)
    draw.rounded_rectangle((280, 150, 420, 230), radius=10, fill=GOLD, outline=INK, width=3)
    draw.text((300, 172), "CHA-CHING", font=TINY, fill=INK)
    stamp(draw, frame)
    return im


def prize(frame, n=12):
    im, draw = canvas()
    label(draw, "THE BIT", "PRIZE FIRST")
    draw.rounded_rectangle((140, 200, 340, 270), radius=18, fill=REKT, outline=INK, width=4)
    draw.text((168, 214), "CHALLENGE", font=SMALL, fill=PAPER)
    for i in range(6):
        y = (frame * 22 + i * 36) % 180 + 70
        x = 60 + i * 60
        draw.rectangle((x, y, x + 36, y + 18), fill=GOLD, outline=INK)
    stamp(draw, frame)
    return im


def brow(frame, n=12):
    im, draw = canvas()
    label(draw, "THE EYEBROW", "ALREADY CAST")
    lift = max(0, 28 - frame * 3)
    draw.arc((120, 140 + lift, 220, 190 + lift), 200, 10, fill=INK, width=12)
    draw.arc((250, 140 + lift // 2, 360, 190 + lift // 2), 170, 20, fill=INK, width=14)
    draw.rounded_rectangle((150, 230, 330, 270), radius=8, fill=GOLD, outline=INK, width=4)
    draw.text((196, 236), "BELT", font=SMALL, fill=INK)
    stamp(draw, frame)
    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    scenes = {
        "rocket.gif": rocket,
        "headset.gif": headset,
        "jacket.gif": jacket,
        "podium.gif": podium,
        "table.gif": table,
        "boxes.gif": boxes,
        "eras.gif": eras,
        "prize.gif": prize,
        "brow.gif": brow,
    }
    for name, fn in scenes.items():
        pack([fn(frame) for frame in range(12)], name)


if __name__ == "__main__":
    main()
