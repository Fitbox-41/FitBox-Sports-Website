import { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CategoryGridCard from '../components/CategoryGridCard';
import Footer from '../components/Footer';
import './Home.css';

/* ═══════════════════════════════════════
   DATA
   Replace imgSrc / imgPlaceholder values
   with real image paths when ready.
═══════════════════════════════════════ */



/* Posters Section Data */
const posterImages = [
  { id: 'p1', imgSrc: '/2.jpg-scaled.webp', mobileImgSrc: '/2.jpg-scaled - Copy.webp', link: '/products' },
  { id: 'p2', imgSrc: '/4.jpg.webp', link: '/products' },
  { id: 'p3', imgSrc: '/7.jpg.webp', link: '/products' },
  { id: 'p4', imgSrc: '/5.jpg.webp', link: '/products' },
  { id: 'p5', imgSrc: '/6.jpg.webp', link: '/products' },
  { id: 'p6', imgSrc: '/3.jpg-scaled.webp', mobileImgSrc: '/3.jpg-scaled - Copy.webp', link: '/products' },
];

/* Collage Posters Data */
const collagePosters = [
  { id: 'cp1', imgSrc: '/4.jpg.webp', mobileImgSrc: '/1.jpg-scaled.webp', link: '/products' },
  { id: 'cp2', imgSrc: '/5.jpg.webp', mobileImgSrc: '/2.jpg-scaled.webp', link: '/products' },
  { id: 'cp3', imgSrc: '/9.jpg.webp', mobileImgSrc: '5-scaled.webp', link: '/products' },
  { id: 'cp4', imgSrc: '6.jpg.webp', mobileImgSrc: '/3.jpg-scaled.webp' },
  { id: 'cp6', imgSrc: '/8.jpg.webp', mobileImgSrc: '', link: '/products' },
  { id: 'cp7', imgSrc: '/2.jpg-scaled - Copy.webp', mobileImgSrc: '', link: '/products' },
  { id: 'cp8', imgSrc: '/7.jpg - Copy.webp', mobileImgSrc: '', link: '/products' },
];

/* Hot Products Data for Hero */
const hotProducts = [
  { id: 'hp5', name: 'Fabric Resistance Band', price: '₹449', imgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.webp' },
  { id: 'hp2', name: 'Speed Skipping Rope', price: '₹299', imgSrc: '/skipping-rope-jump-rope-for-exercise-workout-men-women-red-rope-original-imahffyngy3yzz5z.webp' },
  { id: 'hp3', name: 'Premium Shaker', price: '₹499', imgSrc: '/500-shaker-bottle-with-2-removable-compartment-for-protein-pre-original-imahff7yhwbrxgmw.webp' },
  { id: 'hp4', name: 'Gym Gloves V2', price: '₹699', imgSrc: '/left-right-free-size-gym-gloves-foam-padded-with-wrist-support-original-imahfeyvyfbv6rrv.webp' },
  { id: 'hp1', name: 'Hexa PVC Dumbbells', price: '₹799', imgSrc: '/sports-hexa-pvc-dumbbells-4-0-fitbox-sports-original-imahf77zvmat7mpm.webp' },
];

/* Category pills – infinite scrolling strip */
const categories = [
  { id: 1, label: 'Wall Mounting', path: '/category/wall-mounting', imgSrc: '/wall-mounting-chin-up-bar-pull-up-bar-ab-straps-combo-120-kg-original-imahfezwmkwx4ubs.webp' },
  { id: 2, label: 'Weighted Vests', path: '/category/weighted-vests', imgSrc: '/weighted-vest-for-training-running-boxing-jogging-cycling-original-imahfex6y5zxfhsz.webp' },
  { id: 3, label: 'Clothing', path: '/category/clothing', imgSrc: '/s-t-shirt-for-gym-fitbox-sports-original-imahf8gphqczzqsg-removebg-preview.webp' },
  { id: 4, label: 'Balls', path: '/category/balls', imgSrc: '/71di3zpn2mL.webp' },
  { id: 5, label: 'Toning Tube', path: '/category/toning-tube', imgSrc: '/toning-tube-with-door-anchor-resistance-exercise-band-original-imahf8jsgygz9hk4.webp' },
  { id: 6, label: 'Dumbbells', path: '/category/dumbbells', imgSrc: '/neoprene-coated-cast-iron-dumbbells-for-exercise-fitness-original-imahf9mxbhghmgfz.webp' },
  { id: 7, label: 'Resistance Bands', path: '/category/resistance-bands', imgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.webp' },
  { id: 8, label: 'Ropes', path: '/category/ropes', imgSrc: '/skipping-rope-jump-rope-for-exercise-workout-men-women-red-rope-original-imahffynqzgzczqz.webp' },
  { id: 9, label: 'Push-up Bars', path: '/category/push-up-bars', imgSrc: '/barrr.webp' },
  { id: 10, label: 'Kettlebells', path: '/category/kettlebells', imgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.webp' },
  { id: 11, label: 'Supporters', path: '/category/supporters', imgSrc: '/left-and-right-hand-premium-wrist-supporter-l-wrist-band-with-original-imahfdyysgharah4.webp' },
  { id: 12, label: 'Belts', path: '/category/belts', imgSrc: '/left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86zdtkkus2.webp' },
  { id: 13, label: 'Gloves', path: '/category/gloves', imgSrc: '/boxing-focus-pads-mitts-curved-punching-pads-with-high-density-original-imahfewzkcgrhhkv.webp' },
  { id: 14, label: 'Grippers', path: '/category/grippers', imgSrc: '/gripper.webp' },
  { id: 15, label: 'Shakers', path: '/category/shakers', imgSrc: '/500-shaker-bottle-with-2-removable-compartment-for-protein-pre-original-imahff7yhwbrxgmw.webp' },
  { id: 16, label: 'Bats', path: '/category/bats', imgSrc: '/pickleball-paddle-premium-boarded-composite-surface-shock-original-imahf7bcqddgr5nf.webp' },
];

const newArrivals = [
  {
    id: 1,
    name: 'Pro Hex Dumbbell Set',
    desc: 'Rubber-coated | Anti-roll',
    price: '₹2,499',
    oldPrice: '₹3,200',
    tag: 'New',
    imgSrc: '/sports-hexa-pvc-dumbbells-8-0-fitbox-sports-original-imahf77zyfemq8nj.webp',
    hoverImgSrc: '/sports-hexa-pvc-dumbbells-10-0-fitbox-sports-original-imahf77zhdyyyghx.webp',
  },
  {
    id: 2,
    name: 'Basket Ball Size-7',
    desc: '29.5" Circumference | 8-Panel Design',
    price: '₹1,799',
    oldPrice: '₹2,100',
    tag: 'New',
    imgSrc: '/450-475-basketball-official-professional-match-ball-indoor-original-imahf79f7pmsybhj.webp',
    hoverImgSrc: '/450-475-basketball-official-professional-match-ball-indoor-original-imahf79fdpsbjjkj.webp',
  },
  {
    id: 3,
    name: 'Shaker Pro 700ml',
    desc: 'Leak-proof | BPA-free',
    price: '₹499',
    oldPrice: '₹699',
    tag: 'New',
    imgSrc: '/700-supplements-shaker-bottle-for-protein-pre-post-workout-700ml-original-imahfgyeae98gqtf.webp',
    hoverImgSrc: '/700-supplements-shaker-bottle-for-protein-pre-post-workout-original-imahfgyh5fg5pgfh.webp',
  },
  {
    id: 4,
    name: 'Premium kettlebell (MultiColor)',
    desc: 'Set of 2 | All levels',
    price: '₹849',
    oldPrice: '₹1,200',
    tag: 'New',
    imgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9knq3knt5gv.webp',
    hoverImgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.webp',
  },
  {
    id: 5,
    name: 'Gym Gloves V2',
    desc: 'Full palm pad | Wrist wrap',
    price: '₹699',
    oldPrice: '₹999',
    tag: 'New',
    imgSrc: '/left-right-free-size-gym-gloves-foam-padded-with-wrist-support-original-imahfeyvyfbv6rrv.webp',
    hoverImgSrc: '/left-right-free-size-gym-gloves-foam-padded-with-wrist-support-original-imahfeyvyazs6d4z.webp'
  },
  {
    id: 6,
    name: 'Fabric Resistance Band (Workout Hip Band)',
    desc: 'Non-slip fabric | Durable elastic',
    price: '₹499',
    oldPrice: '₹600',
    tag: 'New',
    imgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztkrqjxtzh.webp',
    hoverImgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.webp'
  },
];

/* Best Sellers – expanded to 30 items for infinite scroll feel */
const bestSellers = [
  {
    id: 101,
    name: 'Cast Iron Kettlebell',
    desc: 'Solid cast iron | Matte finish',
    price: '₹1,499',
    oldPrice: '₹1,999',
    imgSrc: 'premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.webp',
  },
  {
    id: 102,
    name: 'Viper Cricket Bat',
    desc: 'Heavy duty | Plastic',
    price: '₹1,299',
    oldPrice: '₹1,599',
    imgSrc: '/Bat.webp',
  },
  {
    id: 103,
    name: 'Boxing Focus Pads',
    desc: 'Curved design | High density',
    price: '₹899',
    oldPrice: '₹1,199',
    imgSrc: 'boxing-focus-pads-mitts-curved-punching-pads-with-high-density-original-imahfewzq5ucedvy.webp',
  },
  {
    id: 104,
    name: 'Weighted Vest 10kg',
    desc: 'Adjustable weight | Breathable',
    price: '₹2,999',
    oldPrice: '₹3,499',
    imgSrc: 'adjustable-weighted-vest-10kg-with-removable-weight-weighted-original-imahfgfcuf3thayh.webp',
  },
  {
    id: 105,
    name: 'Hand Gripper Pro',
    desc: 'Adjustable 10-60kg | Counter',
    price: '₹299',
    oldPrice: '₹499',
    imgSrc: '/adjustable-hand-grip-strengthener-with-counter-for-men-women-for-original-imahf76tquhzhgu9.webp',
  },
  {
    id: 106,
    name: 'Toning Tube Set',
    desc: '3 resistance levels | Handles',
    price: '₹749',
    oldPrice: '₹999',
    imgSrc: 'double-toning-tube-resistance-band-for-workout-for-men-women-1-original-imah7wwjgnvvvzhu.webp',
  },
  ...Array.from({ length: 34 }).map((_, i) => ({
    id: 107 + i,
    name: `New Product ${i + 1}`,
    desc: 'Product description goes here',
    price: '₹999',
    oldPrice: '₹1,299',
    imgSrc: '', // Placeholder for user to add images later
  }))
];

const bsChunks = [];
for (let i = 0; i < bestSellers.length; i += 8) {
  bsChunks.push(bestSellers.slice(i, i + 8));
}

/* Customer Reviews data */
const customerReviews = [
  { id: 1, gender: 'Female', name: 'Akanshi', source: 'Amazon', review: 'Amazing product if you’re a beginner and looking for affordable dumbbells this is it go for it although these are little big in size but it’s okay', stars: 5 },
  { id: 2, gender: 'male', name: 'Vaibhav Kadam', source: 'Flipkart', review: 'Very Nice Product in Cheap Price ... thank You...', stars: 5 },
  { id: 3, gender: 'male', name: 'Mithun', source: 'Amazon', review: 'It\'s really fantastic for home workout. Don\'t miss this guys', stars: 5 },
  { id: 4, gender: 'male', name: 'Ayush Yadav', source: 'Flipkart', review: 'It\'s a great product to keep your body in shape', stars: 5 },
  { id: 5, gender: 'male', name: 'SAURABH SINGH', source: 'Amazon', review: 'Good product for home workouts. The plates (plate is filled with concrete) feel strong and durable, and the grip is comfortable.', stars: 4 },
  { id: 6, gender: 'Female', name: 'Akanshi', source: 'FlipKart', review: 'Good product. Only 1-2 plates were damaged and all are good', stars: 4 },

];

/* Our Products – each card is Amazon-style: heading + 2x2 grid + "See all" */
const ourProductCards = [
  {
    id: 'op-1',
    heading: 'Strength Training',
    seeAllPath: '/category/dumbbells',
    items: [
      { id: 'op-1-a', label: 'Dumbbells', path: '/category/dumbbells', imgSrc: '517FvNN-33L.webp' },
      { id: 'op-1-b', label: 'Kettlebell', path: '/category/kettlebells', imgSrc: 'abcde.webp' },
      { id: 'op-1-c', label: 'Weight Vest', path: '/category/weighted-vests', imgSrc: 'vest square.webp' },
      { id: 'op-1-d', label: 'Ankle Weights', path: '/category/wall-mounting', imgSrc: 'ankle-weight-wrist-weight-1kg-0-5kg-x-2-for-running-boxing-original-imahgz4sf9bbxghv.webp' },
    ],
  },
  {
    id: 'op-2',
    heading: 'Workout Essentials',
    seeAllPath: '/category/ropes',
    items: [
      { id: 'op-2-a', label: 'Yoga Belt', path: '/category/belts', imgSrc: '183-yoga-belt-for-men-and-women-yoga-strap-for-stretching-with-original-imahfdw7f5ffqchh.webp' },
      { id: 'op-2-b', label: 'Toning Tube', path: '/category/toning-tube', imgSrc: 'toning.webp' },
      { id: 'op-2-c', label: 'Skipping Rope', path: '/category/ropes', imgSrc: 'rope.webp' },
      { id: 'op-2-d', label: 'Push-up Bar', path: '/category/push-up-bars', imgSrc: ' barrr.webp' },
    ],
  },
  {
    id: 'op-3',
    heading: 'Support & Protection',
    seeAllPath: '/category/gloves',
    items: [
      { id: 'op-3-a', label: 'Wrist Supporter', path: '/category/supporters', imgSrc: 'supporters.webp' },
      { id: 'op-3-b', label: 'Lifting Belts', path: '/category/belts', imgSrc: 'left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86nwz3u6bh.webp' },
      { id: 'op-3-c', label: 'Gym Gloves', path: '/category/gloves', imgSrc: 'gloves.webp' },
      { id: 'op-3-d', label: 'Hand Gripper', path: '/category/grippers', imgSrc: 'gripper.webp' },
    ],
  },
  {
    id: 'op-4',
    heading: 'Sports & Training',
    seeAllPath: '/category/balls',
    items: [
      { id: 'op-4-a', label: 'Football', path: '/category/balls', imgSrc: '450-pro-league-football-32-panel-rubber-moulded-design-for-original-imahfff8yuaymr7e.webp' },
      { id: 'op-4-b', label: 'Cricket Ball', path: '/category/balls', imgSrc: 'balls.webp' },
      { id: 'op-4-c', label: 'Pickleball', path: '/category/bats', imgSrc: 'pickleball-paddle-premium-boarded-composite-surface-shock-original-imahf7bcseafvhaz.webp' },
      { id: 'op-4-da', label: 'Basketball', path: '/category/balls', imgSrc: '450-475-basketball-official-professional-match-ball-indoor-original-imahf79fgrnzr9m4.webp' },

    ],
  },
  {
    id: 'op-5',
    heading: 'Lifestyle & Accessories',
    seeAllPath: '/category/shakers',
    items: [
      { id: 'op-5-a', label: 'T-shirt', path: '/category/clothing', imgSrc: 's-t-shirt-for-gym-fitbox-sports-original-imahf8gpbqppvzzz-removebg-preview.webp' },
      { id: 'op-5-b', label: 'Boxing Gloves', path: '/category/gloves', imgSrc: 'boxing.webp' },
      { id: 'op-5-c', label: 'Shakers', path: '/category/shakers', imgSrc: '51qT2eMcH1L.webp' },
      { id: 'op-5-d', label: 'Wall Mountings', path: '/category/wall-mounting', imgSrc: 'wall-mounting-chin-up-bar-pull-up-bar-ab-straps-combo-120-kg-original-imahfezwwygtzfdd.webp' },
    ],
  },
];

/* Platforms availability data */
const availabilityPlatforms = [
  { id: 'p1', label: 'Amazon', imgSrc: '/amazon.webp' },
  { id: 'p2', label: 'Swiggy', imgSrc: '/Swiggy.webp' },
  { id: 'p3', label: 'FitBox.com', imgSrc: '/favicon.webp' },
  { id: 'p4', label: 'Blinkit', imgSrc: '/blinkit.webp' },


];

/* ═══════════════════════════════════════
   MOBILE ROW CAROUSEL COMPONENT
═══════════════════════════════════════ */
const MobileRowCarousel = ({ products }) => {
  const [idx, setIdx] = useState(products.length);
  const [trans, setTrans] = useState(true);
  const [busy, setBusy] = useState(false);

  const next = () => {
    if (busy) return;
    setBusy(true);
    setIdx((p) => p + 1);
    setTimeout(() => setBusy(false), 550);
  };
  const prev = () => {
    if (busy) return;
    setBusy(true);
    setIdx((p) => p - 1);
    setTimeout(() => setBusy(false), 550);
  };

  useEffect(() => {
    if (idx >= products.length * 2) {
      setTimeout(() => { setTrans(false); setIdx(products.length); }, 500);
    }
    if (idx < products.length) {
      setTimeout(() => { setTrans(false); setIdx(products.length * 2 - 1); }, 500);
    }
  }, [idx, products.length]);

  useEffect(() => {
    if (!trans) {
      const timer = setTimeout(() => setTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [trans]);

  const startX = useRef(0);
  const handleTouchStart = (e) => (startX.current = e.touches[0].pageX);
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (startX.current - endX > 50) next();
    if (endX - startX.current > 50) prev();
  };

  return (
    <div className="carousel-wrapper bs-mobile-row">
      <div className="carousel-content">
        <div className="carousel-viewport">
          <div
            className="carousel-track-simple"
            style={{
              transform: `translateX(calc(-${idx} * 80%))`,
              transition: trans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {[...products, ...products, ...products].map((product, i) => (
              <div className="na-mobile-carousel bs-card-wrap" key={`${product.id}-${i}`} style={{ width: '80%' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="side-nav-btn left" onClick={prev} aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button className="side-nav-btn right" onClick={next} aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════
   HOME PAGE COMPONENT
═══════════════════════════════════════ */

/* ── Digit Roll Component (Defined outside to prevent re-mounts) ── */
const DigitRoll = memo(({ start, target, duration, delay, reverse }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay + 1000); // 1s hold to see 9,99,999

    return () => clearTimeout(timer);
  }, [delay]);

  const opacityStyle = {
    opacity: (start === ' ' && !isAnimating) ? 0 : 1,
    transition: 'opacity 0.2s ease-in'
  };

  if (target === ',' || target === '.') {
    return (
      <span className="digit-roll-container is-comma" style={opacityStyle}>
        <span className="digit-val">{target}</span>
      </span>
    );
  }

  // Create a sequence strip based on the request (9 to 0 rollover)
  const numbers = [];
  if (start === ' ' && target === '1') {
    numbers.push('1'); // Just the target 1
  } else if (start === '9' && target === '0') {
    // Rolling from 9 back to 0 in casino style
    if (reverse) {
      // Ascending sequence for reverse spin
      numbers.push('9');
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j <= 9; j++) numbers.push(j.toString());
      }
      numbers.push('0');
    } else {
      // Descending sequence for normal spin
      for (let i = 0; i < 2; i++) {
        for (let j = 9; j >= 0; j--) numbers.push(j.toString());
      }
    }
  } else {
    numbers.push(start, target);
  }

  const totalItems = numbers.length;
  const finalTransform = -((totalItems - 1) / totalItems) * 100;

  return (
    <span className="digit-roll-container" style={opacityStyle}>
      <span
        className="digit-strip"
        style={{
          transform: (isAnimating && numbers.length > 1) ? `translateY(${finalTransform}%)` : 'translateY(0)',
          transition: isAnimating
            ? `transform ${duration}ms cubic-bezier(0.15, 0, 0.15, 1)`
            : 'none'
        }}
      >
        {numbers.map((n, idx) => (
          <span key={idx} className="digit-val">{n}</span>
        ))}
      </span>
    </span>
  );
});

export default function Home() {

  /* ── Hot Products Carousel State (Infinite) ── */
  const [hpCurrent, setHpCurrent] = useState(hotProducts.length);
  const [hpTrans, setHpTrans] = useState(true);
  const hpStartY = useRef(0);
  const hpStartX = useRef(0);
  const [hpWishlist, setHpWishlist] = useState([]);

  const toggleHpWishlist = (id) => {
    setHpWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const hpNext = () => {
    setHpCurrent(prev => prev + 1);
  };

  /* ── Category Swipe & Scroll state ── */
  const catTrackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollPos = useRef(0);
  const autoScrollSpeed = 0.6; // pixels per frame

  /* ── Posters Carousel State (Infinite & Arrow-free) ── */
  const [postIdx, setPostIdx] = useState(posterImages.length);
  const [postTrans, setPostTrans] = useState(true);
  const [postBusy, setPostBusy] = useState(false);

  const postNext = () => {
    if (postBusy) return;
    setPostBusy(true);
    setPostIdx(p => p + 1);
    setTimeout(() => setPostBusy(false), 550);
  };
  const postPrev = () => {
    if (postBusy) return;
    setPostBusy(true);
    setPostIdx(p => p - 1);
    setTimeout(() => setPostBusy(false), 550);
  };

  useEffect(() => {
    if (postIdx >= posterImages.length * 2) {
      setTimeout(() => { setPostTrans(false); setPostIdx(posterImages.length); }, 500);
    }
    if (postIdx < posterImages.length) {
      setTimeout(() => { setPostTrans(false); setPostIdx(posterImages.length * 2 - 1); }, 500);
    }
  }, [postIdx]);

  useEffect(() => {
    if (!postTrans) {
      const timer = setTimeout(() => setPostTrans(true), 50);
      return () => clearTimeout(timer);
    }
  }, [postTrans]);

  // Swipe for Posters
  const postStartX = useRef(0);
  const handlePostTouchStart = (e) => (postStartX.current = e.touches[0].pageX);
  const handlePostTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (postStartX.current - endX > 50) postNext();
    if (endX - postStartX.current > 50) postPrev();
  };

  /* ── Scroll Reveal Logic for Titles & Rows ── */
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.scroll-reveal-title, .reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const postersTrackRef = useRef(null);
  const isDraggingPosters = useRef(false);
  const startXPosters = useRef(0);
  const scrollPosPosters = useRef(0);

  useEffect(() => {
    let animationId;
    const track = postersTrackRef.current;
    if (!track) return;

    const animate = () => {
      if (!isDraggingPosters.current) {
        const totalWidth = track.scrollWidth;
        const halfWidth = totalWidth / 2;
        scrollPosPosters.current -= autoScrollSpeed;
        if (Math.abs(scrollPosPosters.current) >= halfWidth) {
          scrollPosPosters.current = 0;
        }
        track.style.transform = `translateX(${scrollPosPosters.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleStart = (e) => {
      isDraggingPosters.current = true;
      startXPosters.current = (e.pageX || e.touches[0].pageX) - scrollPosPosters.current;
      track.style.cursor = 'grabbing';
    };

    const handleMove = (e) => {
      if (!isDraggingPosters.current) return;
      const totalWidth = track.scrollWidth;
      const halfWidth = totalWidth / 2;
      const x = e.pageX || e.touches[0].pageX;
      const walk = x - startXPosters.current;
      scrollPosPosters.current = walk;
      if (scrollPosPosters.current > 0) scrollPosPosters.current = -halfWidth;
      if (Math.abs(scrollPosPosters.current) >= halfWidth) scrollPosPosters.current = 0;
      track.style.transform = `translateX(${scrollPosPosters.current}px)`;
    };

    const handleEnd = () => {
      isDraggingPosters.current = false;
      track.style.cursor = 'grab';
    };

    track.addEventListener('mousedown', handleStart);
    track.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    track.addEventListener('touchstart', handleStart);
    track.addEventListener('touchmove', handleMove);
    track.addEventListener('touchend', handleEnd);

    return () => {
      cancelAnimationFrame(animationId);
      track.removeEventListener('mousedown', handleStart);
      track.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      track.removeEventListener('touchstart', handleStart);
      track.removeEventListener('touchmove', handleMove);
      track.removeEventListener('touchend', handleEnd);
    };
  }, []);

  useEffect(() => {
    let animationId;
    const track = catTrackRef.current;
    if (!track) return;

    const animate = () => {
      if (!isDragging.current) {
        const totalWidth = track.scrollWidth;
        const setWidth = totalWidth / 3; // 3 repetitions
        scrollPos.current -= autoScrollSpeed;
        if (Math.abs(scrollPos.current) >= setWidth) {
          scrollPos.current = 0;
        }
        track.style.transform = `translateX(${scrollPos.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleStart = (e) => {
      isDragging.current = true;
      startX.current = (e.pageX || e.touches[0].pageX) - scrollPos.current;
      track.style.cursor = 'grabbing';
    };

    const handleMove = (e) => {
      if (!isDragging.current) return;
      const x = e.pageX || e.touches[0].pageX;
      const walk = x - startX.current;
      scrollPos.current = walk;
      const setWidth = track.scrollWidth / 3;
      if (scrollPos.current > 0) scrollPos.current = -setWidth;
      if (Math.abs(scrollPos.current) >= setWidth) scrollPos.current = 0;
      track.style.transform = `translateX(${scrollPos.current}px)`;
    };

    const handleEnd = () => {
      isDragging.current = false;
      track.style.cursor = 'grab';
    };

    track.addEventListener('mousedown', handleStart);
    track.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    track.addEventListener('touchstart', handleStart);
    track.addEventListener('touchmove', handleMove);
    track.addEventListener('touchend', handleEnd);

    return () => {
      cancelAnimationFrame(animationId);
      track.removeEventListener('mousedown', handleStart);
      track.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      track.removeEventListener('touchstart', handleStart);
      track.removeEventListener('touchmove', handleMove);
      track.removeEventListener('touchend', handleEnd);
    };
  }, []);

  /* ── Availability Swipe & Scroll logic ── */
  const availTrackRef = useRef(null);
  const isDraggingAvail = useRef(false);
  const startXAvail = useRef(0);
  const scrollPosAvail = useRef(0);

  useEffect(() => {
    const track = availTrackRef.current;
    if (!track) return;

    let animationId;
    const totalWidth = track.scrollWidth;
    const halfWidth = totalWidth / 2;

    const animate = () => {
      if (!isDraggingAvail.current) {
        const totalWidth = track.scrollWidth;
        const setWidth = totalWidth / 3;
        scrollPosAvail.current -= autoScrollSpeed;
        if (Math.abs(scrollPosAvail.current) >= setWidth) {
          scrollPosAvail.current = 0;
        }
        track.style.transform = `translateX(${scrollPosAvail.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleStart = (e) => {
      isDraggingAvail.current = true;
      startXAvail.current = (e.pageX || e.touches[0].pageX) - scrollPosAvail.current;
      track.style.cursor = 'grabbing';
    };

    const handleMove = (e) => {
      if (!isDraggingAvail.current) return;
      const x = e.pageX || e.touches[0].pageX;
      const walk = x - startXAvail.current;
      scrollPosAvail.current = walk;
      const setWidth = track.scrollWidth / 3;
      if (scrollPosAvail.current > 0) scrollPosAvail.current = -setWidth;
      if (Math.abs(scrollPosAvail.current) >= setWidth) scrollPosAvail.current = 0;
      track.style.transform = `translateX(${scrollPosAvail.current}px)`;
    };

    const handleEnd = () => {
      isDraggingAvail.current = false;
      track.style.cursor = 'grab';
    };

    track.addEventListener('mousedown', handleStart);
    track.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    track.addEventListener('touchstart', handleStart);
    track.addEventListener('touchmove', handleMove);
    track.addEventListener('touchend', handleEnd);

    return () => {
      cancelAnimationFrame(animationId);
      track.removeEventListener('mousedown', handleStart);
      track.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      track.removeEventListener('touchstart', handleStart);
      track.removeEventListener('touchmove', handleMove);
      track.removeEventListener('touchend', handleEnd);
    };
  }, []);



  /* ── New Arrivals carousel state (Infinite) ── */
  const [naIdx, setNaIdx] = useState(newArrivals.length);
  const [naTrans, setNaTrans] = useState(true);
  const [naBusy, setNaBusy] = useState(false);

  const naNext = () => {
    if (naBusy) return;
    setNaBusy(true);
    setNaIdx((p) => p + 1);
    setTimeout(() => setNaBusy(false), 550);
  };
  const naPrev = () => {
    if (naBusy) return;
    setNaBusy(true);
    setNaIdx((p) => p - 1);
    setTimeout(() => setNaBusy(false), 550);
  };

  useEffect(() => {
    if (naIdx >= newArrivals.length * 2) {
      setTimeout(() => { setNaTrans(false); setNaIdx(newArrivals.length); }, 500);
    }
    if (naIdx < newArrivals.length) {
      setTimeout(() => { setNaTrans(false); setNaIdx(newArrivals.length * 2 - 1); }, 500);
    }
  }, [naIdx]);

  useEffect(() => {
    if (!naTrans) {
      const timer = setTimeout(() => setNaTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [naTrans]);

  // Swipe for New Arrivals
  const naStartX = useRef(0);
  const handleNaTouchStart = (e) => (naStartX.current = e.touches[0].pageX);
  const handleNaTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (naStartX.current - endX > 50) naNext();
    if (endX - naStartX.current > 50) naPrev();
  };

  /* Best Sellers state removed. Now handled inside MobileRowCarousel component. */

  /* ── Our Products carousel state (Infinite) ── */
  const [opIdx, setOpIdx] = useState(ourProductCards.length);
  const [opTrans, setOpTrans] = useState(true);
  const [opBusy, setOpBusy] = useState(false);

  const opNext = () => {
    if (opBusy) return;
    setOpBusy(true);
    setOpIdx((p) => p + 1);
    setTimeout(() => setOpBusy(false), 550);
  };
  const opPrev = () => {
    if (opBusy) return;
    setOpBusy(true);
    setOpIdx((p) => p - 1);
    setTimeout(() => setOpBusy(false), 550);
  };

  useEffect(() => {
    if (opIdx >= ourProductCards.length * 2) {
      setTimeout(() => { setOpTrans(false); setOpIdx(ourProductCards.length); }, 500);
    }
    if (opIdx < ourProductCards.length) {
      setTimeout(() => { setOpTrans(false); setOpIdx(ourProductCards.length * 2 - 1); }, 500);
    }
  }, [opIdx]);

  useEffect(() => {
    if (!opTrans) {
      const timer = setTimeout(() => setOpTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [opTrans]);

  // Swipe for Our Products
  const opStartX = useRef(0);
  const handleOpTouchStart = (e) => (opStartX.current = e.touches[0].pageX);
  const handleOpTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (opStartX.current - endX > 50) opNext();
    if (endX - opStartX.current > 50) opPrev();
  };

  /* ── Reviews carousel state (Infinite) ── */
  const [revIdx, setRevIdx] = useState(customerReviews.length);
  const [revTrans, setRevTrans] = useState(true);

  const revNext = () => setRevIdx((p) => p + 1);
  const revPrev = () => setRevIdx((p) => p - 1);

  // Snap back logic for seamless infinite loop
  useEffect(() => {
    if (revIdx >= customerReviews.length * 2) {
      setTimeout(() => {
        setRevTrans(false);
        setRevIdx(customerReviews.length);
      }, 700);
    }
    if (revIdx < customerReviews.length) {
      setTimeout(() => {
        setRevTrans(false);
        setRevIdx(customerReviews.length * 2 - 1);
      }, 700);
    }
  }, [revIdx]);

  useEffect(() => {
    if (!revTrans) {
      // Re-enable transition after snap
      const timer = setTimeout(() => setRevTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [revTrans]);

  // Swipe for reviews
  const revStartX = useRef(0);
  const handleRevTouchStart = (e) => (revStartX.current = e.touches[0].pageX);
  const handleRevTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (revStartX.current - endX > 50) revNext();
    if (endX - revStartX.current > 50) revPrev();
  };



  useEffect(() => {
    if (hpCurrent >= hotProducts.length * 2) {
      setTimeout(() => {
        setHpTrans(false);
        setHpCurrent(hotProducts.length);
      }, 850);
    } else if (hpCurrent < hotProducts.length) {
      setTimeout(() => {
        setHpTrans(false);
        setHpCurrent(hotProducts.length * 2 - 1);
      }, 850);
    }
  }, [hpCurrent]);

  useEffect(() => {
    if (!hpTrans) {
      const timer = setTimeout(() => setHpTrans(true), 50);
      return () => clearTimeout(timer);
    }
  }, [hpTrans]);

  useEffect(() => {
    const hpInterval = setInterval(hpNext, 4000);
    return () => clearInterval(hpInterval);
  }, []);

  /* ── Floating back-to-top button ── */
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const targetNumber = "10,00,000";
  const startNumber = " 9,99,999";

  const [showExtra, setShowExtra] = useState(false);
  useEffect(() => {
    // Show + symbol exactly after the main rollover (1s hold + 2.5s duration)
    const timer = setTimeout(() => setShowExtra(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  /* ═══ RENDER ═══ */
  return (
    <div className="home" id="home-page">

      {/* ── Header ── */}
      <Header />
      {/* Spacer for fixed header (Main header + Sale ribbon + Sub-header = ~161px) */}
      <div className="header-spacer desktop-only-spacer" style={{ height: '161px' }} />

      {/* ══════════════════════════════════
          1. NEW HERO SECTION
      ══════════════════════════════════ */}
      <section className="new-hero" id="new-hero">
        <div className="hero-wallpaper-wrap">
          <img src="/Untitled-design-19.webp" alt="Hero Background" className="hero-wallpaper" />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-main-content">
          <div className="hero-left">
            <h1 className="hero-main-heading">
              <span className="hero-counter-wrap">
                <span className="million-highlight">
                  {targetNumber.split('').map((char, i) => {
                    const startChar = startNumber[i];

                    // Leading 1 pops in instantly after the spin ends
                    const isLeadingOne = (i === 0);
                    const delayVal = isLeadingOne ? 2500 : 0;
                    const durationVal = isLeadingOne ? 100 : 2500;
                    const isReverse = (i % 2 === 0);

                    return (
                      <DigitRoll
                        key={i}
                        start={startChar}
                        target={char}
                        duration={durationVal}
                        delay={delayVal}
                        reverse={isReverse}
                      />
                    );
                  })}
                  <span className={`plus-symbol ${showExtra ? 'visible' : ''}`}>+</span>
                </span>

              </span>
              <span className="hero-text-wrap">
                <span className="customers-served">Customers Served</span>
              </span>
              <span className="growing-strong">And Still Growing Strong</span>
            </h1>

            <div className="hero-search-box">
              <input type="text" placeholder="Search for premium gym gear..." className="hero-search-input" />
              <button className="hero-search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="search-text">Search</span>
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hp-carousel-wrapper">
              <div className="hot-products-label">HOT PRODUCTS</div>
              <div
                className="hp-carousel"
                onTouchStart={(e) => {
                  hpStartY.current = e.touches[0].clientY;
                  hpStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const touch = e.changedTouches[0];
                  const diffY = touch.clientY - hpStartY.current;
                  const diffX = touch.clientX - hpStartX.current;

                  if (window.innerWidth <= 1100) {
                    if (Math.abs(diffX) > 40) {
                      if (diffX > 0) setHpCurrent(prev => prev - 1);
                      else setHpCurrent(prev => prev + 1);
                    }
                  } else {
                    if (Math.abs(diffY) > 40) {
                      if (diffY > 0) setHpCurrent(prev => prev - 1);
                      else setHpCurrent(prev => prev + 1);
                    }
                  }
                }}
              >
                <div
                  className="hp-track"
                  style={{
                    '--hp-translate-val': `calc(-${hpCurrent} * var(--hp-step))`,
                    transition: hpTrans ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                  }}
                >
                  {[...hotProducts, ...hotProducts, ...hotProducts].map((product, i) => {
                    const isCenter = i === hpCurrent;
                    const isVisible = i >= hpCurrent - 1 && i <= hpCurrent + 1;
                    return (
                      <div
                        key={`${product.id}-${i}`}
                        className={`hp-card ${isCenter ? 'hp-card--raised' : ''} ${isVisible ? 'hp-visible' : ''}`}
                        style={{ transition: hpTrans ? '' : 'none' }}
                      >
                        <div className="hp-card-img-square">
                          <img src={product.imgSrc} alt={product.name} />
                        </div>
                        <div className="hp-card-info">
                          <p className="hp-card-name">{product.name}</p>
                          <div className="hp-card-actions">
                            <p className="hp-card-price">{product.price}</p>
                            <div className="hp-card-btns">
                              <button
                                className={`hp-card-btn-mini wishlist ${hpWishlist.includes(product.id) ? 'wished' : ''}`}
                                onClick={() => toggleHpWishlist(product.id)}
                              >
                                <svg viewBox="0 0 24 24" fill={hpWishlist.includes(product.id) ? '#ff4757' : 'none'} stroke={hpWishlist.includes(product.id) ? '#ff4757' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                              <button className="hp-card-btn-mini cart">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                  <circle cx="9" cy="21" r="1" />
                                  <circle cx="20" cy="21" r="1" />
                                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          COLLAGE SECTION
      ══════════════════════════════════ */}
      <section className="collage-section" id="collage-section">
        <div className="collage-grid">
          {collagePosters.map((poster, i) => (
            <Link key={poster.id} to={poster.link} className={`collage-item item-${i + 1} reveal-on-scroll`}>
              {poster.imgSrc ? (
                <picture style={{ width: '100%', height: '100%' }}>
                  {poster.mobileImgSrc && (
                    <source media="(max-width: 600px)" srcSet={poster.mobileImgSrc} />
                  )}
                  <img src={poster.imgSrc} alt="Promotion" loading="lazy" decoding="async" />
                </picture>
              ) : (
                <div className="poster-placeholder">Poster {i + 1}</div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          2. CATEGORY STRIP
          Infinite auto-scrolling pill row
      ══════════════════════════════════ */}
      <section className="cat-strip" id="category-strip" aria-label="Shop by category">
        <div className="cat-strip-header">
          <h2 className="strip-heading scroll-reveal-title">Shop by Category</h2>
          <p className="strip-sub">Explore our complete range of gym essentials</p>
        </div>

        {/* Duplicate categories array for seamless infinite loop */}
        <div className="cat-scroll-outer" id="cat-scroll-outer">
          <div
            className="cat-scroll-track"
            id="cat-scroll-track"
            ref={catTrackRef}
            style={{ cursor: 'grab' }}
          >
            {[...categories, ...categories, ...categories].map((cat, i) => (
              <Link
                key={`${cat.id}-${i}`}
                to={cat.path}
                className="cat-pill"
                id={`cat-pill-${cat.id}-${i}`}
              >
                <div className="cat-circle">
                  {cat.imgSrc && <img src={cat.imgSrc} alt={cat.label} className="cat-img" loading="lazy" decoding="async" />}
                </div>
                <span className="cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. NEW ARRIVALS
          Carousel of ProductCards
      ══════════════════════════════════ */}
      <section className="arrivals-section" id="new-arrivals" aria-label="New arrivals">
        <div className="section-header">
          <div className="section-heading-group">
            <span className="section-eyebrow">Fresh Stock</span>
            <h2 className="section-title scroll-reveal-title">New Arrivals</h2>
          </div>
        </div>

        <div className="carousel-wrapper na-mobile-row">
          <div className="carousel-content">
            <div className="carousel-viewport">
              <div
                className="carousel-track-simple"
                style={{
                  transform: `translateX(calc(-${naIdx} * var(--na-step, 25%)))`,
                  transition: naTrans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                }}
                onTouchStart={handleNaTouchStart}
                onTouchEnd={handleNaTouchEnd}
              >
                {[...newArrivals, ...newArrivals, ...newArrivals].map((product, i) => (
                  <div className="na-mobile-carousel na-card-wrap" key={`${product.id}-${i}`} style={{ width: 'var(--na-step, 25%)' }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="side-nav-btn left" onClick={naPrev} aria-label="Previous arrivals">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="side-nav-btn right" onClick={naNext} aria-label="Next arrivals">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. POSTERS SECTION (GRID & SCROLL)
      ══════════════════════════════════ */}
      <section className="posters-section" id="posters-grid">
        {/* Desktop Grid */}
        <div className="posters-grid posters-desktop">
          {posterImages.map((poster) => (
            <Link key={poster.id} to={poster.link} className="poster-item reveal-on-scroll">
              <img src={poster.imgSrc} alt="Promotion" loading="lazy" decoding="async" />
            </Link>
          ))}
        </div>

        {/* Mobile Infinite Swipe (One by one, no arrows) */}
        <div className="posters-mobile reveal-on-scroll">
          <div className="carousel-wrapper">
            <div className="carousel-content">
              <div className="carousel-viewport">
                <div
                  className="carousel-track-simple"
                  style={{
                    transform: `translateX(calc(-${postIdx} * 100%))`,
                    transition: postTrans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                  }}
                  onTouchStart={handlePostTouchStart}
                  onTouchEnd={handlePostTouchEnd}
                >
                  {[...posterImages, ...posterImages, ...posterImages].map((poster, i) => (
                    <div className="na-mobile-carousel" key={`${poster.id}-${i}`} style={{ minWidth: '100%' }}>
                      <Link to={poster.link} className="poster-item">
                        <img
                          src={poster.mobileImgSrc || poster.imgSrc}
                          alt="Promotion"
                          style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ═════════════════════════════════
          6. OUR BEST SELLERS
          Grid of ProductCards
      ══════════════════════════════════ */}
      <section className="arrivals-section" id="best-sellers" aria-label="Best sellers">
        <div className="section-header">
          <div className="section-heading-group">
            <span className="section-eyebrow">Top Rated</span>
            <h2 className="section-title scroll-reveal-title">Our Best Sellers</h2>
          </div>
        </div>

        {/* Desktop Grid (Hidden on Mobile) */}
        <div className="best-sellers-grid bs-desktop">
          {bestSellers.map((product) => (
            <div key={product.id} className="reveal-on-scroll">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile Carousels (5 Rows, Independent, Hidden on Desktop) */}
        <div className="bs-mobile">
          <div className="bs-mobile-multi-rows">
            {bsChunks.map((chunk, rowIdx) => (
              <div key={`bs-row-reveal-${rowIdx}`} className="reveal-on-scroll">
                <MobileRowCarousel products={chunk} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. OUR PRODUCTS
          Grid of Amazon-style CategoryGridCards
          Each card: heading + 2x2 sub-items + "See all"
      ══════════════════════════════════ */}
      <section className="our-products" id="our-products" aria-label="Our products">
        <div className="section-header centered">
          <span className="section-eyebrow">What We Offer</span>
          <h2 className="section-title scroll-reveal-title">Explore Our Range</h2>
          <p className="section-meta">Quality gear curated for every fitness level</p>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-content">
            <div className="carousel-viewport">
              <div
                className="carousel-track-simple"
                style={{
                  transform: `translateX(calc(-${opIdx} * (100% / var(--visible-count))))`,
                  transition: opTrans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                }}
                onTouchStart={handleOpTouchStart}
                onTouchEnd={handleOpTouchEnd}
              >
                {[...ourProductCards, ...ourProductCards, ...ourProductCards].map((card, i) => (
                  <div className="na-mobile-carousel" key={`${card.id}-${i}`}>
                    <CategoryGridCard card={card} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="side-nav-btn left" onClick={opPrev} aria-label="Previous products">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="side-nav-btn right" onClick={opNext} aria-label="Next products">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. CUSTOMER REVIEWS
          Carousel of 3 review cards
      ══════════════════════════════════ */}
      <section className="reviews-section" id="reviews" aria-label="Customer reviews">
        <div className="section-header centered">
          <h2 className="section-title scroll-reveal-title">Why Choose Us!</h2>
          <span className="section-eyebrow">Happy Customers</span>
        </div>

        <div className="reviews-carousel-wrapper">
          <button className="side-nav-btn left" onClick={revPrev} aria-label="Previous review">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div
            className="reviews-carousel"
            onTouchStart={handleRevTouchStart}
            onTouchEnd={handleRevTouchEnd}
          >
            <div
              className="reviews-track"
              style={{
                transform: `translateX(calc(-${revIdx} * var(--review-step)))`,
                transition: revTrans ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
            >
              {[...customerReviews, ...customerReviews, ...customerReviews].map((rev, i) => (
                <div
                  key={`${rev.id}-${i}`}
                  className={`review-card ${i === revIdx ? 'review-card--raised' : ''}`}
                >
                  <div className="review-icon">
                    {rev.gender === 'male' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="7" r="5" />
                        <path d="M17 14h.35c.91 0 1.65.74 1.65 1.65v.7c0 .91-.74 1.65-1.65 1.65H17l-1 5h-8l-1-5h-.35C6.09 18 5.35 17.26 5.35 16.35v-.7c0-.91.74-1.65 1.65-1.65H7.35" />
                      </svg>
                    )}
                  </div>
                  <div className="review-source">Verified Purchase on {rev.source}</div>
                  <div className="review-stars">
                    {'★'.repeat(rev.stars)}{'☆'.repeat(5 - rev.stars)}
                  </div>
                  <h3 className="review-name">{rev.name}</h3>
                  <p className="review-text">"{rev.review}"</p>
                </div>
              ))}
            </div>
          </div>

          <button className="side-nav-btn right" onClick={revNext} aria-label="Next review">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. AVAILABILITY STRIP
          Same functionality as Category Strip
      ══════════════════════════════════ */}
      <section className="cat-strip availability-strip" id="availability-strip" aria-label="We are available on">
        <div className="cat-strip-header centered">
          <h2 className="strip-heading scroll-reveal-title">We are Available on</h2>
          <p className="strip-sub">Find our premium products on your favorite platforms</p>
        </div>

        <div className="cat-scroll-outer" id="avail-scroll-outer">
          <div
            className="cat-scroll-track"
            id="avail-scroll-track"
            ref={availTrackRef}
            style={{ cursor: 'grab' }}
          >
            {[...availabilityPlatforms, ...availabilityPlatforms, ...availabilityPlatforms].map((plat, i) => (
              <div
                key={`${plat.id}-${i}`}
                className="cat-pill"
              >
                <div className="cat-circle">
                  {plat.imgSrc && <img src={plat.imgSrc} alt={plat.label} className="cat-img" loading="lazy" decoding="async" />}
                </div>
                <span className="cat-label">{plat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          8. BACK TO TOP
          Full-width button + floating bubble
      ══════════════════════════════════ */}
      <div className="back-top-wrap" id="back-top-wrap">
        <button
          className={`back-top-btn ${showTop ? 'back-top-btn--visible' : ''}`}
          id="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll back to top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          Back to Top
        </button>
      </div>

      {/* ══════════════════════════════════
          7. FOOTER
      ══════════════════════════════════ */}
      <Footer />

      {/* Floating scroll-to-top bubble (appears after scrolling 400px) */}
      {showTop && (
        <button className="float-top-btn" id="float-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

    </div>
  );
}
