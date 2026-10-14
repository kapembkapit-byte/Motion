"""Pub vidéo verticale (1080x1920) — Smart Watch Série 10 KW90 MAX — Kuwej.

Inspirée du format "Apple Watch Series 11" : fond gris clair, logo en haut,
montre au centre dont l'écran change au rythme de la musique, puis plans
lifestyle et appel à l'action final.

Usage : python3 make_ad.py   (nécessite Pillow, numpy et ffmpeg)
"""
import math
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
LOGO = HERE.parent / "logo kuwej.com.png"
OUT = HERE / "kuwej_smartwatch_serie10_pub.mp4"
AUDIO = HERE / "build_audio.wav"

# --- Textes / offre (modifiables) -------------------------------------------
TITLE_1 = "Smart Watch"
TITLE_2 = "Série 10"
PRICE = "19$"
OLD_PRICE = "89$"
WHATSAPP = "+243 97 5999 488"
SITE = "kuwej.com"

W, H, FPS = 1080, 1920, 30
BG = (237, 237, 237)
INK = (29, 29, 31)
GREY = (110, 110, 115)
BLUE = (26, 79, 201)  # bulle du logo Kuwej
WA_GREEN = (37, 211, 102)

FONT_DIR = Path("/usr/share/fonts/opentype/inter")


def font(name, size):
    return ImageFont.truetype(str(FONT_DIR / f"{name}.otf"), size)


# --- Easing -------------------------------------------------------------------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def back_out(x, s=1.6):
    x = clamp(x)
    return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2


# --- Helpers d'image ------------------------------------------------------------
def affine(src, scale, src_c, dst_c, size=(W, H), fill=BG):
    """Place `src` (centre src_c) au point dst_c du canevas, à l'échelle `scale`."""
    sx, sy = src_c
    dx, dy = dst_c
    inv = 1.0 / scale
    return src.transform(size, Image.AFFINE,
                         (inv, 0, sx - dx * inv, 0, inv, sy - dy * inv),
                         resample=Image.BICUBIC, fillcolor=fill)


_text_cache = {}


