# Images

The code now matches the folders you created — **no renaming needed**.
22 of 27 referenced files exist; the 5 missing are gallery placeholders.

```
images/
├── certificates/   coc-certificate.jpg                    ✅
├── eod-system/     6 screenshots                          ✅ complete
├── gallery/        gallery1–3.jpg + profile.jpg           ⬜ 3 of 8
├── grease-monkey/  6 screenshots                          ✅ complete
└── skd-pos/        6 screenshots                          ✅ complete
```

## gallery/

Not limited to the internship — any photo you want on the site goes here.

`profile.jpg` is the **hero avatar** — it lives in this folder but is not part of
the carousel and never appears in it.

Carousel photos render in **greyscale and turn full colour on hover**, matching
the avatar. The lightbox always shows them in colour.

| File           | Status | Caption in the carousel                     |
| -------------- | ------ | ------------------------------------------- |
| `profile.jpg`  | ✅     | *(hero avatar — not in the carousel)*       |
| `gallery1.jpg` | ✅     | Orientation at the Upturn co-working space  |
| `gallery2.jpg` | ✅     | The 2026 internship batch                   |
| `gallery3.jpg` | ✅     | Building the EOD Reporting System           |
| `gallery4.jpg` | ⬜     | Photo coming soon                           |
| `gallery5.jpg` | ⬜     | Photo coming soon                           |
| `gallery6.jpg` | ⬜     | Photo coming soon                           |
| `gallery7.jpg` | ⬜     | Photo coming soon                           |
| `gallery8.jpg` | ⬜     | Photo coming soon                           |

Drop in `gallery4.jpg`–`gallery8.jpg` and they appear automatically. Then update
that slide's `data-cap` in the `#gallery` section of `index.html`, and the
"3 of 8 added" label in the section header.

To use fewer than 8, delete the extra `.car-slide` blocks — the loop and arrows
adjust on their own.

## eod-system/ — complete

`eod-dashboard` · `eod-compliance` · `eod-analytics` · `eod-reports` ·
`eod-help` · `eod-login` — in that order in the case-study grid.

## skd-pos/ — complete

`pos-pos` · `pos-bir` · `pos-reports` · `pos-menu` · `pos-landingpage` · `pos-login`

## grease-monkey/ — complete

`gm-dashboard` · `gm-parts` · `gm-movement` · `gm-audit` · `gm-landingpage` · `gm-login`

## PHP E-Commerce — no folder

No screenshots exist, so its case-study modal shows an **"Images unavailable"**
panel instead of an empty grid. If you capture some later, create
`images/php-ecommerce/` and add a `shots: [...]` array to the `ecom` entry in the
`CASES` object near the bottom of `index.html`.

---

## Notes

- Captions live in `index.html`: `data-cap` on each carousel slide, and the `cap`
  field in each `CASES` entry.
- Any missing file renders as a dotted placeholder showing its filename — nothing
  ever appears broken.
- `gallery3.jpg` is portrait; the carousel crops to 16:10, so it centre-crops.
  A landscape version would show more of the frame.
- **Before publishing:** these photos show colleagues and an office. Worth
  confirming the people in `gallery1.jpg` and `gallery2.jpg` are fine with being
  on a public page, and check the certificate for any ID number you'd rather not
  publish.
