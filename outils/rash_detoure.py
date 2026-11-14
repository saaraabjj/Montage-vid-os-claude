"""Détoure le rashguard beige (photos OSMOSIS) : contour dessiné à la main + GrabCut.
Usage : python3 -I outils/rash_detoure.py <dossier des photos 1.webp / 2.webp> <dossier de sortie>"""
import sys
import cv2
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
POLYS = {
    "dos": (1, [(405, 524), (520, 532), (630, 524), (720, 560), (860, 680), (882, 845), (785, 852), (708, 848), (712, 1286),
                (266, 1286), (262, 848), (185, 855), (150, 845), (152, 690), (240, 572), (325, 538)]),
    # le haut suit le bord supérieur de l'encolure : le cou reste dehors
    "face": (2, [(395, 556), (430, 586), (470, 601), (500, 607), (540, 603), (575, 589), (602, 572), (700, 590), (830, 700),
                 (858, 880), (742, 893), (738, 1450), (262, 1450), (262, 900), (130, 910), (128, 700), (228, 590), (300, 562)]),
}
for nom, (i, P) in POLYS.items():
    im = cv2.imread(f"{SRC}/{i}.webp")
    h, w = im.shape[:2]
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [np.array(P, np.int32)], 255)
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[cv2.dilate(m, np.ones((21, 21), np.uint8)) > 0] = cv2.GC_PR_BGD
    mask[m > 0] = cv2.GC_PR_FGD
    mask[cv2.erode(m, np.ones((41, 41), np.uint8)) > 0] = cv2.GC_FGD
    bg, fg = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(im, mask, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
    a = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    a = cv2.bitwise_or(a, cv2.erode(m, np.ones((15, 15), np.uint8)))  # garde les manches noires
    a = cv2.bitwise_and(a, cv2.dilate(m, np.ones((5, 5), np.uint8)))
    a = cv2.GaussianBlur(cv2.morphologyEx(a, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)), (5, 5), 0)
    ys, xs = np.where(a > 10)
    cv2.imwrite(f"{OUT}/rash-beige-{nom}.png", np.dstack([im, a])[ys.min():ys.max() + 1, xs.min():xs.max() + 1])

# Face : enlève la peau du cou qui reste dans l'encolure (tout ce qui est au-dessus du col noir)
f = f"{OUT}/rash-beige-face.png"
a = cv2.imread(f, cv2.IMREAD_UNCHANGED)
v = cv2.cvtColor(a[:, :, :3], cv2.COLOR_BGR2HSV)[:, :, 2]
bord = {}
for x in range(200, 525):
    col = v[:110, x]
    sombre = np.where(col < 70)[0]
    sombre = sombre[sombre > 3]
    if len(sombre) and a[sombre[0] - 1, x, 3] > 0 and v[max(0, sombre[0] - 4), x] > 90:
        bord[x] = sombre[0]
# bord du col = une courbe régulière (parabole ajustée, points aberrants écartés)
X = np.array(sorted(bord)); Y = np.array([bord[k] for k in X], float)
for _ in range(3):
    c = np.polyfit(X, Y, 2)
    r = np.abs(np.polyval(c, X) - Y)
    garde = r < max(3, 2.5 * np.median(r))
    X, Y = X[garde], Y[garde]
for x in range(X.min(), X.max() + 1):
    a[: int(np.polyval(c, x)) + 1, x, 3] = 0
a[:, :, 3] = cv2.GaussianBlur(a[:, :, 3], (5, 5), 0)
cv2.imwrite(f, a)

# Les deux : enlève le fond gris resté sur les bords (gris = peu saturé, ni noir ni blanc)
for nom in ("dos", "face"):
    f = f"{OUT}/rash-beige-{nom}.png"
    a = cv2.imread(f, cv2.IMREAD_UNCHANGED)
    hsv = cv2.cvtColor(a[:, :, :3], cv2.COLOR_BGR2HSV)
    gris = ((hsv[:, :, 0] < 30) & (hsv[:, :, 1] < 36) & (hsv[:, :, 2] > 78) & (hsv[:, :, 2] < 170)).astype(np.uint8) * 255
    # seulement les zones grises touchant le bord transparent (pas le motif au milieu du t-shirt)
    n, lab = cv2.connectedComponents(gris)
    vide = cv2.dilate((a[:, :, 3] < 20).astype(np.uint8), np.ones((5, 5), np.uint8))
    for k in range(1, n):
        zone = lab == k
        if zone.sum() > 30 and vide[zone].any():
            a[zone, 3] = 0
    a[:, :, 3] = cv2.GaussianBlur(a[:, :, 3], (3, 3), 0)
    cv2.imwrite(f, a)