def text_img(text, fnt, color):
    key = (text, fnt.path, fnt.size, color)
    if key not in _text_cache:
        l, t, r, b = fnt.getbbox(text)
        im = Image.new("RGBA", (r - l + 4, b - t + 4), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((2 - l, 2 - t), text, font=fnt, fill=color)
        _text_cache[key] = im
    return _text_cache[key]


def paste_alpha(canvas, layer, xy, opacity=1.0):
    if opacity <= 0:
        return
    if opacity < 1:
        layer = layer.copy()
        a = layer.getchannel("A").point(lambda v: int(v * opacity))
        layer.putalpha(a)
    canvas.alpha_composite(layer, (int(round(xy[0])), int(round(xy[1]))))


def text_center(canvas, text, fnt, color, cy, opacity=1.0, dy=0, cx=W / 2):
    im = text_img(text, fnt, color)
    paste_alpha(canvas, im, (cx - im.width / 2, cy - im.height / 2 + dy), opacity)
    return im


def appear(t, start, dur=0.45):
    """(opacité, décalage vertical) pour une entrée en fondu + glissement."""
    p = ease_out((t - start) / dur)
    return p, (1 - p) * 40


# --- Montre (image 1) avec écran remplaçable -----------------------------------------
SRC_WATCH = Image.open(ASSETS / "1.png").convert("RGB")
SCREEN_BOX = (320, 320, 756, 796)  # zone verre noir dans l'image 1080x1080
SW, SH = SCREEN_BOX[2] - SCREEN_BOX[0], SCREEN_BOX[3] - SCREEN_BOX[1]
SCREEN_R = 82
ORIGINAL_FACE = SRC_WATCH.crop(SCREEN_BOX)

WATCH_BASE = SRC_WATCH.copy()
# efface le pictogramme "3 bracelets" en bas à droite
ImageDraw.Draw(WATCH_BASE).rectangle((800, 860, 1000, 1000), fill=BG)

SCREEN_MASK = Image.new("L", (SW * 4, SH * 4), 0)
ImageDraw.Draw(SCREEN_MASK).rounded_rectangle((0, 0, SW * 4 - 1, SH * 4 - 1), SCREEN_R * 4, fill=255)
SCREEN_MASK = SCREEN_MASK.resize((SW, SH), Image.LANCZOS)


def watch_with_screen(screen_rgb):
    im = WATCH_BASE.copy()
    im.paste(screen_rgb, SCREEN_BOX[:2], SCREEN_MASK)
    return im


# --- Écrans de la montre (dessinés en 2x puis réduits pour l'anti-crénelage) -----
SS = 2
S_W, S_H = SW * SS, SH * SS


def new_screen():
    im = Image.new("RGB", (S_W, S_H), (0, 0, 0))
    return im, ImageDraw.Draw(im)


def finish(im):
    return im.resize((SW, SH), Image.LANCZOS)


def status_time(d, color=(255, 255, 255)):
    f = font("Inter-SemiBold", 44)
    txt = "10:09"
    w = d.textlength(txt, font=f)
    d.text((S_W - 90 - w, 52), txt, font=f, fill=color)


def screen_face(t):
    # cadran d'origine avec une légère respiration lumineuse
    k = 1.0 + 0.12 * math.sin(t * 4)
    arr = np.asarray(ORIGINAL_FACE).astype(np.float32) * k
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


def screen_clock(t):
    im, d = new_screen()
    glow = Image.new("RGB", (S_W, S_H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((S_W * 0.1, S_H * 0.25, S_W * 0.9, S_H * 0.95), fill=(20, 60, 140))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(120)), 0.9)
    d = ImageDraw.Draw(im)
    fd = font("Inter-Medium", 42)
    d.text((S_W / 2, 150), "MAR. 14 OCT.", font=fd, fill=(255, 159, 10), anchor="mm")
    fb = font("InterDisplay-SemiBold", 250)
    colon = (255, 255, 255) if (t % 1.0) < 0.5 else (90, 90, 95)
    d.text((S_W / 2 - 40, 430), "10", font=fb, fill=(255, 255, 255), anchor="rm")
    d.text((S_W / 2, 410), ":", font=fb, fill=colon, anchor="mm")
    d.text((S_W / 2 + 40, 430), "09", font=fb, fill=(255, 255, 255), anchor="lm")
    # complications
    y = 700
    for i, (col, lab, val) in enumerate([((255, 55, 95), "BPM", "72"),
                                         ((48, 209, 88), "PAS", "8,5k"),
                                         ((100, 210, 255), "BAT", "96%")]):
        cx = S_W / 2 + (i - 1) * 250
        d.ellipse((cx - 90, y - 90, cx + 90, y + 90), outline=(60, 60, 64), width=12)
        sweep = -90 + 300 * ease_out(t / 0.9) * (0.6 + 0.15 * i)
        d.arc((cx - 90, y - 90, cx + 90, y + 90), -90, sweep, fill=col, width=12)
        d.text((cx, y - 8), val, font=font("Inter-SemiBold", 46), fill=(255, 255, 255), anchor="mm")
        d.text((cx, y + 40), lab, font=font("Inter-Medium", 24), fill=col, anchor="mm")
    return finish(im)


def handset(d, cx, cy, r, color, angle):
    """Combiné téléphonique stylisé (arc épais à bouts ronds)."""
    a0, a1 = angle - 70, angle + 70
    w = int(r * 0.42)
    d.arc((cx - r, cy - r, cx + r, cy + r), a0, a1, fill=color, width=w)
    for a in (a0, a1):
        rad = math.radians(a)
        px = cx + (r - w / 2) * math.cos(rad)
        py = cy + (r - w / 2) * math.sin(rad)
        d.ellipse((px - w * 0.62, py - w * 0.62, px + w * 0.62, py + w * 0.62), fill=color)


def screen_call(t):
    im, d = new_screen()
    status_time(d)
    d.text((S_W / 2, 150), "Appel entrant…", font=font("Inter-Medium", 44), fill=(160, 160, 165), anchor="mm")
    # avatar
    cx, cy, r = S_W / 2, 360, 120
    pulse = 1 + 0.06 * math.sin(t * 9)
    for k in range(3):  # ondes
        rr = r * (1.15 + ((t * 0.9 + k / 3) % 1) * 0.6)
        a = int(120 * (1 - ((t * 0.9 + k / 3) % 1)))
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(a // 3, a, a // 2), width=5)
    d.ellipse((cx - r * pulse, cy - r * pulse, cx + r * pulse, cy + r * pulse), fill=(88, 86, 214))
    d.text((cx, cy), "M", font=font("Inter-SemiBold", 120), fill=(255, 255, 255), anchor="mm")
    d.text((S_W / 2, 560), "Maman", font=font("Inter-SemiBold", 70), fill=(255, 255, 255), anchor="mm")
    # boutons
    by = 790
    for x, col, ang in ((S_W / 2 - 190, (255, 59, 48), 90), (S_W / 2 + 190, (48, 209, 88), 135)):
        s = 1 + (0.08 * math.sin(t * 10) if col[1] == 209 else 0)
        rb = 95 * s
        d.ellipse((x - rb, by - rb, x + rb, by + rb), fill=col)
        handset(d, x, by + (20 if ang == 90 else 0), 46, (255, 255, 255), ang + 180 if ang == 90 else ang)
    return finish(im)


def screen_notifs(t):
    im, d = new_screen()
    status_time(d)
    d.text((70, 60), "Notifications", font=font("Inter-SemiBold", 44), fill=(255, 255, 255))
    cards = [((37, 211, 102), "WhatsApp", "Commande confirmée !"),
             (BLUE, "Kuwej", "Votre colis arrive"),
             ((255, 159, 10), "Rappel", "Réunion à 11:00")]
    for i, (col, app, msg) in enumerate(cards):
        p = ease_out((t - 0.12 - i * 0.22) / 0.35)
        if p <= 0:
            continue
        y = 170 + i * 250 + (1 - p) * 120
        x0, x1 = 50, S_W - 50
        shade = int(44 * p)
        d.rounded_rectangle((x0, y, x1, y + 220), 50, fill=(shade, shade, shade + 2))
        d.ellipse((x0 + 35, y + 35, x0 + 115, y + 115), fill=tuple(int(c * p) for c in col))
        d.text((x0 + 140, y + 48), app.upper(), font=font("Inter-SemiBold", 34),
               fill=tuple(int(c * p) for c in (170, 170, 175)))
        d.text((x0 + 40, y + 140), msg, font=font("Inter-SemiBold", 46),
               fill=tuple(int(255 * p) for _ in range(3)))
    return finish(im)


HEART_PTS = [(16 * math.sin(a) ** 3,
              -(13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)))
             for a in np.linspace(0, 2 * math.pi, 120)]


def screen_heart(t):
    im, d = new_screen()
    beat = (t * 1.25) % 1.0
    s = 1 + 0.12 * math.exp(-beat * 9)
    cx, cy, k = S_W / 2, 400, 13 * s
    glow = Image.new("RGB", (S_W, S_H), (0, 0, 0))
    ImageDraw.Draw(glow).ellipse((cx - 260 * s, cy - 230 * s, cx + 260 * s, cy + 250 * s), fill=(150, 10, 20))
    im = glow.filter(ImageFilter.GaussianBlur(90))
    d = ImageDraw.Draw(im)
    status_time(d)
    pts = [(cx + x * k, cy + y * k) for x, y in HEART_PTS]
    d.polygon(pts, fill=(235, 30, 45))
    hi = [(cx + x * k * 0.55 - 40, cy + y * k * 0.55 - 40) for x, y in HEART_PTS]
    d.polygon(hi, fill=(250, 70, 80))
    bpm = 68 + int(4 * ease_out(t / 1.2))
    d.text((70, 690), "Actuel", font=font("Inter-Medium", 40), fill=(255, 255, 255))
    d.text((70, 740), f"{bpm}", font=font("InterDisplay-SemiBold", 130), fill=(255, 255, 255))
    w = d.textlength(f"{bpm}", font=font("InterDisplay-SemiBold", 130))
    d.text((85 + w, 810), "BPM", font=font("Inter-SemiBold", 52), fill=(255, 59, 48))
    return finish(im)


def screen_activity(t):
    im, d = new_screen()
    status_time(d)
    d.text((70, 60), "Activité", font=font("Inter-SemiBold", 44), fill=(48, 209, 88))
    cx, cy = S_W / 2, 400
    rings = [((250, 17, 79), 0.82), ((166, 255, 0), 0.68), ((0, 230, 255), 0.9)]
    for i, (col, goal) in enumerate(rings):
        r = 260 - i * 78
        dark = tuple(c // 5 for c in col)
        box = (cx - r, cy - r, cx + r, cy + r)
        d.ellipse(box, outline=dark, width=66)
        frac = goal * ease_in_out(t / 1.1)
        if frac > 0.005:
            d.arc(box, -90, -90 + 360 * frac, fill=col, width=66)
            for a in (-90, -90 + 360 * frac):
                rad = math.radians(a)
                px, py = cx + (r - 33) * math.cos(rad), cy + (r - 33) * math.sin(rad)
                d.ellipse((px - 33, py - 33, px + 33, py + 33), fill=col)
    p = ease_out(t / 1.1)
    f = font("Inter-SemiBold", 46)
    d.text((70, 740), f"{int(420 * p)} KCAL", font=f, fill=(250, 17, 79))
    d.text((70, 800), f"{int(8540 * p):,} PAS".replace(",", " "), font=f, fill=(166, 255, 0))
    d.text((S_W - 70, 740), f"{int(36 * p)} MIN", font=f, fill=(0, 230, 255), anchor="ra")
    return finish(im)


HERO_SCREENS = [
    (screen_face, "Design premium"),
    (screen_clock, "Toujours à l'heure"),
    (screen_call, "Appels au poignet"),
    (screen_notifs, "Notifications instantanées"),
    (screen_heart, "Suivi cardiaque"),
    (screen_activity, "Suivi d'activité & sport"),
]

# --- Logo --------------------------------------------------------------------------
LOGO_IM = Image.open(LOGO).convert("RGBA")


def logo(width):
    h = int(LOGO_IM.height * width / LOGO_IM.width)
    return LOGO_IM.resize((width, h), Image.LANCZOS)


LOGO_TOP = logo(330)
LOGO_END = logo(520)

# --- Photos ------------------------------------------------------------------------
IMG2 = Image.open(ASSETS / "2.png").convert("RGB")
IMG3 = Image.open(ASSETS / "3.png").convert("RGB")
IMG4 = Image.open(ASSETS / "4.png").convert("RGB")
IMG5 = Image.open(ASSETS / "5.png").convert("RGB")


def bottom_gradient(canvas, strength=0.65, start=0.55):
    g = np.zeros((H, W, 4), np.uint8)
    ys = np.linspace(0, 1, H)
    a = (np.clip((ys - start) / (1 - start), 0, 1) ** 1.4 * 255 * strength).astype(np.uint8)
    g[..., 3] = a[:, None]
    canvas.alpha_composite(Image.fromarray(g, "RGBA"))


def shadow_text(canvas, text, fnt, cy, opacity, dy):
    sh = text_img(text, fnt, (0, 0, 0, 150)).filter(ImageFilter.GaussianBlur(8))
    paste_alpha(canvas, sh, (W / 2 - sh.width / 2, cy - sh.height / 2 + dy + 4), opacity)
    text_center(canvas, text, fnt, (255, 255, 255), cy, opacity, dy)


# --- Scènes ------------------------------------------------------------------------
F_TITLE = font("InterDisplay-SemiBold", 66)
F_CAP = font("Inter-SemiBold", 52)
F_PHOTO = font("InterDisplay-Bold", 84)
F_PHOTO_SUB = font("Inter-Medium", 44)

HERO_START, SCREEN_DUR = 1.5, 1.5
HERO_END = HERO_START + SCREEN_DUR * len(HERO_SCREENS)  # 10.5
PHOTOS_END = HERO_END + 4.5  # 15.0
END = PHOTOS_END + 4.0  # 19.0


def scene_intro(t):
    """Deux gros plans rapides, comme l'ouverture de la référence."""
    if t < 0.75:
        p = t / 0.75
        frame = affine(IMG5, 4.2 + 0.6 * p, (650 - 20 * p, 640), (W / 2, H / 2), fill=(200, 190, 185))
    else:
        p = (t - 0.75) / 0.75
        frame = affine(SRC_WATCH, 5.0 - 0.8 * p, (800, 500 + 60 * p), (W / 2, H / 2))
    return frame.convert("RGBA")


def scene_hero(t):
    lt = t - HERO_START
    idx = min(int(lt // SCREEN_DUR), len(HERO_SCREENS) - 1)
    st = lt - idx * SCREEN_DUR
    fn, caption = HERO_SCREENS[idx]
    screen = fn(st)
    if idx > 0 and st < 0.12:  # fondu rapide entre écrans
        prev_fn = HERO_SCREENS[idx - 1][0]
        screen = Image.blend(prev_fn(SCREEN_DUR - 0.001 + st), screen, st / 0.12)
    watch = watch_with_screen(screen)

    zoom_in = ease_in_out(lt / 0.7)  # dézoom d'entrée depuis le gros plan
    bump = 1 + 0.025 * math.exp(-st * 7) if idx > 0 else 1
    scale = (2.7 - 1.34 * zoom_in) * bump
    cy = 1040
    frame = affine(watch, scale, (540, 560), (W / 2, cy)).convert("RGBA")

    head = ease_out((lt - 0.35) / 0.5)
    paste_alpha(frame, LOGO_TOP, (W / 2 - LOGO_TOP.width / 2, 120 - (1 - head) * 30), head)
    o1, d1 = appear(lt, 0.5)
    text_center(frame, TITLE_1, F_TITLE, INK, 300, o1, d1)
    o2, d2 = appear(lt, 0.62)
    text_center(frame, TITLE_2, F_TITLE, INK, 378, o2, d2)

    co, cd = appear(st, 0.08 if idx else 0.8, 0.35)
    if idx < len(HERO_SCREENS) - 1:
        co *= clamp((SCREEN_DUR - st) / 0.15)
    text_center(frame, caption, F_CAP, (60, 60, 64), 1745, co, cd)
    return frame


PHOTO_SHOTS = [
    # image, échelle, centre source (début, fin), titre, sous-titre
    (IMG3, (1.85, 1.95), ((560, 520), (560, 500)), "Recharge magnétique", "Simple. Rapide."),
    (IMG4, (1.0, 1.06), ((540, 540), (540, 540)), "3 bracelets offerts", "Changez de style en un clic"),
    (IMG5, (1.78, 1.9), ((700, 560), (690, 540)), "Élégante au quotidien", "Du bureau au week-end"),
]


def scene_photos(t):
    lt = t - HERO_END
    i = min(int(lt // 1.5), 2)
    st = lt - i * 1.5
    img, (s0, s1), (c0, c1), title, sub = PHOTO_SHOTS[i]
    p = st / 1.5
    sc = s0 + (s1 - s0) * p
    c = (c0[0] + (c1[0] - c0[0]) * p, c0[1] + (c1[1] - c0[1]) * p)
    if img is IMG4:
        frame = affine(img, sc, c, (W / 2, H / 2 - 60), fill=(234, 234, 234)).convert("RGBA")
        paste_alpha(frame, LOGO_TOP, (W / 2 - LOGO_TOP.width / 2, 120))
        o, d = appear(st, 0.1, 0.35)
        text_center(frame, title, F_PHOTO, INK, 1540, o, d)
        o, d = appear(st, 0.22, 0.35)
        text_center(frame, sub, F_PHOTO_SUB, GREY, 1640, o, d)
    else:
        frame = affine(img, sc, c, (W / 2, H / 2)).convert("RGBA")
        bottom_gradient(frame)
        o, d = appear(st, 0.1, 0.35)
        shadow_text(frame, title, F_PHOTO, 1540, o, d)
        o, d = appear(st, 0.22, 0.35)
        shadow_text(frame, sub, F_PHOTO_SUB, 1640, o, d)
    return frame


CTA_WATCH = watch_with_screen(ORIGINAL_FACE)
F_HURRY = font("InterDisplay-Bold", 76)
F_PRICE = font("InterDisplay-Black", 230)
F_OLD = font("InterDisplay-Medium", 80)
F_PILL = font("Inter-SemiBold", 40)
F_SITE = font("InterDisplay-Bold", 64)
F_WA = font("Inter-SemiBold", 50)


def wa_icon(size):
    im = Image.new("RGBA", (size * 4, size * 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    s = size * 4
    d.ellipse((0, 0, s - 1, s - 1), fill=WA_GREEN)
    handset(d, s / 2 + s * 0.04, s / 2 - s * 0.04, s * 0.24, (255, 255, 255), 135)
    return im.resize((size, size), Image.LANCZOS)


WA_ICON = wa_icon(72)


def scene_cta(t):
    lt = t - PHOTOS_END
    frame = Image.new("RGBA", (W, H), BG + (255,))
    # montre
    wp = ease_out(lt / 0.6)
    wface = watch_with_screen(screen_face(lt))
    wl = affine(wface, 0.66 * (0.85 + 0.15 * wp), (540, 560), (W / 2, 650 + (1 - wp) * 80)).convert("RGBA")
    frame = Image.blend(frame, wl, wp)

    paste_alpha(frame, LOGO_TOP, (W / 2 - LOGO_TOP.width / 2, 110))
    o, d = appear(lt, 0.15)
    text_center(frame, "Dépêchez-vous !", F_HURRY, INK, 290, o, d)

    # prix
    pp = back_out((lt - 0.55) / 0.5)
    if pp > 0:
        im = text_img(PRICE, F_PRICE, BLUE)
        s = max(0.01, pp)
        im2 = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        paste_alpha(frame, im2, (W / 2 - im2.width / 2 - 20, 1075 - im2.height / 2), clamp(pp))
    o, d = appear(lt, 0.8)
    old = text_center(frame, f"au lieu de {OLD_PRICE}", F_OLD, GREY, 1290, o, d)
    if o > 0:  # barré
        ow = text_img(OLD_PRICE, F_OLD, GREY).width
        x1 = W / 2 + old.width / 2 - 4
        dr = ImageDraw.Draw(frame)
        ln = ease_out((lt - 1.0) / 0.3)
        dr.line((x1 - ow, 1284 + d, x1 - ow + ow * ln, 1284 + d), fill=(229, 57, 53, int(255 * o)), width=7)

    # pastille
    o, d = appear(lt, 1.0)
    if o > 0:
        pill = text_img("+ 3 BRACELETS OFFERTS", F_PILL, (255, 255, 255))
        pw, ph = pill.width + 70, pill.height + 40
        layer = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
        ImageDraw.Draw(layer).rounded_rectangle((0, 0, pw - 1, ph - 1), ph // 2, fill=INK)
        layer.alpha_composite(pill, (35, 20))
        paste_alpha(frame, layer, (W / 2 - pw / 2, 1390 + d), o)

    o, d = appear(lt, 1.25)
    text_center(frame, f"Commandez sur {SITE}", F_SITE, INK, 1560, o, d)
    o, d = appear(lt, 1.45)
    if o > 0:
        wa = text_img(WHATSAPP, F_WA, INK)
        total = WA_ICON.width + 24 + wa.width
        x = W / 2 - total / 2
        paste_alpha(frame, WA_ICON, (x, 1665 + d), o)
        paste_alpha(frame, wa, (x + WA_ICON.width + 24, 1665 + d + (WA_ICON.height - wa.height) / 2), o)
    # fondu de sortie
    fo = clamp((END - t) / 0.4)
    if fo < 1:
        frame = Image.blend(Image.new("RGBA", (W, H), BG + (255,)), frame, fo)
    return frame


def render(t):
    if t < HERO_START:
        f = scene_intro(t)
    elif t < HERO_END:
        f = scene_hero(t)
    elif t < PHOTOS_END:
        f = scene_photos(t)
    else:
        f = scene_cta(t)
    # flash blanc bref sur les grandes transitions
    for cut in (0.75, HERO_START, HERO_END, HERO_END + 1.5, HERO_END + 3.0, PHOTOS_END):
        if 0 <= t - cut < 0.1:
            f = Image.blend(f, Image.new("RGBA", (W, H), (255, 255, 255, 255)), 0.35 * (1 - (t - cut) / 0.1))
    return f.convert("RGB")


# --- Musique (synthétisée, libre de droits) ------------------------------------------
def make_audio(path, dur, sr=44100, bpm=120):
    n = int(dur * sr)
    out = np.zeros(n)
    beat = 60 / bpm
    tt = np.arange(n) / sr

    def add(sig, start):
        i = int(start * sr)
        j = min(n, i + len(sig))
        if i < n:
            out[i:j] += sig[: j - i]

    # kick
    kt = np.arange(int(0.35 * sr)) / sr
    kick = np.sin(2 * np.pi * (45 * kt + (110 / 18) * (1 - np.exp(-kt * 18)))) * np.exp(-kt * 9)
    rng = np.random.default_rng(7)
    ht = np.arange(int(0.06 * sr)) / sr
    hat = np.diff(rng.standard_normal(len(ht) + 1)) * np.exp(-ht * 70) * 0.18
    nb = int(dur / beat)
    for b in range(nb):
        s = b * beat
        if 1.5 <= s < END - 1.0 or b % 2 == 0:
            add(kick * 0.9, s)
        if s >= 1.5:
            add(hat, s + beat / 2)
    # pad d'accords (La m – Fa – Do – Sol)
    chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63),
              (196.0, 261.63, 329.63), (196.0, 246.94, 293.66)]
    bar = beat * 4
    pad = np.zeros(n)
    for k in range(int(dur / bar) + 1):
        fr = chords[k % 4]
        i0, i1 = int(k * bar * sr), min(n, int((k + 1) * bar * sr))
        seg = tt[i0:i1] - k * bar
        env = np.minimum(1, seg / 0.08) * np.minimum(1, (bar - seg) / 0.15)
        tone = sum(np.sin(2 * np.pi * f * tt[i0:i1]) + 0.3 * np.sin(4 * np.pi * f * tt[i0:i1]) for f in fr)
        pad[i0:i1] += tone * env
        # basse
        pad[i0:i1] += 0.9 * np.sin(2 * np.pi * fr[0] / 2 * tt[i0:i1]) * env
    out += pad * 0.07
    # arpège léger sur les écrans
    notes = [659.25, 523.25, 587.33, 783.99]
    for b in range(nb * 2):
        s = b * beat / 2
        if HERO_START <= s < HERO_END:
            at = np.arange(int(0.2 * sr)) / sr
            add(np.sin(2 * np.pi * notes[b % 4] * at) * np.exp(-at * 14) * 0.12, s)
    # whoosh aux transitions
    wt = np.arange(int(0.4 * sr)) / sr
    wh = rng.standard_normal(len(wt))
    wh = np.convolve(wh, np.ones(30) / 30, mode="same") * np.sin(np.pi * wt / 0.4) ** 2 * 0.5
    for cut in (HERO_START, HERO_END, PHOTOS_END):
        add(wh, cut - 0.25)
    # "ding" sur le prix
    dt = np.arange(int(1.2 * sr)) / sr
    ding = (np.sin(2 * np.pi * 1318.5 * dt) + 0.5 * np.sin(2 * np.pi * 1975.5 * dt)) * np.exp(-dt * 5) * 0.2
    add(ding, PHOTOS_END + 0.6)
    # fondu
    fade = np.clip((dur - tt) / 1.2, 0, 1) * np.clip(tt / 0.05, 0, 1)
    out *= fade
    out = np.tanh(out * 1.2) / np.tanh(1.2) * 0.85
    pcm = (out * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def main(preview_times=None):
    if preview_times:
        for t in preview_times:
            render(t).save(HERE / f"preview_{t:05.2f}.png")
        return
    make_audio(AUDIO, END)
    cmd = ["ffmpeg", "-y", "-v", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", str(AUDIO),
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(OUT)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    total = int(END * FPS)
    for i in range(total):
        proc.stdin.write(render(i / FPS).tobytes())
        if i % 60 == 0:
            print(f"{i}/{total}", flush=True)
    proc.stdin.close()
    proc.wait()
    AUDIO.unlink(missing_ok=True)
    print("OK ->", OUT)


if __name__ == "__main__":
    import sys
    main([float(x) for x in sys.argv[1:]] or None)
