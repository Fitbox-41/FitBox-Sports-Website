// =============================================================
//  PRODUCT CATALOGUE  -  products.js
//  HOW TO USE:
//    - To update a product: change any field below.
//    - To swap images: replace the URL strings under
//      variants[].images  and  showcaseImages.
//    - To add a product: copy one entire block and paste it
//      at the end (before the final ]);
//    - relatedIds: list the IDs of products to show in
//      "You may also like" on that product's page.
// =============================================================

const allProducts = [

  // =============================================
  //  PRODUCT 1  -  Pro Hex Dumbbell Set
  // =============================================
  {
    id: 1,
    name: 'Pro Hex Dumbbell Set',
    category: 'Equipment',
    price: 2499,
    oldPrice: 3200,
    isNew: true,
    isOutOfStock: false,
    qualities: ['Rubber-coated', 'Anti-roll', 'Premium Quality'],
    sizes: ['5kg', '10kg', '15kg'],
    longDesc: 'Our Pro Hex Dumbbells are designed for maximum durability and comfort. The hexagonal shape prevents rolling, while the rubber coating protects your floors and reduces noise. Perfect for home gyms and commercial facilities alike, these weights are built to withstand the most intense training sessions.',
    features: [
      'Professional-grade cast iron core',
      'Non-roll hexagonal design',
      'Premium rubber coating for floor protection',
      'Ergonomic grip for maximum comfort'
    ],
    material: 'Cast Iron with Premium Rubber Coating',
    relatedIds: [2, 3, 4, 5],

    //  -- SWAP GALLERY IMAGES BELOW --
    variants: [
      {
        color: 'Onyx Black',
        images: [
          '/1-2.webp',
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
        ],
      },
      {
        color: 'Electric Blue',
        images: [
          '/51qT2eMcH1L.webp'
        ],
      },
    ],

    //  -- SWAP SHOWCASE (DESCRIPTION SECTION) IMAGES BELOW --
    showcaseImages: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    ],
  },

  // =============================================
  //  PRODUCT 2  -  Official Basketball
  // =============================================
  {
    id: 2,
    name: 'Official Basketball',
    category: 'Sports',
    price: 1799,
    oldPrice: 2400,
    isNew: false,
    isOutOfStock: true,
    qualities: ['Superior Grip', 'Official Size', 'Indoor/Outdoor'],
    sizes: ['Size 5', 'Size 6', 'Size 7'],
    longDesc: 'Engineered for consistent bounce and exceptional grip, our Official Match Basketball is the perfect choice for both indoor courts and outdoor play. The advanced moisture-wicking technology ensures you maintain control even during the most fast-paced games.',
    features: [
      'High-performance match-grade quality',
      'Superior grip for total control',
      'Advanced moisture-wicking technology',
      'Durable for all-surface play'
    ],
    material: 'Composite Leather & Natural Rubber',
    relatedIds: [1, 3, 5, 4],

    //  -- SWAP GALLERY IMAGES BELOW --
    variants: [
      {
        color: 'Classic Orange',
        images: [
          '/81eCO23-KQL.webp',
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1519060202266-39f323a395f8?q=80&w=2070&auto=format&fit=crop',
        ],
      },
    ],

    //  -- SWAP SHOWCASE IMAGES BELOW --
    showcaseImages: [
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519060202266-39f323a395f8?q=80&w=2070&auto=format&fit=crop',
    ],
  },

  // =============================================
  //  PRODUCT 3  -  Shaker Pro 700ml
  // =============================================
  {
    id: 3,
    name: 'Shaker Pro 700ml',
    category: 'Shakers',
    price: 499,
    oldPrice: 699,
    isNew: true,
    isOutOfStock: false,
    qualities: ['BPA-Free', 'Leak-Proof', 'High-Grade Plastic'],
    sizes: ['500ml', '700ml'],
    longDesc: 'The Supplements Shaker Bottle is a premium-quality gym and fitness accessory designed for athletes, bodybuilders, and fitness enthusiasts. Specially crafted to mix protein powders, supplements, and nutrition shakes effortlessly, this shaker bottle ensures you get a smooth, lump-free drink every time. Made from high-grade, BPA-free, and non-toxic plastic, it is safe, durable, and built for everyday use. With its ergonomic design and leak-proof lid, you can confidently carry it in your gym bag, backpack, or while traveling without worrying about spills. The shaker comes with a powerful mixing mechanism (whisk ball or built-in blender design) that allows quick blending of protein, pre-workout, or post-workout supplements, ensuring maximum nutrient absorption. Its lightweight yet sturdy construction makes it perfect for daily workouts, running, cycling, yoga, and other sports activities. The bottle is also easy to clean and maintain, making it a reliable companion for your fitness journey. Designed with a comfortable grip and wide-mouth opening, it allows easy filling, pouring, and cleaning. Whether you need to mix protein shakes, BCAAs, creatine, or meal replacements, this shaker bottle is a must-have for every fitness-conscious individual.',
    features: [
      "Premium Quality Shaker Bottle – Designed for athletes, bodybuilders, and fitness enthusiasts for daily gym and workout use",
      'Smooth & Lump-Free Mixing – Efficient mixing mechanism ensures quick and even blending of protein powders and supplements',
      "BPA-Free & Non-Toxic Material – Made from high-grade plastic that is safe, durable, and suitable for everyday use",
      "Leak-Proof & Secure Lid – Prevents spills and mess, making it ideal for gym bags, backpacks, and travel",
      "Ergonomic & Lightweight Design – Comfortable grip with sturdy construction for easy handling during workouts",
      "Wide Mouth Opening – Allows easy filling, pouring, and hassle-free cleaning"
    ],
    material: 'BPA-Free High-Grade Polypropylene',
    relatedIds: [1, 4, 2, 5],

    //  -- SWAP GALLERY IMAGES BELOW --
    variants: [
      {
        color: 'Smoke Black',
        images: [
          '/51qT2eMcH1L.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfyqsp7ngk.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfx4azahjb.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfruhdxygt.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfmqnn3ctd.webp',
        ],
      },
      {
        color: 'Pearl White',
        isOutOfStock: true,
        images: [
          '/white sipper.webp',
          '/white-2.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfyqsp7ngk.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfx4azahjb.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfruhdxygt.webp',
          "/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfmqnn3ctd.webp",

        ],
      },
      {
        color: 'Ocean Blue',
        images: [
          '/blue.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfyqsp7ngk.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfx4azahjb.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfruhdxygt.webp',
          '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfmqnn3ctd.webp'
        ],
      },
    ],

    //  -- SWAP SHOWCASE IMAGES BELOW --
    showcaseImages: [
      '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfruhdxygt.webp',
      '/700-supplements-shaker-bottle-for-protein-pre-post-workout-1-original-imahfgyfx4azahjb.webp',
      '/500-shaker-bottle-with-2-removable-compartment-for-protein-pre-original-imahff7y9zqfwk5x.webp',
    ],
  },

  // =============================================
  //  PRODUCT 4  -  Pro Gym Gloves
  // =============================================
  {
    id: 4,
    name: 'Boxing Gloves',
    category: 'Equipment',
    price: 699,
    oldPrice: 999,
    isNew: false,
    isOutOfStock: true,
    qualities: ['Padded Palm', 'Wrist Support', 'Breathable'],
    sizes: ['S', 'M', 'L', 'XL'],
    longDesc: 'Premium weightlifting gloves with integrated wrist support and foam padding for maximum protection and grip during intense workouts. The breathable mesh back keeps your hands cool and dry, while the reinforced palm ensures long-lasting durability.',
    features: [
      'Integrated wrist support for safety',
      'High-density foam palm padding',
      'Breathable mesh back design',
      'Reinforced palm for long-lasting use'
    ],
    material: 'Synthetic Leather & Mesh',
    relatedIds: [1, 5, 2, 3],

    //  -- SWAP GALLERY IMAGES BELOW --
    variants: [
      {
        color: 'Stealth Black',
        images: [
          '/boxing.webp',
        ],
      },
    ],

    //  -- SWAP SHOWCASE IMAGES BELOW --
    showcaseImages: [
      'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=2070&auto=format&fit=crop',
    ],
  },

  // =============================================
  //  PRODUCT 5  -  Speed Skipping Rope
  // =============================================
  {
    id: 5,
    name: 'Speed Skipping Rope',
    category: 'Accessories',
    price: 349,
    oldPrice: 499,
    qualities: ['Ball Bearings', 'Adjustable Length', 'Steel Cable'],
    sizes: ['One Size'],
    longDesc: 'High-speed jumping rope designed for athletes. Features smooth ball bearings and a durable coated steel cable for maximum rotations per second. The adjustable length makes it suitable for users of all heights, from beginners to competitive jumpers.',
    features: [
      'Professional-grade smooth ball bearings',
      'Adjustable length coated steel cable',
      'Ultra-fast rotation for high-intensity',
      'Ergonomic non-slip aluminum handles'
    ],
    material: 'Coated Steel & Aluminum Handles',
    relatedIds: [1, 2, 3, 4],

    //  -- SWAP GALLERY IMAGES BELOW --
    variants: [
      {
        color: 'Racer Red',
        images: [
          '/61fgiBs02IL.webp',
        ],
      },
    ],

    //  -- SWAP SHOWCASE IMAGES BELOW --
    showcaseImages: [
      'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070&auto=format&fit=crop',
    ],
  },

  // =============================================
  //  PRODUCT 6  -  Resistance Bands Set
  // =============================================
  {
    id: 6,
    name: 'Resistance Bands Set',
    category: 'Accessories',
    price: 899,
    oldPrice: 1299,
    qualities: ['Durable', '5 Levels', 'Portable'],
    sizes: ['One Size'],
    longDesc: 'Complete set of 5 resistance bands for full-body workouts. Perfect for strength training, yoga, and physical therapy.',
    features: ['5 different resistance levels', '100% natural latex', 'Includes carry bag', 'Snap-resistant design'],
    material: 'Natural Latex',
    variants: [{ color: 'Multicolor', images: ['/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.webp'] }],
    showcaseImages: ['/fabric-resistance-band-loop-hip-band-for-women-fabric-resistance-original-imahffztnb49twpk.webp']
  },
  {
    id: 7,
    name: 'Yoga Mat Premium',
    category: 'Accessories',
    price: 1299,
    oldPrice: 1800,
    qualities: ['Non-slip', 'Eco-friendly', 'Extra Thick'],
    sizes: ['Standard'],
    longDesc: 'High-density eco-friendly yoga mat with alignment lines. Provides excellent cushioning and joint protection.',
    features: ['Alignment lines', 'Non-slip surface', 'Tear-resistant', 'Lightweight'],
    material: 'TPE',
    variants: [{ color: 'Purple', images: ['/2.jpg-scaled.webp'] }],
    showcaseImages: ['/2.jpg-scaled.webp']
  },
  {
    id: 8,
    name: 'Adjustable Kettlebell',
    category: 'Equipment',
    price: 3499,
    oldPrice: 4500,
    qualities: ['Space-saving', 'Cast Iron', 'Quick Adjust'],
    sizes: ['10kg', '20kg'],
    longDesc: 'Versatile adjustable kettlebell that replaces multiple traditional kettlebells. Easy weight selection mechanism.',
    features: ['Quick-adjust mechanism', 'Cast iron plates', 'Ergonomic handle', 'Flat base for pushups'],
    material: 'Cast Iron',
    variants: [{ color: 'Black/Red', images: ['/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.webp'] }],
    showcaseImages: ['/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.webp']
  },
  {
    id: 9,
    name: 'Pull-up Bar',
    category: 'Equipment',
    price: 1599,
    oldPrice: 2200,
    qualities: ['No Screws', 'Heavy Duty', 'Multi-grip'],
    sizes: ['Adjustable Length'],
    longDesc: 'Doorway pull-up bar requires no drilling or screws. Features multiple grip positions for comprehensive upper body workouts.',
    features: ['No-screw installation', 'Multi-grip design', 'Supports up to 150kg', 'Foam padded grips'],
    material: 'Heavy Duty Steel',
    variants: [{ color: 'Black', images: ['/wall-mounting-chin-up-bar-pull-up-bar-ab-straps-combo-120-kg-original-imahfezwmkwx4ubs.webp'] }],
    showcaseImages: ['/wall-mounting-chin-up-bar-pull-up-bar-ab-straps-combo-120-kg-original-imahfezwmkwx4ubs.webp']
  },
  {
    id: 10,
    name: 'Weightlifting Belt',
    category: 'Accessories',
    price: 999,
    oldPrice: 1499,
    qualities: ['Leather', 'Lower Back Support', 'Adjustable'],
    sizes: ['S', 'M', 'L'],
    longDesc: 'Premium leather weightlifting belt provides essential lower back support for heavy lifting like squats and deadlifts.',
    features: ['Genuine leather', 'Heavy-duty buckle', 'Contoured design', 'Double stitching'],
    material: 'Leather',
    variants: [{ color: 'Brown', images: ['/left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86zdtkkus2.webp'] }],
    showcaseImages: ['/left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86zdtkkus2.webp']
  },
  {
    id: 11,
    name: 'Gym Bag Duffel',
    category: 'Accessories',
    price: 1199,
    oldPrice: 1600,
    qualities: ['Waterproof', 'Shoe Compartment', 'Spacious'],
    sizes: ['Large'],
    longDesc: 'Spacious gym duffel bag with a dedicated shoe compartment and wet pocket for sweaty clothes.',
    features: ['Dedicated shoe compartment', 'Water-resistant material', 'Multiple pockets', 'Adjustable shoulder strap'],
    material: 'Nylon',
    variants: [{ color: 'Grey', images: ['/4.jpg.webp'] }],
    showcaseImages: ['/4.jpg.webp']
  },
  {
    id: 999,
    name: 'Dummy Test Product',
    category: 'Accessories',
    price: 99,
    oldPrice: 199,
    qualities: ['Test Quality'],
    sizes: ['Test Size'],
    longDesc: 'This is a dummy product added to test the Vercel deployment and MongoDB connection.',
    features: ['Test Feature 1', 'Test Feature 2'],
    material: 'Test Material',
    variants: [{ color: 'Test Color', images: ['/fitbox-_red-white.webp'] }],
    showcaseImages: ['/fitbox-_red-white.webp']
  }
];

export default allProducts;
