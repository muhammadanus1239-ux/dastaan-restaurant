/**
 * Master 54 Menu Items for Node.js + Express Backend & MongoDB Seed
 * Authentic Pakistani / Mughlai Heritage Dishes
 */

const initialMenuItems = [
  // ─── STARTERS (14 Items) ───
  {
    _id: '65a000000000000000000001',
    id: 'starter_1',
    name: 'Reshmi Murgh Kebab',
    description: 'Melt-in-mouth minced chicken kebabs marinated in cream, saffron, and aromatic royal spices.',
    price: 850,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000002',
    id: 'starter_2',
    name: 'Dastaan Samosa Chaat',
    description: 'Crispy pastry samosas topped with spiced chickpeas, sweetened yoghurt, tamarind, and fresh mint chutney.',
    price: 490,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000003',
    id: 'starter_3',
    name: 'Peshawari Chapli Kebab',
    description: 'Pan-fried spiced beef patties infused with crushed pomegranate seeds, coriander, and ripe tomatoes.',
    price: 950,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000004',
    id: 'starter_4',
    name: 'Paneer Tikka Bites',
    description: 'Chargrilled cottage cheese cubes coated in spiced yogurt, mustard oil, and carom seeds.',
    price: 650,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    isSpecial: false,
    isAvailable: false
  },
  {
    _id: '65a000000000000000000005',
    id: 'starter_5',
    name: 'Chicken Malai Boti',
    description: 'Succulent boneless chicken chunks marinated in double cream, green chillies, and crushed white peppercorns.',
    price: 920,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000006',
    id: 'starter_6',
    name: 'Lahori Fried Fish',
    description: 'Crispy gram flour battered freshwater fish fillets seasoned with carom seeds (ajwain) and chaat masala.',
    price: 1250,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000007',
    id: 'starter_7',
    name: 'Tandoori Chicken Wings',
    description: 'Charcoal-grilled chicken wings marinated in spicy Kashmiri red chilli paste, yoghurt, and tandoori spices.',
    price: 780,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000008',
    id: 'starter_8',
    name: 'Crispy Veg Pakora Platter',
    description: 'Golden fried assorted vegetable fritters of onion, potato, and spinach served with tangy tamarind dip.',
    price: 450,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000009',
    id: 'starter_9',
    name: 'Mutton Seekh Kebab',
    description: 'Minced goat meat delicately spiced with royal garam masala and skewered over glowing charcoal embers.',
    price: 1100,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000010',
    id: 'starter_10',
    name: 'Vegetable Spring Rolls',
    description: 'Crisp hand-rolled pastry filled with shredded cabbage, carrots, bell peppers, and scallions.',
    price: 520,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000011',
    id: 'starter_11',
    name: 'Chicken Boti Paratha Roll',
    description: 'Crispy flaky paratha wrapped with juicy grilled chicken boti, sliced purple onions, and mint raita.',
    price: 590,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000012',
    id: 'starter_12',
    name: 'Golden Fried Prawns',
    description: 'Jumbo Arabian Sea prawns crumb-coated and fried to golden perfection, served with garlic mayo dip.',
    price: 1450,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000013',
    id: 'starter_13',
    name: 'Dahi Bhallay Khaas',
    description: 'Soft lentil dumplings soaked in chilled whipped yoghurt, topped with sweet saunth and zesty cumin dust.',
    price: 480,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000014',
    id: 'starter_14',
    name: 'Bihari Beef Boti',
    description: 'Thin tender beef strips marinated overnight in raw papaya, mustard oil, and ground Bihari spices.',
    price: 1150,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },

  // ─── MAINS (20 Items) ───
  {
    _id: '65a000000000000000000015',
    id: 'main_1',
    name: 'Royal Mutton Karahi',
    description: 'Tender goat mutton simmered in iron wok with fresh tomatoes, ginger slices, and freshly crushed spices.',
    price: 2450,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000016',
    id: 'main_2',
    name: 'Special Chicken Dum Biryani',
    description: 'Fragrant aged basmati rice layered with marinated chicken, saffron milk, caramelized onions, and kewra water.',
    price: 1350,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000017',
    id: 'main_3',
    name: 'Nihari Khaas',
    description: 'Slow-cooked shank beef in velvety spiced bone marrow broth, garnished with julienned ginger, fried onions, and lime.',
    price: 1650,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000018',
    id: 'main_4',
    name: 'Butter Chicken Handi',
    description: 'Smoked boneless tandoori chicken simmered in rich tomato gravy enriched with butter and fenugreek leaves.',
    price: 1550,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000019',
    id: 'main_5',
    name: 'Roghni Naan Basket',
    description: 'Fluffy tandoor-baked flatbreads brushed with clarified butter and sesame seeds (3 pcs).',
    price: 320,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000020',
    id: 'main_6',
    name: 'Mutton Shinwari Karahi',
    description: 'Authentic Khyber Pass style goat mutton cooked simply in lamb fat, fresh tomatoes, salt, and green chillies.',
    price: 2550,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000021',
    id: 'main_7',
    name: 'Beef Shahi Haleem',
    description: 'Slow-simmered blend of seven grains, lentils, and shredded beef cooked for 12 hours to silken perfection.',
    price: 1150,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000022',
    id: 'main_8',
    name: 'Chicken White Handi',
    description: 'Boneless chicken cubes cooked in silky cashew nut paste, white cream, green chillies, and crushed cumin.',
    price: 1480,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000023',
    id: 'main_9',
    name: 'Daal Makhani Bukhara',
    description: 'Whole black lentils and kidney beans slow-cooked overnight with fresh cream, butter, and sun-ripened tomatoes.',
    price: 890,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000024',
    id: 'main_10',
    name: 'Palak Paneer Shahi',
    description: 'Fresh spinach purée tempered with garlic, ginger, and cumin, folded with soft fried cottage cheese cubes.',
    price: 990,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000025',
    id: 'main_11',
    name: 'Dum Mutton Biryani',
    description: 'Aromatic layered basmati rice with succulent mutton pieces, dried plums, mint, and saffron.',
    price: 1850,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000026',
    id: 'main_12',
    name: 'Chicken Tikka Masala Handi',
    description: 'Chargrilled chicken boti cooked in a vibrant tomato and bell pepper masala with aromatic dried fenugreek.',
    price: 1450,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000027',
    id: 'main_13',
    name: 'Garlic Butter Naan Basket',
    description: 'Tandoor-baked flatbreads laden with roasted minced garlic, fresh coriander, and melted dairy butter (3 pcs).',
    price: 360,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000028',
    id: 'main_14',
    name: 'Peshawari Namkeen Gosht',
    description: 'Tender baby goat cuts slow-simmered in their natural juices with whole black peppercorns and sea salt.',
    price: 2350,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000029',
    id: 'main_15',
    name: 'Prawn Masala Karahi',
    description: 'Tiger prawns quickly tossed in a spicy tomato and onion gravy with fresh coriander and ginger juliennes.',
    price: 2150,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000030',
    id: 'main_16',
    name: 'Chicken Jalfrezi',
    description: 'Tender chicken strips stir-fried with crisp bell peppers, Spanish onions, and a zesty tomato glaze.',
    price: 1390,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000031',
    id: 'main_17',
    name: 'Beef Paye Stew',
    description: 'Traditional slow-cooked beef trotters in rich, gelatinous spiced broth, served with freshly cut green chillies and lemon.',
    price: 1550,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000032',
    id: 'main_18',
    name: 'Awadhi Matka Biryani',
    description: 'Dum cooked long-grain basmati rice sealed inside earthen clay pot with aromatic bone-in chicken.',
    price: 1490,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
    isSpecial: false,
    isAvailable: false
  },
  {
    _id: '65a000000000000000000033',
    id: 'main_19',
    name: 'Kandahari Sesame Kulcha',
    description: 'Crisp layered tandoori bread coated with toasted white sesame seeds and glazed with desi ghee (3 pcs).',
    price: 340,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000034',
    id: 'main_20',
    name: 'Mughlai Chicken Korma',
    description: 'Royal chicken curry simmered in fragrant yogurt, fried onion gravy, crushed cardamom, and screwpine kewra water.',
    price: 1420,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },

  // ─── DESSERTS (10 Items) ───
  {
    _id: '65a000000000000000000035',
    id: 'dessert_1',
    name: 'Zafrani Shahi Tukray',
    description: 'Crisp golden brioche soaked in cardamom saffron rabri, garnished with silver leaf and roasted pistachios.',
    price: 580,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000036',
    id: 'dessert_2',
    name: 'Gulab Jamun with Rabri',
    description: 'Warm soft milk dumplings drenched in rose water syrup, served over chilled clotted rabri cream.',
    price: 480,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1514849302-984523450ce4?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000037',
    id: 'dessert_3',
    name: 'Matka Kulfi Falooda',
    description: 'Traditional slow-reduced frozen malai kulfi served with vermicelli noodles, basil seeds, and pure rose syrup.',
    price: 550,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000038',
    id: 'dessert_4',
    name: 'Shahi Zafrani Kheer',
    description: 'Slow-simmered basmati rice and rich buffalo milk pudding infused with saffron strands and slivered almonds.',
    price: 460,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000039',
    id: 'dessert_5',
    name: 'Gajar Ka Halwa Desi Ghee',
    description: 'Slow-caramelized winter carrots cooked in clarified butter, condensed milk khoya, cashews, and raisins.',
    price: 520,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000040',
    id: 'dessert_6',
    name: 'Rasmalai Royal Pista',
    description: 'Delicate poached cottage cheese discs steeped in cold saffron and cardamom scented milk with roasted pistachios.',
    price: 540,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000041',
    id: 'dessert_7',
    name: 'Jalebi with Creamy Rabri',
    description: 'Freshly fried crispy golden pretzel coils soaked in warm saffron syrup, served alongside thickened rabri.',
    price: 490,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000042',
    id: 'dessert_8',
    name: 'Mango Kulfi Slice',
    description: 'Rich frozen dairy cream slice blended with pure Sindh Chaunsa mango pulp and garnished with pistachio crumb.',
    price: 420,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000043',
    id: 'dessert_9',
    name: 'Royal Zarda Sweet Rice',
    description: 'Traditional sweet yellow basmati rice infused with cardamom, topped with baby gulab jamuns, candied fruits, and khoya.',
    price: 490,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000044',
    id: 'dessert_10',
    name: 'Badam Pista Kulfi Pot',
    description: 'Traditional earthenware pot filled with dense, caramelized almond and pistachio frozen dessert.',
    price: 530,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
    isSpecial: false,
    isAvailable: false
  },

  // ─── DRINKS (10 Items) ───
  {
    _id: '65a000000000000000000045',
    id: 'drink_1',
    name: 'Royal Mint Lemonade',
    description: 'Sparkling fresh lemon cooler blended with crushed garden mint sprigs and black Himalayan salt.',
    price: 350,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000046',
    id: 'drink_2',
    name: 'Classic Mango Lassi',
    description: 'Thick creamy yoghurt churned with fresh sweet Chaunsa mango pulp and fragrant green cardamom.',
    price: 420,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000047',
    id: 'drink_3',
    name: 'Karak Dastaan Chai',
    description: 'Strong full-bodied black tea brewed with evaporated milk and freshly crushed green cardamom pods.',
    price: 250,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000048',
    id: 'drink_4',
    name: 'Sweet Malai Lassi',
    description: 'Freshly churned whole-milk yoghurt drink topped with a generous dollop of thick clotted cream.',
    price: 380,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000049',
    id: 'drink_5',
    name: 'Salted Cumin Lassi',
    description: 'Refreshing traditional savory yoghurt cooler infused with roasted cumin seeds and black salt.',
    price: 340,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000050',
    id: 'drink_6',
    name: 'Kashmiri Pink Noon Chai',
    description: 'Special slow-brewed green tea leaves aerated to a blushing pink hue, served with clotted malai and crushed almonds.',
    price: 320,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000051',
    id: 'drink_7',
    name: 'Rooh Afza Basil Cooler',
    description: 'Chilled herbal rose distillate mixed with fresh lime juice, ice, and swollen sweet basil seeds (tukh malanga).',
    price: 290,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000052',
    id: 'drink_8',
    name: 'Iced Peach & Mint Cooler',
    description: 'Brewed Darjeeling black tea poured over crushed ice with peach nectar, lemon slice, and fresh mint.',
    price: 360,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000053',
    id: 'drink_9',
    name: 'Fresh Sugarcane Cooler',
    description: 'Freshly pressed cold sugarcane juice spiked with fresh ginger root, mint, and a squeeze of key lime.',
    price: 320,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  },
  {
    _id: '65a000000000000000000054',
    id: 'drink_10',
    name: 'Royal Saffron Cardamom Milk',
    description: 'Warm whole milk simmered with Kashmiri saffron filaments, crushed green cardamom, and honey.',
    price: 450,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
    isSpecial: true,
    isAvailable: true
  }
];

module.exports = initialMenuItems;
