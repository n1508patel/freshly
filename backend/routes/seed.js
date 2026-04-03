import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const newProducts =[
    {
      name: "CHIPS AHOY! Cookies",
      price: 7.25,
      old: 9.95,
      discount: "23%",
      rating: 4,
      category: "Snacks",
      tags: ["cookies", "chocolate", "sweet", "healty"],
      specs: [
        { label: "Brand", value: "Nabisco" },
        { label: "Type", value: "Pouch" },
        { label: "Life", value: "30 Days" }
      ],
      description: "Nabisco Chips Ahoy Original Chocolate Chips Cookies, 368g",
      brand: "Nabisco",
      imgs: [
        "https://m.media-amazon.com/images/I/814OlSoF3CL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/81qrX4vL+wL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/817U8IEZclL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/81O11G4AcGL._SL1500_.jpg"
      ]
    },
    {
      name: "Lays Classic Chips",
      price: 3.29,
      old: 4.29,
      discount: "24%",
        category: "Snacks",
      description: `Lays Potato Chips Classic Salted, 73.7g.
CLASSIC FLAVOUR: Lay's Classic is perfectly salted and tasty  
QUALITY POTATOES: Made from high quality farm potatoes  
100% VEGETARIAN snack  
PERFECT FOR ANY OCCASION  
ABOUT THE BRAND: Lay's always brings best flavours and quality`,
      flavour: "Classic Salted",
      tags: ["Chips", "Potato", "snack"],
      specs: [
        { label: "Brand", value: "Lays" },
        { label: "Type", value: "Snack" },
        { label: "Net Quantity", value: "79.7 Grams" },
        { label: "Diet Type", value: "Gluten Free" }
      ],
      rating: 4.5,
      imgs: [
        "https://m.media-amazon.com/images/I/41VxPV-rWsL._SY300_SX300_QL70_ML2_.jpg",
        "https://m.media-amazon.com/images/I/716k3PyJAhL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61kjRvJZr7L._SL1500_.jpg"
      ]
    },
    {
      name: "Dried Fruit Crisps",
      price: 19.50,
      old:  24.00,
      discount: "19%",
      description: "Nectar Superfoods Freeze Dried Custard Apple | No Preservatives, No Added Sugar, Healthy Dried Fruit | 100% Natural, Vegan, Gluten Free Snack for Kids and Adults | 20 gram Pouch (PACK OF 1)",
      category: "Snacks",
      tags: ["Fruit", "dry", "sweet", "snack"],
      specs: [
        { label: "Brand", value: "Nabisco" },
        { label: "Type", value: "Snack" },
        { label: "Package Weight", value: "0.1 Kilograms" },
        { label: "Item Package Quantity", value: "1" },
        { label: "Speciality", value: "Gluten Free, No Preservatives, Vegan" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/71zER2783-L._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/71IFxIW16mL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/81QEYzHfQNL._SL1500_.jpg"
      ]
    },
    {
      name: "Cheetos Crunchy",
      price: 4.49,
      old: 5.99,
      discount: "25%",
      category: "Snacks",
      description: "Frito Lay Cheetos Crunchy Cheese Flavored Snack, 8 oz ℮ 226.8 g",
      rating: 4.5,
      tags: ["snack", "cheese", "crunchy"],
      specs: [
        { label: "Brand", value: "Cheetos" },
        { label: "Type", value: "Snack" },
        { label: "Package Weight", value: "0.22 Kilograms" },
        { label: "Item Package Quantity", value: "1" },
        { label: "Speciality", value: "Gluten Free" }
      ],
      imgs: [
        "https://m.media-amazon.com/images/I/816SNZtqvVL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/51IUHDxlOIL.jpg",
        "https://m.media-amazon.com/images/I/519ikrmWLEL.jpg"
      ]
    },
    {
      name: "Coconut Water Drink",
      price: 9.49,
      old: 16.99,
      discount: "25%",
      category: "Beverages",
      description: "Paper Boat Swing Coconut Water Drink 1200ml",
      tags: ["Beverages", "Juices", "sweet", "Food"],
      specs: [
        { label: "Brand", value: "Paper Boat" },
        { label: "Type", value: "Juices" },
        { label: "Flavour", value: "coconut" },
        { label: "Speciality", value: "No Artificial Colors" }
      ],
      rating: 4.3,
      imgs: [
        "https://m.media-amazon.com/images/I/61LZtKHPiWL._SY879_.jpg",
        "https://m.media-amazon.com/images/I/71zHg2FioRL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/6113RRsiU0L._SL1500_.jpg"
      ]
    },
    {
      name: "Lemon Juice",
      price: 8.49,
      old: 10.99,
      discount: "17%",
      category: "Beverages",
      description: "Gusto Foods Yellow Lemon Juice Concentrate - 750ml",
      tags: ["cookies", "Juices", "sweet", "Drink"],
      specs: [
        { label: "Brand", value: "Gusto Foods" },
        { label: "Type", value: "Beverages" },
        { label: "Net Quantity", value: "750.0 Milliliters" },
        { label: "Flavour", value: "Just Lemonz" },
        { label: "Package Information", value: "Bottle" }
      ],
      rating: 4.2,
      imgs: [
        "https://m.media-amazon.com/images/I/51Xt3Cz+W+L._SX679_.jpg",
        "https://m.media-amazon.com/images/I/51U+A2whpJL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/51pI69iAhCL._SX679_.jpg"
      ]
    },
    {
      name: "Cranberry Punch",
      price: "15.49",
      old: "20.99",
      discount: "11%",
      category: "Beverages",
      description: "CAPTEN Cranberry Fruit Syrup 1L",
      tags: ["Beverages", "Mocktails", "Cocktails", "Drinks"],
      specs: [
        { label: "Brand", value: "Capten" },
        { label: "Type", value: "Beverages" },
        { label: "Diet Type", value: "Vegetarian" },
        { label: "Net Quantity", value: "1000.0 Milliliters" },
        { label: "Manufacturer", value: "B-6, New Friends Colony, NEW DELHI" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/61BXkXhtiGL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61Y5+RBzzYL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61PhsUwQQGL._SL1000_.jpg"
      ]
    },
    {
      name: "Coca-Cola Diet",
      price: "4.49",
      old: "5.99",
      discount: "25%",
      description: "Coca-Cola Diet Soft Drink, 300Ml - Cola",
      category: "Beverages",
      tags: ["Beverages", "Soft Drink", "sweet", "Diet"],
      specs: [
        { label: "Brand", value: "Coca-Cola" },
        { label: "Type", value: "Beverages" },
        { label: "Diet Type", value: "Vegan" }
      ],
      rating: 4.5,
      imgs: [
        "https://m.media-amazon.com/images/I/51RZZVQIr-L._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61vsbzB+bZL._SL1286_.jpg",
        "https://m.media-amazon.com/images/I/613N5QmWg5L._SL1000_.jpg"
      ]
    },
  {
      name: "Amul Salted Butter",
      price: "4.50",
      old: "7.00",
      discount: "15%",
      description: "Amul Salted Butter Pasteurised, 500 Gm",
      category: "Dairy",
      tags: ["Dairy", "Salted", "Butter", "Margarine"],
      specs: [
        { label: "Brand", value: "Amul" },
        { label: "Flavour", value: "Salted" },
        { label: "Biological Source", value: "Cow" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/61vr7r8qqsL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/81CA4C12MxL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71ELuNycSQL._SL1500_.jpg"
      ]
    },
    {
      name: "OatWOW Classic Oat",
      price: "15.20",
      old: "19.80",
      discount: "20%",
      description: "Urban Platter OatWOW Classic Oat Beverage, 1 Litre (Pack of 6, Plant-Based, Milk Alternative, Creamy, Lactose-Free)",
      category: "Beverages",
      tags: ["Beverage", "milk", "sweet", "liquid"],
      specs: [
        { label: "Brand", value: "urban platter" },
        { label: "Net Quantity", value: "6000.0 Milliliters" },
        { label: "Diet Type", value: "Gluten Free, Plant Based, Vegan" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/81hr7nGzL1L._SX679_PIbundle-6,TopRight,0,0_AA679SH20_.jpg",
        "https://m.media-amazon.com/images/I/81MONB6XkGL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/714cZxE0M7L._SL1500_.jpg"
      ]
    },
    {
      name: "Amul Fresh Cream",
      price: "1.30",
      old: "4.80",
      discount: "18%",
      description: "Fresh dairy cream ideal for cooking, baking and desserts.",
      category: "Dairy",
      tags: ["cream", "milk", "fresh", "amul"],
      specs: [
        { label: "Brand", value: "Amul" },
        { label: "Type", value: "Fresh Cream" },
        { label: "Pack", value: "Tetra Pack" },
        { label: "Shelf Life", value: "6 Months" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/71MNq8ICMNL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/710x8tPeVQL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71uoErshl-L._SL1500_.jpg"
      ]
    },
    {
      name: "Amul Rabri",
      price: "3.20",
      old: "7.90",
      discount: "22%",
      description: "Traditional thick sweetened milk dessert.",
       category: "Dairy",
      tags: ["rabri", "sweet", "milk", "amul"],
      specs: [
        { label: "Brand", value: "Amul" },
        { label: "Type", value: "Milk Dessert" },
        { label: "Taste", value: "Sweet" },
        { label: "Shelf Life", value: "10 Days" }
      ],
      rating: 5,
      imgs: [
        "https://m.media-amazon.com/images/I/51j7vPMeTEL._SL1024_.jpg",
        "https://m.media-amazon.com/images/I/61GRaxMtmTL._SL1250_.jpg",
        "https://m.media-amazon.com/images/I/61IOEHuGrkL._SL1250_.jpg"
      ]
    },
    {
      name: "Anveshan A2 Gir Cow Ghee",
      price: "4.10",
      old: "9.90",
      discount: "16%",
      description: "Pure A2 ghee made from Gir cow milk.",
      category: "Dairy",
      tags: ["ghee", "organic", "cow milk", "pure"],
      specs: [
        { label: "Brand", value: "Anveshan" },
        { label: "Type", value: "A2 Ghee" },
        { label: "Source", value: "Gir Cow Milk" },
        { label: "Shelf Life", value: "12 Months" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/61UG0XreJsL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71l6H8l7VVL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61-AQ1Gd1jL._SL1080_.jpg"
      ]
    },
    {
      name: "Mother Dairy Cheese Slices",
      price: "2.10",
      old: "2.90",
      discount: "9%",
      description: "Soft creamy cheese slices perfect for sandwiches and burgers.",
      category: "Dairy",
      tags: ["cheese", "dairy", "sandwich", "snack"],
      specs: [
        { label: "Brand", value: "Mother Dairy" },
        { label: "Type", value: "Cheese Slices" },
        { label: "Pack", value: "Slice Pack" },
        { label: "Shelf Life", value: "6 Months" }
      ],
      rating: 4.2,
      imgs: [
        "https://m.media-amazon.com/images/I/61+AzywctoL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61nyyNtB14L._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61264YsFmqL._SX679_.jpg"
      ]
    },
    {
      name: "Amul Masti Dahi",
      price: "1.10",
      old: "2.90",
      discount: "13%",
      description: "Fresh thick curd with natural probiotics.",
       category: "Dairy",
      tags: ["dahi", "curd", "probiotic", "amul"],
      specs: [
        { label: "Brand", value: "Amul" },
        { label: "Type", value: "Curd" },
        { label: "Texture", value: "Thick" },
        { label: "Shelf Life", value: "7 Days" }
      ],
      rating: 4,
      imgs: [
        "https://m.media-amazon.com/images/I/71oajFAx9WL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61tnatvY1WL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/51qFqc-YChL._SL1000_.jpg"
      ]
    },
    {
      name: "Torres Fried Egg Crisps",
      price: "1250",
      old: "1300",
      discount: "24%",
      description: "Lays Potato Chips Classic Salted.",
      category: "Snacks",
      tags: ["chips", "potato", "crispy", "snack"],
      specs: [
        { label: "Brand", value: "Lays" },
        { label: "Type", value: "Potato Chips" },
        { label: "Flavour", value: "Classic Salted" },
        { label: "Diet", value: "Vegetarian" }
      ],
      rating: 4.5,
      imgs: [
        "https://m.media-amazon.com/images/I/71cZmpc0vrL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71BYVSIkq1L._SL1306_.jpg",
        "https://m.media-amazon.com/images/I/51ipFkBPxiL._SL1125_.jpg"
      ]
    },
  
{
    name: "Samsung Bluetooth Earbuds",
    price: 49.00,
    old: 65.00,
    discount: "25%",
    rating: 5,
    category: "Electronics",
    availability: "inStock",
    brand: "Samsung",
    tags: ["earbuds", "bluetooth", "wireless", "samsung"],
    specs: [
      { label: "Brand", value: "Samsung" },
      { label: "Battery", value: "6 Hours" },
      { label: "Warranty", value: "1 Year" }
    ],
    description: "Samsung Galaxy Buds Wireless Bluetooth Earbuds with Noise Cancellation",
    imgs: ["https://m.media-amazon.com/images/I/71aIafH7+fL._SL1500_.jpg",
            "https://m.media-amazon.com/images/I/814-qMDPMBL._SL1500_.jpg",
            "https://m.media-amazon.com/images/I/81200u9mIcL._SL1500_.jpg"]
  },
  {
    name: "boAt Rockerz 450",
    price: 29.00,
    old: 45.00,
    discount: "35%",
    rating: 4,
    category: "Electronics",
    availability: "inStock",
    brand: "boAt",
    tags: ["headphone", "wireless", "boat", "music"],
    specs: [
      { label: "Brand", value: "boAt" },
      { label: "Battery", value: "15 Hours" },
      { label: "Type", value: "Over-Ear" }
    ],
    description: "boAt Rockerz 450 Bluetooth On-Ear Headphone with Mic",
    imgs: ["https://m.media-amazon.com/images/I/61faDMBMdmL._SL1500_.jpg",
            "https://m.media-amazon.com/images/I/71khBmWxrmL._SL1500_.jpg",
            "https://m.media-amazon.com/images/I/71njHUk2pKL._SL1500_.jpg"
    ]
  },
  {
    name: "Anker USB-C Charger",
    price: 18.00,
    old: 25.00,
    discount: "28%",
    rating: 5,
    category: "Electronics",
    availability: "inStock",
    brand: "Anker",
    tags: ["charger", "usbc", "fast charging", "anker"],
    specs: [
      { label: "Brand", value: "Anker" },
      { label: "Watt", value: "20W" },
      { label: "Type", value: "USB-C" }
    ],
    description: "Anker 20W USB-C Fast Charger for iPhone and Android",
    imgs: ["https://m.media-amazon.com/images/I/61EncXzTQmL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71SGIwkqWiL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61WMTXwBzIL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71ypkolBDTL._SL1500_.jpg"
        ]
  },
  {
    name: "Redmi Smart Band",
    price: 35.00,
    old: 50.00,
    discount: "30%",
    rating: 4,
    category: "Electronics",
    availability: "onOffer",
    brand: "Redmi",
    tags: ["smartband", "fitness", "redmi", "wearable"],
    specs: [
      { label: "Brand", value: "Redmi" },
      { label: "Battery", value: "14 Days" },
      { label: "Display", value: "AMOLED" }
    ],
    description: "Redmi Smart Band with 1.08 inch Color Display and Heart Rate Monitor",
    imgs: ["https://m.media-amazon.com/images/I/61WHvwn1+aL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71a6Nhy8kdL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61JWzVqq-7L._SL1100_.jpg",
    ]
  },
  {
    name: "Paracetamol Tablets",
    price: 3.50,
    old: 5.00,
    discount: "30%",
    rating: 4,
    category: "Pharma",
    availability: "inStock",
    brand: "Calpol",
    tags: ["medicine", "paracetamol", "fever", "pain relief"],
    specs: [
      { label: "Brand", value: "Calpol" },
      { label: "Dosage", value: "500mg" },
      { label: "Count", value: "20 Tablets" }
    ],
    description: "Calpol Paracetamol 500mg Tablets for Fever and Pain Relief",
    imgs: ["https://m.media-amazon.com/images/I/91bz6RZlHZL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/91iZOwytrrL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71nbhEJuB6L._SL1500_.jpg",
    ]
  },
  {
    name: "Vitamin C Tablets",
    price: 6.00,
    old: 9.00,
    discount: "33%",
    rating: 5,
    category: "Pharma",
    availability: "inStock",
    brand: "Limcee",
    tags: ["vitamin", "immunity", "supplement", "health"],
    specs: [
      { label: "Brand", value: "Limcee" },
      { label: "Dosage", value: "500mg" },
      { label: "Count", value: "15 Tablets" }
    ],
    description: "Limcee Vitamin C Chewable Tablets for Immunity Boost",
    imgs: ["https://m.media-amazon.com/images/I/615S+GWbx1L._SL1024_.jpg",
        "https://m.media-amazon.com/images/I/717QVJnLZjL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/81e8JiuoWPL._SL1500_.jpg",
    ]
  },
  {
    name: "Dettol Hand Sanitizer",
    price: 4.00,
    old: 6.50,
    discount: "38%",
    rating: 5,
    category: "Pharma",
    availability: "onOffer",
    brand: "Dettol",
    tags: ["sanitizer", "dettol", "hygiene", "germ protection"],
    specs: [
      { label: "Brand", value: "Dettol" },
      { label: "Volume", value: "500ml" },
      { label: "Type", value: "Gel" }
    ],
    description: "Dettol Instant Hand Sanitizer 500ml - Kills 99.9% Germs",
    imgs: ["https://m.media-amazon.com/images/I/51bBWOXg7JL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/61Ff66T-DmS._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/51o39oPbJuS._SL1000_.jpg",
    ]
  },
  {
    name: "Himalaya Face Wash",
    price: 5.50,
    old: 7.00,
    discount: "21%",
    rating: 4,
    category: "Pharma",
    availability: "inStock",
    brand: "Himalaya",
    tags: ["facewash", "himalaya", "skin", "neem"],
    specs: [
      { label: "Brand", value: "Himalaya" },
      { label: "Volume", value: "150ml" },
      { label: "Type", value: "Neem" }
    ],
    description: "Himalaya Purifying Neem Face Wash for Normal to Oily Skin",
    imgs: ["https://m.media-amazon.com/images/I/71DInYYVWRL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/81r4Xb5Zb7L._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61XvMsh51yL._SL1000_.jpg",
    ]
  },
  {
    name: "Fresh Tomatoes",
    price: 1.50,
    old: 2.50,
    discount: "40%",
    rating: 4,
    category: "Fruits & Vegetables",
    availability: "inStock",
    brand: "Blinkit",
    tags: ["tomato", "fresh", "vegetables", "organic"],
    specs: [
      { label: "Source", value: "Blinkit" },
      { label: "Weight", value: "500g" },
      { label: "Type", value: "Fresh" }
    ],
    description: "Fresh Red Tomatoes 500g - Sourced daily from local farms",
    imgs: ["https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1440/da/cms-assets/cms/product/27a22d9c-469e-483d-bebf-7a2b1e86a64c.png",
        
    ]
  },
  {
    name: "Green Spinach",
    price: 1.00,
    old: 1.80,
    discount: "44%",
    rating: 5,
    category: "Fruits & Vegetables",
    availability: "inStock",
    brand: "Amazon Fresh",
    tags: ["spinach", "leafy", "green", "healthy"],
    specs: [
      { label: "Source", value: "Amazon Fresh" },
      { label: "Weight", value: "250g" },
      { label: "Type", value: "Organic" }
    ],
    description: "Fresh Organic Spinach Leaves 250g - Rich in Iron and Vitamins",
    imgs: ["https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=120,h=120/da/cms-assets/cms/product/eb5e81ea-171e-49d6-b256-b7ffb7eb7d36.jpg",]
  },
  {
    name: "Baby Potatoes",
    price: 2.00,
    old: 3.00,
    discount: "33%",
    rating: 4,
    category: "Fruits & Vegetables",
    availability: "onOffer",
    brand: "Zepto",
    tags: ["potato", "baby", "vegetables", "fresh"],
    specs: [
      { label: "Source", value: "Zepto" },
      { label: "Weight", value: "1kg" },
      { label: "Type", value: "Fresh" }
    ],
    description: "Fresh Baby Potatoes 1kg - Perfect for curries and roasting",
    imgs: ["https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/da/cms-assets/cms/product/dac2a702-c38e-481f-b9b1-8a0accc40e1f.png"]
  },
  {
    name: "Organic Carrots",
    price: 1.80,
    old: 2.80,
    discount: "35%",
    rating: 5,
    category: "Fruits & Vegetables",
    availability: "inStock",
    brand: "Swiggy",
    tags: ["carrot", "organic", "fresh", "healthy"],
    specs: [
      { label: "Source", value: "Swiggy Instamart" },
      { label: "Weight", value: "500g" },
      { label: "Type", value: "Organic" }
    ],
    description: "Fresh Organic Carrots 500g - Rich in Vitamin A and Beta Carotene",
    imgs: ["https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1440/da/cms-assets/cms/product/1c5a3b5b-90dd-47c8-a4bc-39a137634dfb.png"]
  },
  
  {
    name: "Bru Coffee",
    price: 6.00,
    old: 8.00,
    discount: "25%",
    rating: 4,
    category: "Beverages",
    availability: "inStock",
    brand: "Bru",
    tags: ["coffee", "bru", "beverages"],
    specs: [{ label: "Brand", value: "Bru" }],
    description: "Bru Instant Coffee Powder 200g",
    imgs: ["https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/da/cms-assets/cms/product/0bb7d7af-4f15-4ffe-ae58-8da29caf205f.png"]
  },
  {
    name: "Maggi Noodles",
    price: 1.20,
    old: 1.80,
    discount: "33%",
    rating: 5,
    category: "Snacks",
    availability: "inStock",
    brand: "Maggi",
    tags: ["noodles", "maggi", "snack"],
    specs: [{ label: "Brand", value: "Maggi" }],
    description: "Maggi 2-Minute Noodles Masala, Pack of 12",
    imgs: ["https://m.media-amazon.com/images/I/71lXtu5Z8EL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/8118w4hcBAL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/81zJSxMv53L._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/81A6iTMWRoL._SL1500_.jpg"
    ]
  }
];
for (let product of newProducts) {
  await Product.updateOne(
    { name: product.name },   // same name check karse
    product,                  // navo data
    { upsert: true }          // hoy to update, navo hoy to insert
  );
}
 await Product.deleteMany({});

    // new products insert
    await Product.insertMany(newProducts);

    res.send("Database Reset & Products Added ✅");

  } catch (error) {
    console.log("seed error:", error);
    res.status(500).json({ message: error.message });
  }
});
export default router; 