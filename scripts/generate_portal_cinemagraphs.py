#!/usr/bin/env python3
"""
SkillBridge Portal Cinemagraph Generator
Generates subtle, photorealistic, seamless animated WebP cinemagraph loops
from the exact original photographs for Students, Industry, and Academia.

Key features:
- Preserves exact source photographs (no new images, no different people).
- Desynchronized realistic blinking with smooth eyelid descent and ascent.
- Anatomical head rotation and nods around natural neck pivots with Gaussian feathering.
- Gaze shifting (eyes moving smoothly between laptop/screen and teammates).
- Natural conversational hand and arm micro-gestures.
- Seamless periodic looping (frame 0 == frame T).
"""

import math
import os
import time
import numpy as np
from PIL import Image

BASE_DIR = "/Users/jains/.gemini/antigravity/scratch/academy-industry-portal"
PORTALS_DIR = os.path.join(BASE_DIR, "public/portals")

# Target resolution: 860x480 gives crisp 2x Retina clarity in compact cards
TARGET_WIDTH = 860
TARGET_HEIGHT = 480
TOTAL_FRAMES = 72  # 72 frames @ 24 fps = 3.0s smooth loop
FRAME_DURATION = 42  # ~24 fps (41.6ms)


def smooth_step(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def create_ellipse_mask(h, w, center, radius, falloff=0.35):
    """Generates a smooth-feathered 2D elliptical mask in [0, 1]."""
    cy, cx = center
    ry, rx = radius
    y, x = np.ogrid[:h, :w]
    dist = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    # 1.0 inside core, falls off to 0.0 at 1.0 + falloff
    mask = np.clip(1.0 - (dist - (1.0 - falloff)) / falloff, 0.0, 1.0)
    return mask * mask * (3.0 - 2.0 * mask)


def warp_image_bilinear(img_arr, dx, dy):
    """Vectorized inverse-mapping bilinear warp on HxWx3 array."""
    h, w, _ = img_arr.shape
    y, x = np.mgrid[:h, :w]
    src_x = np.clip(x - dx, 0, w - 1.001)
    src_y = np.clip(y - dy, 0, h - 1.001)

    x0 = src_x.astype(int)
    y0 = src_y.astype(int)
    x1 = np.minimum(x0 + 1, w - 1)
    y1 = np.minimum(y0 + 1, h - 1)

    wx = src_x - x0
    wy = src_y - y0

    wa = ((1.0 - wx) * (1.0 - wy))[..., None]
    wb = (wx * (1.0 - wy))[..., None]
    wc = ((1.0 - wx) * wy)[..., None]
    wd = (wx * wy)[..., None]

    out = (
        img_arr[y0, x0] * wa
        + img_arr[y0, x1] * wb
        + img_arr[y1, x0] * wc
        + img_arr[y1, x1] * wd
    )
    return np.clip(out, 0, 255).astype(np.uint8)


def apply_rotation_to_field(
    dx, dy, x_grid, y_grid, mask, pivot, angle_rad, shift_x=0.0, shift_y=0.0
):
    """Accumulates rotation and translation into displacement field."""
    px, py = pivot
    eff_theta = angle_rad * mask
    rx = (
        (x_grid - px) * np.cos(eff_theta)
        - (y_grid - py) * np.sin(eff_theta)
        + px
        + shift_x * mask
    )
    ry = (
        (x_grid - px) * np.sin(eff_theta)
        + (y_grid - py) * np.cos(eff_theta)
        + py
        + shift_y * mask
    )
    dx += x_grid - rx
    dy += y_grid - ry


def apply_blink_to_field(
    dy, x_grid, y_grid, eye_pos, blink_progress, radius=(12, 7), drop=4.0
):
    """
    Simulates upper eyelid blink by pulling skin downward over eye slit.
    blink_progress in [0, 1].
    """
    if blink_progress <= 0:
        return
    ex, ey = eye_pos
    rx, ry = radius
    dist = ((x_grid - ex) / rx) ** 2 + ((y_grid - ey) / ry) ** 2
    # Only pull down near and slightly above eye slit
    mask = np.exp(-0.5 * dist)
    dy += mask * (drop * blink_progress)


def compute_blink_curve(frame_idx, start_frame, duration=6):
    """Smooth bell curve for blink duration."""
    if start_frame <= frame_idx < start_frame + duration:
        t = (frame_idx - start_frame) / duration
        return math.sin(math.pi * t)
    return 0.0


# ---------------------------------------------------------------------------
# 1. Students Portal Cinemagraph
# ---------------------------------------------------------------------------
def generate_students_animation():
    print("Generating Students animated cinemagraph...")
    src_path = os.path.join(PORTALS_DIR, "students.jpg")
    orig = Image.open(src_path)
    base = orig.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    arr = np.array(base).astype(float)
    h, w, _ = arr.shape
    y_grid, x_grid = np.mgrid[:h, :w]

    # Coordinate mapping from 1376x768 to 860x480 (scale factor ~0.625)
    scale_x = w / 1376.0
    scale_y = h / 768.0

    # Masks for 3 students
    # Student 1 (left)
    head_mask_s1 = create_ellipse_mask(
        h, w, (int(235 * scale_y), int(585 * scale_x)), (int(75 * scale_y), int(60 * scale_x)), 0.35
    )
    pivot_s1 = (int(585 * scale_x), int(315 * scale_y))
    eye_s1_l = (int(560 * scale_x), int(222 * scale_y))
    eye_s1_r = (int(592 * scale_x), int(220 * scale_y))

    # Student 2 (center, pointing at laptop)
    head_mask_s2 = create_ellipse_mask(
        h, w, (int(220 * scale_y), int(970 * scale_x)), (int(80 * scale_y), int(65 * scale_x)), 0.35
    )
    pivot_s2 = (int(970 * scale_x), int(310 * scale_y))
    eye_s2_l = (int(945 * scale_x), int(210 * scale_y))
    eye_s2_r = (int(975 * scale_x), int(210 * scale_y))
    # Hand / pointing arm mask
    hand_mask_s2 = create_ellipse_mask(
        h, w, (int(410 * scale_y), int(880 * scale_x)), (int(40 * scale_y), int(55 * scale_x)), 0.4
    )
    pivot_hand_s2 = (int(920 * scale_x), int(390 * scale_y))

    # Student 3 (right, smiling)
    head_mask_s3 = create_ellipse_mask(
        h, w, (int(250 * scale_y), int(1190 * scale_x)), (int(75 * scale_y), int(60 * scale_x)), 0.35
    )
    pivot_s3 = (int(1190 * scale_x), int(340 * scale_y))
    eye_s3_l = (int(1165 * scale_x), int(240 * scale_y))
    eye_s3_r = (int(1195 * scale_x), int(240 * scale_y))

    # Torso respiration
    torso_mask = create_ellipse_mask(
        h, w, (int(440 * scale_y), int(900 * scale_x)), (int(120 * scale_y), int(360 * scale_x)), 0.5
    )

    frames = []
    for f in range(TOTAL_FRAMES):
        phase = (2.0 * math.pi * f) / TOTAL_FRAMES
        dx = np.zeros((h, w), dtype=float)
        dy = np.zeros((h, w), dtype=float)

        # 1. Gentle respiration in torso
        resp_dy = math.sin(phase) * 0.7 * scale_y
        dy += torso_mask * resp_dy

        # 2. Student 2 (Center): Nodding while discussing code + pointing hand gesture
        nod_angle_s2 = math.radians(1.4) * math.sin(phase)
        nod_shift_y_s2 = math.sin(phase) * 1.2 * scale_y
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_s2, pivot_s2, nod_angle_s2, 0.0, nod_shift_y_s2
        )
        # Center student hand gesture (cadence micro-gesture toward laptop)
        hand_angle_s2 = math.radians(1.6) * math.sin(phase + 0.5)
        hand_shift_x = math.sin(phase) * 1.5 * scale_x
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, hand_mask_s2, pivot_hand_s2, hand_angle_s2, hand_shift_x, 0.0
        )

        # 3. Student 1 (Left): Listening tilt toward center student
        tilt_angle_s1 = math.radians(1.1) * math.sin(phase + 1.2)
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_s1, pivot_s1, tilt_angle_s1, 0.0, 0.0
        )

        # 4. Student 3 (Right): Subtle smiling head micro-tilt
        tilt_angle_s3 = math.radians(0.9) * math.sin(phase + 2.4)
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_s3, pivot_s3, tilt_angle_s3, 0.0, 0.0
        )

        # 5. Gaze shift for Student 2: Glancing between laptop and teammate
        gaze_shift_x = math.sin(phase) * 1.8 * scale_x
        gaze_mask_s2 = create_ellipse_mask(
            h, w, (int(210 * scale_y), int(960 * scale_x)), (int(14 * scale_y), int(35 * scale_x)), 0.3
        )
        dx += gaze_mask_s2 * gaze_shift_x

        # 6. Desynchronized natural blinking
        # Student 1 blinks at frame 16..22
        b_s1 = compute_blink_curve(f, 16, 6)
        if b_s1 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_s1_l, b_s1, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_s1_r, b_s1, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)

        # Student 2 blinks at frame 42..48
        b_s2 = compute_blink_curve(f, 42, 6)
        if b_s2 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_s2_l, b_s2, (int(9*scale_x), int(6*scale_y)), 3.8 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_s2_r, b_s2, (int(9*scale_x), int(6*scale_y)), 3.8 * scale_y)

        # Student 3 blinks at frame 60..66
        b_s3 = compute_blink_curve(f, 60, 6)
        if b_s3 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_s3_l, b_s3, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_s3_r, b_s3, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)

        # Render warped frame
        warped = warp_image_bilinear(arr, dx, dy)
        frames.append(Image.fromarray(warped))

    out_path = os.path.join(PORTALS_DIR, "students-animated.webp")
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION,
        loop=0,
        quality=85,
        method=4,
    )
    print(f"Students cinemagraph generated: {out_path} ({os.path.getsize(out_path)} bytes)")


