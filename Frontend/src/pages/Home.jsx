import { useState, useEffect, useRef } from 'react';
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

/* Hero slides – 3 slides, auto-swap every 3 seconds */
const heroSlides = [
  {
    id: 1,
    title: 'Elite Toning Tubes',
    subtitle: 'Sculpt your physique with high-resistance exercise bands.',
    cta: 'Shop Now',
    ctaLink: '/accessories',
    bg: 'linear-gradient(135deg, #0d1b1a 60%, #1a3a35 100%)', // Lime Green Theme
    accent: '#a8e063',
    imgSrc: '/toning-tube-with-door-anchor-resistance-exercise-band-original-imahf8jsxqtjeedu.jpeg',
  },
  {
    id: 2,
    title: 'Max Impact Training',
    subtitle: 'Push your limits with our premium adjustable weighted vests.',
    cta: 'Shop Now',
    ctaLink: '/homegym',
    bg: 'linear-gradient(135deg, #1f1f1f 60%, #3d3d3d 100%)', // Gray Theme
    accent: '#bdc3c7',
    imgSrc: '/weighted-vest-for-training-running-boxing-jogging-cycling-original-imahfex6zaph8zkh.jpeg',
  },
  {
    id: 3,
    title: 'Pro-Grade Dumbbells',
    subtitle: 'Built for strength, designed for results. Explore our PVC sets.',
    cta: 'Shop Now',
    ctaLink: '/dumbbells',
    bg: 'linear-gradient(135deg, #1b1a0d 60%, #3a351a 100%)', // Yellow Theme
    accent: '#f1c40f',
    imgSrc: '/sports-hexa-pvc-dumbbells-2-fitbox-sports-original-imahgz5rfzebvzh9.jpeg',
  },
  {
    id: 4,
    title: 'Premium Kettlebells',
    subtitle: 'Vinyl-coated solid cast iron for the ultimate home workout.',
    cta: 'Shop Now',
    ctaLink: '/dumbbells',
    bg: 'linear-gradient(135deg, #0d141b 60%, #1a2a3a 100%)', // Blue Theme
    accent: '#3498db',
    imgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kn4chrnyte.jpeg',
  },
  {
    id: 5,
    title: 'Grip Like a Pro',
    subtitle: 'Adjustable 10kg hand exercisers to master your forearm strength.',
    cta: 'Shop Now',
    ctaLink: '/accessories',
    bg: 'linear-gradient(135deg, #1b130d 60%, #3a2a1a 100%)', // Orange Theme
    accent: '#e67e22',
    imgSrc: '/hand-gripper-for-best-hand-exerciser-grip-adjustable-10kg-hand-original-imagtykf3fg5qhnj.jpeg',
  },
  {
    id: 6,
    title: 'The Viper Series',
    subtitle: 'Professional full-size heavy-duty bats for every champion.',
    cta: 'Shop Now',
    ctaLink: '/balls',
    bg: 'linear-gradient(135deg, #050505 60%, #1a1a1a 100%)', // Black Theme
    accent: '#ffffff',
    imgSrc: '/800-viper-series-full-size-heavy-duty-plastic-cricket-bat-original-imahfezjqfbhzth4.jpeg',
  },
  {
    id: 7,
    title: 'Pro Boxing Pads',
    subtitle: 'High-density curved punching mitts for elite strike training.',
    cta: 'Shop Now',
    ctaLink: '/boxing',
    bg: 'linear-gradient(135deg, #1a0d0d 60%, #3a1a1a 100%)', // Red Theme
    accent: '#ff4b2b',
    imgSrc: '/boxing-focus-pads-mitts-curved-punching-pads-with-high-density-original-imahfewzfbarhzve.jpeg',
  },
];

/* Promo banner slides – 9 banners, auto-swap every 3 seconds */
const bannerSlides = [
  { id: 'b1', imgSrc: '/1.jpg-scaled.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b2', imgSrc: '/2.jpg-scaled.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b3', imgSrc: '/3.jpg-scaled.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b4', imgSrc: '/4.jpg.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b5', imgSrc: '/5-scaled.jpg', link: '/products', cta: 'Shop Now' },
  { id: 'b6', imgSrc: '/6.jpg.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b7', imgSrc: '/7.jpg.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b8', imgSrc: '/8.jpg.jpeg', link: '/products', cta: 'Shop Now' },
  { id: 'b9', imgSrc: '/9.jpg.jpeg', link: '/products', cta: 'Shop Now' },
];

