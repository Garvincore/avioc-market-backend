// Mock data for Avioc Market - Ugandan TikTok & Jumia Hybrid

export const SHOPS = [
  {
    id: "shop_rolex_palace",
    name: "Kisekka Rolex Palace",
    handle: "rolexpalace_ug",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
    bio: "Home of the original Kampala Rolled Rolex 🍳 Double egg, double chapati, fresh cabbage. Delivery across Kampala!",
    followers: "12.4K",
    likes: "89.2K",
    rating: 4.8,
    whatsapp: "256700000001",
    location: "Kisekka Market, Kampala",
    category: "Food & Eats",
    status: "approved"
  },
  {
    id: "shop_kikoyi_designs",
    name: "Nalongo Custom Kikoyi & Wear",
    handle: "nalongo_designs",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    bio: "Premium custom Kikoyi dresses, shirts, and bridal wear. Handwoven heritage meets modern elegance. 👗🇺🇬",
    followers: "24.1K",
    likes: "154.3K",
    rating: 4.9,
    whatsapp: "256700000002",
    location: "Wandegeya Market, Kampala",
    category: "Fashion & Style",
    status: "approved"
  },
  {
    id: "shop_katwe_tech",
    name: "Katwe Smart Tech & Repairs",
    handle: "katwe_smart_tech",
    verified: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    bio: "Katwe's finest hardware engineers. Phone repair, custom speaker setups, and smart home installations. Quick & affordable!",
    followers: "5.8K",
    likes: "19.5K",
    rating: 4.5,
    whatsapp: "256700000003",
    location: "Katwe, Kampala",
    category: "Electronics & Tech",
    status: "approved"
  },
  {
    id: "shop_jinja_safaris",
    name: "Nile Rapids Adventure Tours",
    handle: "nile_rapids_jinja",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
    bio: "Source of the Nile white-water rafting, quad biking, and sunset cruises. Book your weekend gateway today! 🌊🚣‍♀️",
    followers: "45.7K",
    likes: "320.1K",
    rating: 4.9,
    whatsapp: "256700000004",
    location: "Source of the Nile, Jinja",
    category: "Tours & Travel",
    status: "approved"
  },
  {
    id: "shop_ntinda_braids",
    name: "Akiiki Braids & Beauty Lounge",
    handle: "akiiki_braids_ug",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    bio: "Knotless braids, dreadlocks, sisterlocks, and bridal makeup. Ntinda's favorite glam spot. Book a slot!",
    followers: "18.2K",
    likes: "94.6K",
    rating: 4.7,
    whatsapp: "256700000005",
    location: "Ntinda Complex, Kampala",
    category: "Beauty & Grooming",
    status: "approved"
  }
];

