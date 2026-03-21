// Specific images for each of the 15 seeded Bay Area courses.
// onError in <img> will hide the image if the URL becomes stale.

const COURSE_IMAGES = {
  "tpc harding park":
    "https://tpc.com/hardingpark/wp-content/uploads/sites/47/2016/08/IP-Hero_Harding-park-1-1.jpg",
  "lincoln park golf course":
    "https://www.sfpublicgolf.org/images/uploads/Lincoln3rdGreen_jpg_w300h225-gigapixel.jpg",
  "sharp park golf course":
    "https://www.sfpublicgolf.org/images/site/thb-sharp-park.png",
  "crystal springs golf course":
    "https://www.playcrystalsprings.com/images/slideshows/001-startingimage-1.jpg",
  "half moon bay golf links — ocean course":
    "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80",
  "half moon bay golf links — old course":
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80",
  "tilden park golf course":
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
  "chuck corica golf complex — south course":
    "https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&q=80",
  "boundary oak golf course":
    "https://www.playboundaryoak.com/images/slideshows/banner_1.jpg",
  "palo alto golf course":
    "https://www.baylandsgolflinks.com/wp-content/uploads/sites/8950/2023/06/homeslide1.jpg",
  "sunol valley golf course — palm course":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "cinnabar hills golf club":
    "https://www.cinnabarhills.com/images/uploads/photo-golf.jpg",
  "santa teresa golf club":
    "https://images.unsplash.com/photo-1504370805625-d32c054b24a8?w=800&q=80",
  "poppy ridge golf course":
    "https://poppyridgegolf.ncga.org/hs-fs/hubfs/Poppy%20Ridge%20H16%200795-Edit.jpg",
  "diablo creek golf course":
    "https://www.diablocreekgc.com/images/slideshows/banner_1.jpg",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
  "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80",
  "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
  "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=800&q=80",
  "https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&q=80",
];

/**
 * Look up an image URL by course name (case-insensitive, partial match).
 * Falls back to a generic golf photo via the fallback index.
 */
export function getCourseImage(name, fallbackIndex = 0) {
  if (!name) return FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
  const key = name.toLowerCase().trim();
  if (COURSE_IMAGES[key]) return COURSE_IMAGES[key];

  // Partial match — handles GPT returning slightly different names
  const match = Object.keys(COURSE_IMAGES).find(
    (k) => k.includes(key) || key.includes(k)
  );
  return match
    ? COURSE_IMAGES[match]
    : FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
}