/* Category pills – infinite scrolling strip */
const categories = [
  { id: 1, label: 'Wall Mounting', path: '/wall-mounting', imgSrc: '/wall-mounting-chin-up-bar-pull-up-bar-ab-straps-combo-120-kg-original-imahfezwmkwx4ubs.jpeg' },
  { id: 2, label: 'Weighted Vests', path: '/weighted-vests', imgSrc: '/weighted-vest-for-training-running-boxing-jogging-cycling-original-imahfex6y5zxfhsz.jpeg' },
  { id: 3, label: 'Clothing', path: '/clothing', imgSrc: '/s-t-shirt-for-gym-fitbox-sports-original-imahf8gphqczzqsg-removebg-preview.png' },
  { id: 4, label: 'Balls', path: '/balls', imgSrc: '/71di3zpn2mL.jpg' },
  { id: 5, label: 'Toning Tube', path: '/toning-tube', imgSrc: '/toning-tube-with-door-anchor-resistance-exercise-band-original-imahf8jsgygz9hk4.jpeg' },
  { id: 6, label: 'Dumbbells', path: '/dumbbells', imgSrc: '/neoprene-coated-cast-iron-dumbbells-for-exercise-fitness-original-imahf9mxbhghmgfz.jpeg' },
  { id: 7, label: 'Resistance Bands', path: '/accessories', imgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.jpeg' },
  { id: 8, label: 'Ropes', path: '/ropes', imgSrc: '/skipping-rope-jump-rope-for-exercise-workout-men-women-red-rope-original-imahffynqzgzczqz.jpeg' },
  { id: 9, label: 'Push-up Bars', path: '/bars', imgSrc: '/barrr.png' },
  { id: 10, label: 'Kettlebells', path: '/kettlebells', imgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.png' },
  { id: 11, label: 'Supporters', path: '/supporters', imgSrc: '/left-and-right-hand-premium-wrist-supporter-l-wrist-band-with-original-imahfdyysgharah4.jpeg' },
  { id: 12, label: 'Belts', path: '/belts', imgSrc: '/left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86zdtkkus2.jpeg' },
  { id: 13, label: 'Gloves', path: '/gloves', imgSrc: '/boxing-focus-pads-mitts-curved-punching-pads-with-high-density-original-imahfewzkcgrhhkv.jpeg' },
  { id: 14, label: 'Grippers', path: '/grippers', imgSrc: '/gripper.png' },
  { id: 15, label: 'Shakers', path: '/shakers', imgSrc: '/500-shaker-bottle-with-2-removable-compartment-for-protein-pre-original-imahff7yhwbrxgmw.jpg' },
  { id: 16, label: 'Bats', path: '/bats', imgSrc: '/pickleball-paddle-premium-boarded-composite-surface-shock-original-imahf7bcqddgr5nf.jpeg' },

];

const newArrivals = [
  {
    id: 1,
    name: 'Pro Hex Dumbbell Set',
    desc: 'Rubber-coated | Anti-roll',
    price: '₹2,499',
    oldPrice: '₹3,200',
    tag: 'New',
    imgSrc: '/sports-hexa-pvc-dumbbells-8-0-fitbox-sports-original-imahf77zyfemq8nj.jpeg',
    hoverImgSrc: '/sports-hexa-pvc-dumbbells-10-0-fitbox-sports-original-imahf77zhdyyyghx.jpeg',
  },
  {
    id: 2,
    name: 'Basket Ball Size-7',
    desc: '29.5" Circumference | 8-Panel Design',
    price: '₹1,799',
    oldPrice: '₹2,100',
    tag: 'New',
    imgSrc: '/450-475-basketball-official-professional-match-ball-indoor-original-imahf79f7pmsybhj.jpeg',
    hoverImgSrc: '/450-475-basketball-official-professional-match-ball-indoor-original-imahf79fdpsbjjkj.jpeg',
  },
  {
    id: 3,
    name: 'Shaker Pro 700ml',
    desc: 'Leak-proof | BPA-free',
    price: '₹499',
    oldPrice: '₹699',
    tag: 'New',
    imgSrc: '/700-supplements-shaker-bottle-for-protein-pre-post-workout-700ml-original-imahfgyeae98gqtf.jpg',
    hoverImgSrc: '/700-supplements-shaker-bottle-for-protein-pre-post-workout-original-imahfgyh5fg5pgfh.jpg',
  },
  {
    id: 4,
    name: 'Premium kettlebell (MultiColor)',
    desc: 'Set of 2 | All levels',
    price: '₹849',
    oldPrice: '₹1,200',
    tag: 'New',
    imgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9knq3knt5gv.jpeg',
    hoverImgSrc: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.png',
  },
  {
    id: 5,
    name: 'Gym Gloves V2',
    desc: 'Full palm pad | Wrist wrap',
    price: '₹699',
    oldPrice: '₹999',
    tag: 'New',
    imgSrc: '/left-right-free-size-gym-gloves-foam-padded-with-wrist-support-original-imahfeyvyfbv6rrv.jpg',
    hoverImgSrc: '/left-right-free-size-gym-gloves-foam-padded-with-wrist-support-original-imahfeyvyazs6d4z.jpg'
  },
  {
    id: 6,
    name: 'Fabric Resistance Band (Workout Hip Band)',
    desc: 'Non-slip fabric | Durable elastic',
    price: '₹499',
    oldPrice: '₹600',
    tag: 'New',
    imgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztkrqjxtzh.jpeg',
    hoverImgSrc: '/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.jpeg'
  },
];

/* Best Sellers – similar to newArrivals */
const bestSellers = [
  {
    id: 101,
    name: 'Cast Iron Kettlebell',
    desc: 'Solid cast iron | Matte finish',
    price: '₹1,499',
    oldPrice: '₹1,999',
    tag: 'Best Seller',
    imgSrc: 'premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.png',
  },
  {
    id: 102,
    name: 'Viper Cricket Bat',
    desc: 'Heavy duty | Plastic',
    price: '₹1,299',
    oldPrice: '₹1,599',
    tag: 'Best Seller',
    imgSrc: '/Bat.png',
  },
  {
    id: 103,
    name: 'Boxing Focus Pads',
    desc: 'Curved design | High density',
    price: '₹899',
    oldPrice: '₹1,199',
    tag: 'Best Seller',
    imgSrc: 'boxing-focus-pads-mitts-curved-punching-pads-with-high-density-original-imahfewzq5ucedvy.jpeg',
  },
  {
    id: 104,
    name: 'Weighted Vest 10kg',
    desc: 'Adjustable weight | Breathable',
    price: '₹2,999',
    oldPrice: '₹3,499',
    tag: 'Best Seller',
    imgSrc: 'adjustable-weighted-vest-10kg-with-removable-weight-weighted-original-imahfgfcuf3thayh.jpeg',
  },
  {
    id: 105,
    name: 'Hand Gripper Pro',
    desc: 'Adjustable 10-60kg | Counter',
    price: '₹299',
    oldPrice: '₹499',
    tag: 'Best Seller',
    imgSrc: '/adjustable-hand-grip-strengthener-with-counter-for-men-women-for-original-imahf76tquhzhgu9.jpeg',
  },
  {
    id: 106,
    name: 'Toning Tube Set',
    desc: '3 resistance levels | Handles',
    price: '₹749',
    oldPrice: '₹999',
    tag: 'Best Seller',
    imgSrc: 'double-toning-tube-resistance-band-for-workout-for-men-women-1-original-imah7wwjgnvvvzhu.jpeg',
  },
];

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
    seeAllPath: '/dumbbells',
    items: [
      { id: 'op-1-a', label: 'Dumbbells', path: '/', imgSrc: '517FvNN-33L.jpg' },
      { id: 'op-1-b', label: 'Kettlebell', path: '/', imgSrc: 'abcde.png' },
      { id: 'op-1-c', label: 'Weight Vest', path: '/', imgSrc: 'vest square.png' },
      { id: 'op-1-d', label: 'Ankle Weights', path: '/', imgSrc: 'ankle-weight-wrist-weight-1kg-0-5kg-x-2-for-running-boxing-original-imahgz4sf9bbxghv.jpeg' },
    ],
  },
  {
    id: 'op-2',
    heading: 'Workout Essentials',
    seeAllPath: '/accessories',
    items: [
      { id: 'op-2-a', label: 'Yoga Belt', path: '/', imgSrc: '183-yoga-belt-for-men-and-women-yoga-strap-for-stretching-with-original-imahfdw7f5ffqchh.jpeg' },
      { id: 'op-2-b', label: 'Toning Tube', path: '/', imgSrc: 'toning.png' },
      { id: 'op-2-c', label: 'Skipping Rope', path: '/', imgSrc: 'rope.png' },
      { id: 'op-2-d', label: 'Push-up Bar', path: '/', imgSrc: ' barrr.png' },
    ],
  },
  {
    id: 'op-3',
    heading: 'Support & Protection',
    seeAllPath: '/accessories',
    items: [
      { id: 'op-3-a', label: 'Wrist Supporter', path: '/', imgSrc: 'supporters.png' },
      { id: 'op-3-b', label: 'Lifting Belts', path: '/', imgSrc: 'left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86nwz3u6bh.jpeg' },
      { id: 'op-3-c', label: 'Gym Gloves', path: '/', imgSrc: 'gloves.png' },
      { id: 'op-3-d', label: 'Hand Gripper', path: '/', imgSrc: 'gripper.png' },
    ],
  },
  {
    id: 'op-4',
    heading: 'Sports & Training',
    seeAllPath: '/balls',
    items: [
      { id: 'op-4-a', label: 'Football', path: '/', imgSrc: '450-pro-league-football-32-panel-rubber-moulded-design-for-original-imahfff8yuaymr7e.jpeg' },
      { id: 'op-4-b', label: 'Cricket Ball', path: '/', imgSrc: 'balls.png' },
      { id: 'op-4-c', label: 'Pickleball', path: '/', imgSrc: 'pickleball-paddle-premium-boarded-composite-surface-shock-original-imahf7bcseafvhaz.jpeg' },
      { id: 'op-4-da', label: 'Basketball', path: '/', imgSrc: '450-475-basketball-official-professional-match-ball-indoor-original-imahf79fgrnzr9m4.jpeg' },

    ],
  },
  {
    id: 'op-5',
    heading: 'Lifestyle & Accessories',
    seeAllPath: '/accessories',
    items: [
      { id: 'op-5-a', label: 'T-shirt', path: '/', imgSrc: 's-t-shirt-for-gym-fitbox-sports-original-imahf8gpbqppvzzz-removebg-preview.png' },
      { id: 'op-5-b', label: 'Boxing Gloves', path: '/', imgSrc: 'boxing.png' },
      { id: 'op-5-c', label: 'Shakers', path: '/', imgSrc: '51qT2eMcH1L.jpg' },
      { id: 'op-5-d', label: 'Wall Mountings', path: '/', imgSrc: 'wall-mounting-chin-up-bar-pull-up-bar-ab-straps-combo-120-kg-original-imahfezwwygtzfdd.jpeg' },
    ],
  },
];