export const PRODUCTS = [
  {
    id: "prod_royal_rolex",
    shopId: "shop_rolex_palace",
    title: "Double-Egg Chapati Rolex (The Royal)",
    price: 6500, // UGX
    type: "product",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&auto=format&fit=crop&q=80",
    description: "Our signature Rolex featuring 2 eggs loaded with green pepper, onions, tomatoes, and cabbage rolled in 2 soft, flaky hand-made chapatis.",
    category: "Food",
    rating: 4.9,
    reviews: 142
  },
  {
    id: "prod_kikoyi_maxi",
    shopId: "shop_kikoyi_designs",
    title: "Premium Kikoyi Maxi Dress",
    price: 180000, // UGX
    type: "product",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80",
    description: "An elegant, bespoke maxi dress hand-crafted from premium Ugandan Kikoyi fabric. Customizable to your exact measurements.",
    category: "Fashion",
    rating: 4.8,
    reviews: 64
  },
  {
    id: "prod_handmade_subwoofer",
    shopId: "shop_katwe_tech",
    title: "Katwe Custom Heavy-Bass Subwoofer",
    price: 350000, // UGX
    type: "product",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
    description: "High-power active subwoofer enclosed in custom-made varnished mahogany wood. Bluetooth support and heavy bass booster dial.",
    category: "Electronics",
    rating: 4.6,
    reviews: 28
  },
  {
    id: "serv_nile_rafting",
    shopId: "shop_jinja_safaris",
    title: "Full-Day Grade 5 Nile Rafting",
    price: 480000, // UGX
    type: "service",
    image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=500&auto=format&fit=crop&q=80",
    description: "Conquer the famous rapids of the River Nile. Includes professional guides, safety gear, BBQ buffet at the rapids, and free transport from Kampala.",
    category: "Tours & Travel",
    rating: 5.0,
    reviews: 215
  },
  {
    id: "serv_knotless_braids",
    shopId: "shop_ntinda_braids",
    title: "Knotless Braids (Standard / Mid-Back)",
    price: 90000, // UGX
    type: "service",
    image: "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=500&auto=format&fit=crop&q=80",
    description: "Tension-free, neat, and highly durable knotless braids. Includes washing, blow-drying, and oiling. Extension fibers included in the price.",
    category: "Beauty",
    rating: 4.7,
    reviews: 89
  },
  {
    id: "serv_phone_screen_fix",
    shopId: "shop_katwe_tech",
    title: "Original iPhone Screen Replacement",
    price: 150000, // UGX
    type: "service",
    image: "https://images.unsplash.com/photo-1597740985671-2a8a3b80f017?w=500&auto=format&fit=crop&q=80",
    description: "Broken screen? Get it replaced in 30 minutes with a genuine high-brightness OLED panel. Includes a 3-month warranty.",
    category: "Tech Service",
    rating: 4.4,
    reviews: 43
  }
];

export const VIDEOS = [
  {
    id: "vid_1",
    shopId: "shop_rolex_palace",
    productId: "prod_royal_rolex",
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-street-food-vendors-preparing-local-delicacy-41584-large.mp4",
    imageFallback: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80",
    caption: "How we roll the ultimate Ugandan Rolex! 🍳🔥 Double egg, double chapati, fresh veggies. Order yours now on Avioc Market! #Rolex #KampalaStreetFood #UgandaEats",
    likes: "4.2K",
    comments: "328",
    shares: "185",
    tags: ["Rolex", "KampalaStreetFood", "UgandaEats"]
  },
  {
    id: "vid_2",
    shopId: "shop_kikoyi_designs",
    productId: "prod_kikoyi_maxi",
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-beautiful-traditional-dress-40913-large.mp4",
    imageFallback: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    caption: "The grace of Ugandan Kikoyi! ✨ Handwoven to perfection, customized fit. Ideal for Kwanjula, Sunday church, and weddings. #Kikoyi #UgandanFashion #Kwanjula",
    likes: "8.9K",
    comments: "512",
    shares: "412",
    tags: ["Kikoyi", "UgandanFashion", "Kwanjula"]
  },
  {
    id: "vid_3",
    shopId: "shop_jinja_safaris",
    productId: "serv_nile_rafting",
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-rafting-down-a-fast-river-42022-large.mp4",
    imageFallback: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&auto=format&fit=crop&q=80",
    caption: "Conquering Grade 5 rapids at the Source of the Nile, Jinja! 🌊🚣‍♀️ Who wants to join us next weekend? Book directly on Avioc Market. #Jinja #NileRafting #VisitUganda",
    likes: "15.4K",
    comments: "845",
    shares: "1.2K",
    tags: ["Jinja", "NileRafting", "VisitUganda"]
  },
  {
    id: "vid_4",
    shopId: "shop_ntinda_braids",
    productId: "serv_knotless_braids",
    videoSrc: "https://assets.mixkit.co/videos/preview/mixkit-hairdresser-braiding-hair-of-a-woman-41865-large.mp4",
    imageFallback: "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=800&auto=format&fit=crop&q=80",
    caption: "Stunning knotless braids by Akiiki! Hair health comes first. Book a session now - Ntinda Complex. 💇‍♀️✨ #KnotlessBraids #NtindaSalons #KampalaBeauty",
    likes: "6.7K",
    comments: "244",
    shares: "98",
    tags: ["KnotlessBraids", "NtindaSalons", "KampalaBeauty"]
  }
];
