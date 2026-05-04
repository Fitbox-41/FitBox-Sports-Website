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
        hex: '#1a1a1a',
        images: [
          '/1-2.webp',
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
        ],
      },
      {
        color: 'Electric Blue',
        hex: '#3b82f6',
        images: [
          'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop',
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
        hex: '#f97316',
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
    category: 'Accessories',
    price: 499,
    oldPrice: 699,
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
        hex: '#d57b01',
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
        hex: '#bdb6c5',
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
        hex: '#00a5bb',
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
        hex: '#1a1a1a',
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
        hex: '#ef4444',
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

];

export default allProducts;