# ---------------------------------------------------------------------------
# 2. Industry Portal Cinemagraph
# ---------------------------------------------------------------------------
def generate_industry_animation():
    print("Generating Industry animated cinemagraph...")
    src_path = os.path.join(PORTALS_DIR, "industry.jpg")
    orig = Image.open(src_path)
    base = orig.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    arr = np.array(base).astype(float)
    h, w, _ = arr.shape
    y_grid, x_grid = np.mgrid[:h, :w]

    scale_x = w / 1376.0
    scale_y = h / 768.0

    # Engineer Left
    head_mask_i1 = create_ellipse_mask(
        h, w, (int(240 * scale_y), int(250 * scale_x)), (int(80 * scale_y), int(60 * scale_x)), 0.35
    )
    pivot_i1 = (int(250 * scale_x), int(330 * scale_y))
    eye_i1_l = (int(235 * scale_x), int(235 * scale_y))
    eye_i1_r = (int(260 * scale_x), int(235 * scale_y))

    # Engineer Center
    head_mask_i2 = create_ellipse_mask(
        h, w, (int(215 * scale_y), int(710 * scale_x)), (int(80 * scale_y), int(65 * scale_x)), 0.35
    )
    pivot_i2 = (int(710 * scale_x), int(300 * scale_y))
    eye_i2_l = (int(690 * scale_x), int(210 * scale_y))
    eye_i2_r = (int(725 * scale_x), int(210 * scale_y))

    # Lead Engineer Right
    head_mask_i3 = create_ellipse_mask(
        h, w, (int(200 * scale_y), int(910 * scale_x)), (int(85 * scale_y), int(65 * scale_x)), 0.35
    )
    pivot_i3 = (int(910 * scale_x), int(295 * scale_y))
    eye_i3_l = (int(885 * scale_x), int(195 * scale_y))
    eye_i3_r = (int(920 * scale_x), int(195 * scale_y))

    # Lead engineer conversational hand gesture
    hand_mask_i3 = create_ellipse_mask(
        h, w, (int(370 * scale_y), int(860 * scale_x)), (int(45 * scale_y), int(50 * scale_x)), 0.4
    )
    pivot_hand_i3 = (int(890 * scale_x), int(350 * scale_y))

    # Torso respiration
    torso_mask = create_ellipse_mask(
        h, w, (int(420 * scale_y), int(750 * scale_x)), (int(130 * scale_y), int(380 * scale_x)), 0.5
    )

    frames = []
    for f in range(TOTAL_FRAMES):
        phase = (2.0 * math.pi * f) / TOTAL_FRAMES
        dx = np.zeros((h, w), dtype=float)
        dy = np.zeros((h, w), dtype=float)

        # 1. Subtle breathing in torso
        resp_dy = math.sin(phase) * 0.6 * scale_y
        dy += torso_mask * resp_dy

        # 2. Lead Engineer (Right): Affirmative nodding and explanation gesture
        nod_angle_i3 = math.radians(1.5) * math.sin(phase)
        nod_shift_y_i3 = math.sin(phase) * 1.1 * scale_y
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_i3, pivot_i3, nod_angle_i3, 0.0, nod_shift_y_i3
        )
        # Conversational hand motion
        hand_angle_i3 = math.radians(1.8) * math.sin(phase + 0.4)
        hand_shift_y = math.sin(phase) * 1.6 * scale_y
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, hand_mask_i3, pivot_hand_i3, hand_angle_i3, 0.0, hand_shift_y
        )

        # 3. Center Engineer: Rotates head following discussion
        tilt_angle_i2 = math.radians(1.2) * math.sin(phase + 1.4)
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_i2, pivot_i2, tilt_angle_i2, 0.0, 0.0
        )

        # 4. Left Engineer: Attentive posture tilt
        tilt_angle_i1 = math.radians(0.8) * math.sin(phase + 2.1)
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_i1, pivot_i1, tilt_angle_i1, 0.0, 0.0
        )

        # 5. Gaze shift for Center Engineer: between board and lead engineer
        gaze_shift_x = math.sin(phase) * 1.7 * scale_x
        gaze_mask_i2 = create_ellipse_mask(
            h, w, (int(210 * scale_y), int(705 * scale_x)), (int(14 * scale_y), int(35 * scale_x)), 0.3
        )
        dx += gaze_mask_i2 * gaze_shift_x

        # 6. Natural desynchronized blinking
        # Engineer 1 blinks at frame 14..20
        b_i1 = compute_blink_curve(f, 14, 6)
        if b_i1 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_i1_l, b_i1, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_i1_r, b_i1, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)

        # Lead Engineer blinks at frame 36..42
        b_i3 = compute_blink_curve(f, 36, 6)
        if b_i3 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_i3_l, b_i3, (int(9*scale_x), int(6*scale_y)), 3.8 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_i3_r, b_i3, (int(9*scale_x), int(6*scale_y)), 3.8 * scale_y)

        # Center Engineer blinks at frame 56..62
        b_i2 = compute_blink_curve(f, 56, 6)
        if b_i2 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_i2_l, b_i2, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_i2_r, b_i2, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)

        warped = warp_image_bilinear(arr, dx, dy)
        frames.append(Image.fromarray(warped))

    out_path = os.path.join(PORTALS_DIR, "industry-animated.webp")
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION,
        loop=0,
        quality=85,
        method=4,
    )
    print(f"Industry cinemagraph generated: {out_path} ({os.path.getsize(out_path)} bytes)")