/* Platforms availability data */
const availabilityPlatforms = [
  { id: 'p1', label: 'Amazon', imgSrc: '/amazon.jpg' },
  { id: 'p2', label: 'Flipkart', imgSrc: '/flipkart.png' },
  { id: 'p3', label: 'Desertcart', imgSrc: '/Desertcart.jpg' },
  { id: 'p4', label: 'India Mart', imgSrc: '/india mart.png' },
  { id: 'p5', label: 'India Free Stuff', imgSrc: '/india free stuff.png' },
  { id: 'p6', label: 'I\'M Fit India', imgSrc: '/imfitindia.jpg' },
  { id: 'p7', label: 'FitBox.com', imgSrc: '/favicon.png' },
  { id: 'p8', label: 'Blinkit', imgSrc: '/blinkit.png' },


];

/* ═══════════════════════════════════════
   HOME PAGE COMPONENT
═══════════════════════════════════════ */
export default function Home() {

  /* ── Hero slider state ── */
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef(null);

  /* ── Category Swipe & Scroll state ── */
  const catTrackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollPos = useRef(0);
  const autoScrollSpeed = 0.6; // pixels per frame

  useEffect(() => {
    const track = catTrackRef.current;
    if (!track) return;

    let animationId;
    const totalWidth = track.scrollWidth;
    const halfWidth = totalWidth / 2;

    const animate = () => {
      if (!isDragging.current) {
        scrollPos.current -= autoScrollSpeed;
        // Reset for infinite loop
        if (Math.abs(scrollPos.current) >= halfWidth) {
          scrollPos.current = 0;
        }
        track.style.transform = `translateX(${scrollPos.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Mouse/Touch Events
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

      // Infinite wrap while dragging
      if (scrollPos.current > 0) scrollPos.current = -halfWidth;
      if (Math.abs(scrollPos.current) >= halfWidth) scrollPos.current = 0;

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
        scrollPosAvail.current -= autoScrollSpeed;
        if (Math.abs(scrollPosAvail.current) >= halfWidth) {
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
      if (scrollPosAvail.current > 0) scrollPosAvail.current = -halfWidth;
      if (Math.abs(scrollPosAvail.current) >= halfWidth) scrollPosAvail.current = 0;
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

  /* Auto-advance hero every 3 seconds */
  const startHeroTimer = () => {
    clearInterval(heroTimer.current);
    heroTimer.current = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  useEffect(() => {
    startHeroTimer();
    return () => clearInterval(heroTimer.current);
  }, [heroSlides.length]);

  const goToSlide = (idx) => {
    setHeroIdx(idx);
    startHeroTimer();
  };

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

  /* ── Best Sellers carousel state (Infinite) ── */
  const [bsIdx, setBsIdx] = useState(bestSellers.length);
  const [bsTrans, setBsTrans] = useState(true);
  const [bsBusy, setBsBusy] = useState(false);

  const bsNext = () => {
    if (bsBusy) return;
    setBsBusy(true);
    setBsIdx((p) => p + 1);
    setTimeout(() => setBsBusy(false), 550);
  };
  const bsPrev = () => {
    if (bsBusy) return;
    setBsBusy(true);
    setBsIdx((p) => p - 1);
    setTimeout(() => setBsBusy(false), 550);
  };

  useEffect(() => {
    if (bsIdx >= bestSellers.length * 2) {
      setTimeout(() => { setBsTrans(false); setBsIdx(bestSellers.length); }, 500);
    }
    if (bsIdx < bestSellers.length) {
      setTimeout(() => { setBsTrans(false); setBsIdx(bestSellers.length * 2 - 1); }, 500);
    }
  }, [bsIdx]);

  useEffect(() => {
    if (!bsTrans) {
      const timer = setTimeout(() => setBsTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [bsTrans]);

  // Swipe for Best Sellers
  const bsStartX = useRef(0);
  const handleBsTouchStart = (e) => (bsStartX.current = e.touches[0].pageX);
  const handleBsTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (bsStartX.current - endX > 50) bsNext();
    if (endX - bsStartX.current > 50) bsPrev();
  };

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

  /* ── Banner slider state ── */
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimer = useRef(null);

  const startBannerTimer = () => {
    clearInterval(bannerTimer.current);
    bannerTimer.current = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
  };

  useEffect(() => {
    startBannerTimer();
    return () => clearInterval(bannerTimer.current);
  }, [bannerSlides.length]); // Added dependency to be extra safe

  const goToBanner = (idx) => {
    setBannerIdx(idx);
    startBannerTimer();
  };

  /* ── Floating back-to-top button ── */
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll(); // Run immediately on mount to check initial scroll position
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* Current hero slide */
  const slide = heroSlides[heroIdx];

  /* ═══ RENDER ═══ */
  return (
    <div className="home" id="home-page">

      {/* ── Header ── */}
      <Header />

      {/* ══════════════════════════════════
          1. HERO SECTION
          3 slides, auto-swaps every 3s
      ══════════════════════════════════ */}
      <section className="hero-section" id="hero-section" aria-label="Hero banner">
        <div className="hero-slide" style={{ background: slide.bg }} id={`hero-slide-${slide.id}`}>

          {/* Right half – actual image */}
          <div className="hero-img-side" id={`hero-img-${slide.id}`}>
            {slide.imgSrc ? (
              <img src={slide.imgSrc} alt={slide.title} className="hero-main-img" />
            ) : (
              <div className="hero-img-placeholder">
                <span className="hero-ph-title">Hero Image {slide.id}</span>
                <span className="hero-ph-hint">Replace this div with your &lt;img&gt;</span>
              </div>
            )}
          </div>

          {/* Left half – text + CTA */}
          <div className="hero-content" key={slide.id}>
            <span className="hero-eyebrow" style={{ color: slide.accent }}>FitBox Sports</span>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>
            <div className="hero-actions">
              <Link to={slide.ctaLink} className="hero-cta-primary" id={`hero-cta-${slide.id}`}>
                {slide.cta}
              </Link>
              <Link to="/products" className="hero-cta-outline">Browse All</Link>
            </div>
          </div>

          {/* Slide indicator dots */}
          <div className="hero-dots" id="hero-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === heroIdx ? 'hero-dot--active' : ''}`}
                id={`hero-dot-${i}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>

          {/* Previous / Next arrows */}
          <button
            className="hero-arrow hero-arrow--left"
            id="hero-prev"
            aria-label="Previous slide"
            onClick={() => goToSlide((heroIdx - 1 + heroSlides.length) % heroSlides.length)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="hero-arrow hero-arrow--right"
            id="hero-next"
            aria-label="Next slide"
            onClick={() => goToSlide((heroIdx + 1) % heroSlides.length)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. CATEGORY STRIP
          Infinite auto-scrolling pill row
      ══════════════════════════════════ */}
      <section className="cat-strip" id="category-strip" aria-label="Shop by category">
        <div className="cat-strip-header">
          <h2 className="strip-heading">Shop by Category</h2>
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
            {[...categories, ...categories].map((cat, i) => (
              <Link
                key={`${cat.id}-${i}`}
                to={cat.path}
                className="cat-pill"
                id={`cat-pill-${cat.id}-${i}`}
              >
                <div className="cat-circle">
                  {cat.imgSrc && <img src={cat.imgSrc} alt={cat.label} className="cat-img" />}
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
            <h2 className="section-title">New Arrivals</h2>
          </div>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-content">
            <div className="carousel-viewport">
              <div 
                className="carousel-track-simple"
                style={{ 
                  transform: `translateX(calc(-${naIdx} * (100% / var(--visible-count))))`,
                  transition: naTrans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                }}
                onTouchStart={handleNaTouchStart}
                onTouchEnd={handleNaTouchEnd}
              >
                {[...newArrivals, ...newArrivals, ...newArrivals].map((product, i) => (
                  <div className="na-mobile-carousel" key={`${product.id}-${i}`}>
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
          4. PROMO BANNER SLIDER
          9 banners, auto-swap every 3s
          Dots + prev/next arrows
      ══════════════════════════════════ */}
      <section className="banner-section" id="promo-banner" aria-label="Promotional banners">
        <div
          className="banner-slider"
          id="banner-slider"
        >
          {/* Banner Image */}
          <img
            src={bannerSlides[bannerIdx].imgSrc}
            alt="Promotional Banner"
            className="banner-bg-img"
          />

          {/* Only showing images now — arrows and dots remain for navigation */}

          {/* Prev arrow */}
          <button
            className="banner-arrow banner-arrow--left"
            id="banner-prev"
            aria-label="Previous banner"
            onClick={() => goToBanner((bannerIdx - 1 + bannerSlides.length) % bannerSlides.length)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            className="banner-arrow banner-arrow--right"
            id="banner-next"
            aria-label="Next banner"
            onClick={() => goToBanner((bannerIdx + 1) % bannerSlides.length)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="banner-dots" id="banner-dots">
            {bannerSlides.map((_, i) => (
              <button
                key={i}
                className={`banner-dot ${i === bannerIdx ? 'banner-dot--active' : ''}`}
                id={`banner-dot-${i}`}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => goToBanner(i)}
              />
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
          <h2 className="section-title">Our Products</h2>
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
          6. OUR BEST SELLERS
          Carousel of ProductCards
      ══════════════════════════════════ */}
      <section className="arrivals-section" id="best-sellers" aria-label="Best sellers">
        <div className="section-header">
          <div className="section-heading-group">
            <span className="section-eyebrow">Top Rated</span>
            <h2 className="section-title">Our Best Sellers</h2>
          </div>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-content">
            <div className="carousel-viewport">
              <div 
                className="carousel-track-simple"
                style={{ 
                  transform: `translateX(calc(-${bsIdx} * (100% / var(--visible-count))))`,
                  transition: bsTrans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                }}
                onTouchStart={handleBsTouchStart}
                onTouchEnd={handleBsTouchEnd}
              >
                {[...bestSellers, ...bestSellers, ...bestSellers].map((product, i) => (
                  <div className="na-mobile-carousel" key={`${product.id}-${i}`}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="side-nav-btn left" onClick={bsPrev} aria-label="Previous best sellers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="side-nav-btn right" onClick={bsNext} aria-label="Next best sellers">
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
          <span className="section-eyebrow">Happy Customers</span>
          <h2 className="section-title">What People Love About Us!</h2>
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
          <h2 className="strip-heading">We are Available on</h2>
          <p className="strip-sub">Find our premium products on your favorite platforms</p>
        </div>

        <div className="cat-scroll-outer" id="avail-scroll-outer">
          <div
            className="cat-scroll-track"
            id="avail-scroll-track"
            ref={availTrackRef}
            style={{ cursor: 'grab' }}
          >
            {[...availabilityPlatforms, ...availabilityPlatforms].map((plat, i) => (
              <div
                key={`${plat.id}-${i}`}
                className="cat-pill"
              >
                <div className="cat-circle">
                  {plat.imgSrc && <img src={plat.imgSrc} alt={plat.label} className="cat-img" />}
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