# ---------------------------------------------------------------------------
# 3. Academia Portal Cinemagraph
# ---------------------------------------------------------------------------
def generate_academia_animation():
    print("Generating Academia animated cinemagraph...")
    src_path = os.path.join(PORTALS_DIR, "academia.jpg")
    orig = Image.open(src_path)
    base = orig.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    arr = np.array(base).astype(float)
    h, w, _ = arr.shape
    y_grid, x_grid = np.mgrid[:h, :w]

    scale_x = w / 1376.0
    scale_y = h / 768.0

    # Researcher Left (taking notes)
    head_mask_a1 = create_ellipse_mask(
        h, w, (int(240 * scale_y), int(420 * scale_x)), (int(80 * scale_y), int(60 * scale_x)), 0.35
    )
    pivot_a1 = (int(420 * scale_x), int(330 * scale_y))
    eye_a1_l = (int(405 * scale_x), int(225 * scale_y))
    eye_a1_r = (int(435 * scale_x), int(225 * scale_y))

    # Professor Center (mentoring / lecturing)
    head_mask_a2 = create_ellipse_mask(
        h, w, (int(210 * scale_y), int(600 * scale_x)), (int(85 * scale_y), int(65 * scale_x)), 0.35
    )
    pivot_a2 = (int(600 * scale_x), int(305 * scale_y))
    eye_a2_l = (int(580 * scale_x), int(200 * scale_y))
    eye_a2_r = (int(615 * scale_x), int(200 * scale_y))

    # Professor gesturing hand with pen/notes
    hand_mask_a2 = create_ellipse_mask(
        h, w, (int(385 * scale_y), int(650 * scale_x)), (int(45 * scale_y), int(55 * scale_x)), 0.4
    )
    pivot_hand_a2 = (int(620 * scale_x), int(360 * scale_y))

    # Researcher Right (attentive listener)
    head_mask_a3 = create_ellipse_mask(
        h, w, (int(240 * scale_y), int(830 * scale_x)), (int(80 * scale_y), int(60 * scale_x)), 0.35
    )
    pivot_a3 = (int(830 * scale_x), int(330 * scale_y))
    eye_a3_l = (int(805 * scale_x), int(230 * scale_y))
    eye_a3_r = (int(835 * scale_x), int(230 * scale_y))

    # Torso respiration
    torso_mask = create_ellipse_mask(
        h, w, (int(430 * scale_y), int(630 * scale_x)), (int(130 * scale_y), int(380 * scale_x)), 0.5
    )

    frames = []
    for f in range(TOTAL_FRAMES):
        phase = (2.0 * math.pi * f) / TOTAL_FRAMES
        dx = np.zeros((h, w), dtype=float)
        dy = np.zeros((h, w), dtype=float)

        # 1. Torso respiration
        resp_dy = math.sin(phase) * 0.6 * scale_y
        dy += torso_mask * resp_dy

        # 2. Professor (Center): Thoughtful mentoring nodding and explanation cadence
        nod_angle_a2 = math.radians(1.4) * math.sin(phase)
        nod_shift_y_a2 = math.sin(phase) * 1.2 * scale_y
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_a2, pivot_a2, nod_angle_a2, 0.0, nod_shift_y_a2
        )
        # Professor hand gesture (subtle cadence rhythm)
        hand_angle_a2 = math.radians(1.5) * math.sin(phase + 0.3)
        hand_shift_y = math.sin(phase) * 1.4 * scale_y
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, hand_mask_a2, pivot_hand_a2, hand_angle_a2, 0.0, hand_shift_y
        )

        # 3. Researcher Left: Head micro-lean reviewing notes and looking up
        lean_angle_a1 = math.radians(1.1) * math.sin(phase + 1.1)
        lean_shift_y = math.sin(phase + 1.1) * 1.0 * scale_y
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_a1, pivot_a1, lean_angle_a1, 0.0, lean_shift_y
        )

        # 4. Researcher Right: Attentive listening tilt
        tilt_angle_a3 = math.radians(1.0) * math.sin(phase + 2.3)
        apply_rotation_to_field(
            dx, dy, x_grid, y_grid, head_mask_a3, pivot_a3, tilt_angle_a3, 0.0, 0.0
        )

        # 5. Gaze shift for Researcher Left: Shifts from documents up to Professor and back
        gaze_shift_y = math.sin(phase) * 1.6 * scale_y
        gaze_mask_a1 = create_ellipse_mask(
            h, w, (int(225 * scale_y), int(420 * scale_x)), (int(14 * scale_y), int(35 * scale_x)), 0.3
        )
        dy += gaze_mask_a1 * gaze_shift_y

        # 6. Desynchronized natural blinking
        # Researcher Left blinks at frame 20..26
        b_a1 = compute_blink_curve(f, 20, 6)
        if b_a1 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_a1_l, b_a1, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_a1_r, b_a1, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)

        # Professor blinks at frame 46..52
        b_a2 = compute_blink_curve(f, 46, 6)
        if b_a2 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_a2_l, b_a2, (int(9*scale_x), int(6*scale_y)), 3.8 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_a2_r, b_a2, (int(9*scale_x), int(6*scale_y)), 3.8 * scale_y)

        # Researcher Right blinks at frame 64..70
        b_a3 = compute_blink_curve(f, 64, 6)
        if b_a3 > 0:
            apply_blink_to_field(dy, x_grid, y_grid, eye_a3_l, b_a3, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)
            apply_blink_to_field(dy, x_grid, y_grid, eye_a3_r, b_a3, (int(9*scale_x), int(6*scale_y)), 3.5 * scale_y)

        warped = warp_image_bilinear(arr, dx, dy)
        frames.append(Image.fromarray(warped))

    out_path = os.path.join(PORTALS_DIR, "academia-animated.webp")
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION,
        loop=0,
        quality=85,
        method=4,
    )
    print(f"Academia cinemagraph generated: {out_path} ({os.path.getsize(out_path)} bytes)")


if __name__ == "__main__":
    t_start = time.time()
    generate_students_animation()
    generate_industry_animation()
    generate_academia_animation()
    print(f"All portal cinemagraphs completed in {time.time() - t_start:.2f}s")
