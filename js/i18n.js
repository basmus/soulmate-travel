(function () {
  var STORAGE_KEY = "site-lang";

  var en = {
    "meta.title": "Lyubov — guide in Tbilisi",
    "meta.shopTitle": "Tent rental in Tbilisi — Soulmate Travel",
    "meta.shopDesc":
      "Tent and gear rental in Tbilisi — for Kazbegi, Svaneti and trips around Georgia. Kits or build your own.",
    "meta.orderTitle": "Order — Soulmate Travel",

    "hero.eyebrow": "Routes and trips around Georgia",
    "hero.title": "Soulmate Travel",
    "hero.lead1": "Thoughtful routes for travel in Tbilisi and Georgia.",
    "hero.lead2": "Ready-made guides, atmospheric places, and tourist gear rental.",

    "nav.about": "About me",
    "nav.routes": "Routes",
    "nav.adventures": "Adventures & experiences",
    "nav.rental": "Rental",
    "nav.reviews": "Reviews",

    "about.title": "About me",
    "about.alt": "Photo of guide Lyubov",
    "about.p1": "Hi! I'm Lyubov, a guide in Tbilisi and Georgia.",
    "about.p2":
      "Tbilisi is a complex, layered city. After several years living here, I've learned to read it through architecture, space, and details that are easy to miss at first glance. My work is grounded in professional training, careful attention, and respect for each person's pace.",
    "about.p3":
      "My professional life began in another field. An engineering background and earlier work as a microbiologist in production taught me to notice processes and details — which makes my tours thoughtful and rich. That approach naturally led me to a production tour at a craft brewery and an interest in Georgian winemaking techniques.",
    "about.p4":
      "Tours with me are not only an introduction to Tbilisi's history, but also immersion in the city's unique atmosphere — its culture and architecture. I show hidden corners and stories that make a walk one of a kind.",
    "about.p5":
      "Day trips beyond Tbilisi let you enjoy stunning mountain landscapes, explore churches and interesting locations, and have a picnic in a warm, welcoming atmosphere.",

    "routes.title": "Routes",
    "routes.tbilisi.title": "Tbilisi's timeless palette:<br>from architectural eras to street style",
    "routes.tbilisi.subtitle": "City walking tour of Tbilisi",
    "routes.tbilisi.lead":
      "An original walking tour where you'll see not only the most popular spots, but also hidden places that reveal the soul of the country, its culture, and its people. Tbilisi is an open-air museum where every neighborhood is full of stories and art.",
    "routes.tbilisi.alt": "Historic Tbilisi — balconies and cable car",
    "routes.mtskheta.title":
      "Where rivers and eras meet: a journey through Mtskheta and beyond. Picnic on the slopes",
    "routes.mtskheta.subtitle": "Mtskheta",
    "routes.mtskheta.lead":
      "Mtskheta is Georgia's ancient capital, with about 2,500 years of history. Cozy streets, magnificent views, and the greatest sanctuaries of the Georgian people. Around Mtskheta lie architectural and cultural treasures, each set among scenic mountains.",
    "routes.mtskheta.alt": "Mtskheta street — Svetitskhoveli Cathedral, souvenir shops and Georgian flags",
    "routes.gareji.title":
      "Colored hills of the Gareja desert. Journey to the David Gareja cave monastery",
    "routes.gareji.subtitle": "David Gareja",
    "routes.gareji.lead":
      "A road-trip tour to a religious center of cave monasteries and an unusual natural site — the Gareja semi-desert with bright, multicolored hills.",
    "routes.gareji.alt": "Group against the colorful hills of the Gareja desert",
    "routes.kakheti.title": "Kakheti",
    "routes.kakheti.subtitle": "PDF route",
    "routes.kakheti.lead": "Coming soon",
    "routes.kakheti.alt": "Kakheti surroundings and mountain landscape",
    "routes.cta": "Get the guide",

    "adventures.title": "Adventures & experiences",
    "carousel.prev": "Previous photo",
    "carousel.next": "Next photo",
    "reviews.prev": "Previous reviews",
    "reviews.next": "Next reviews",

    "photo.title": "Photo session in national costumes with Old Tbilisi views",
    "photo.subtitle": "Tbilisi",
    "photo.lead":
      "A professional photo shoot in traditional Georgian costumes against the old city — sulfur bath domes, fortress walls, and panoramas of historic Tbilisi.",
    "photo.alt": "Photo session in national costume against Old Tbilisi",
    "photo.caption": "National costume and views of Abanotubani",
    "photo.cta": "Book the experience",

    "samshvilde.title": "Ancient Samshvilde between canyons: easy hiking and a thousand years of history",
    "samshvilde.subtitle": "An active day from Tbilisi",
    "samshvilde.lead":
      "A nature day trip and an unhurried walk through one of Georgia's oldest cities — on a narrow cape between two canyons. Pre-Christian history, fortress and church ruins, viewpoints above the Khrami and Chivchavi rivers, and a picnic with a view",
    "samshvilde.cta": "Book the adventure",
    "samshvilde.more": "More about the route and details",
    "samshvilde.idea": "The idea of the day",
    "samshvilde.idea1": "Walk a place where an ancient city is woven into the canyons",
    "samshvilde.idea2": "Feel a layer of pre-Christian Georgian history",
    "samshvilde.idea3": "See ruins of medieval churches and fortifications",
    "samshvilde.idea4": "Spend a day outdoors — easy, beautiful, and truly atmospheric",
    "samshvilde.walk": "On the walk through Samshvilde",
    "samshvilde.walk1": "Remains of ancient fortress walls",
    "samshvilde.walk2": "Ruins of residential quarters",
    "samshvilde.walk3": "Old churches",
    "samshvilde.walk4": "Samshvilde Sioni",
    "samshvilde.walk5": "Viewpoints above the Khrami and Chivchavi canyons",
    "samshvilde.how": "How the day goes",
    "samshvilde.how1":
      "From Tbilisi we head to ancient Samshvilde. On the way we can stop in Asureti — once the German colony of Elisabethtal: 19th-century stone, wine cellars, and an “old Europe” mood without the rush.",
    "samshvilde.how2":
      "Then — an easy hike across a city founded in the pre-Christian era. Samshvilde stood on a narrow cape between two canyons and was an important trade and defense hub. I'll tell you how the city worked in different times, why it was considered nearly impregnable, and how pagan past and Christian Georgian history intertwine here.",
    "samshvilde.how3":
      "Midday we stop for a short picnic: rest, a snack, and simply take in the landscape.",
    "samshvilde.how4": "On the way back — Algeti reservoir: views, water, and a drive across the dam.",
    "samshvilde.who": "Who it's for",
    "samshvilde.whoText":
      "Anyone who wants to combine light activity, panoramas, and living history without “museum” boredom — one day outside Tbilisi with character.",
    "samshvilde.org": "Practical details",
    "samshvilde.orgText":
      "Duration: 7–8 hrs<br>Drive to locations; walking about 3–4 hrs<br>1–4 people<br>A <strong>picnic is included</strong><br>Bring comfortable non-slip shoes; on clear days — a hat and water",
    "samshvilde.price": "Price",
    "samshvilde.priceText": "140 euro or 450 lari",

    "samshvilde.c1alt": "View from above of the green canyons of the Khrami and Chivchavi near Samshvilde",
    "samshvilde.c1": "Canyons near ancient Samshvilde — panorama from above",
    "samshvilde.c2alt": "Path between ancient stone walls",
    "samshvilde.c2": "Path between ancient walls",
    "samshvilde.c3alt": "Stone church on the Samshvilde grounds",
    "samshvilde.c3": "Stone church on the Samshvilde grounds",
    "samshvilde.c4alt": "Carved stone stele with an ancient inscription",
    "samshvilde.c4": "Carved stele with an ancient inscription",
    "samshvilde.c5alt": "Stone chapel with traditional ribbons",
    "samshvilde.c5": "Chapel with traditional ribbons",
    "samshvilde.c6alt": "Icons on the stone wall of an ancient chapel",
    "samshvilde.c6": "Icons on the stone wall",
    "samshvilde.c7alt": "Walk to the ruins of Samshvilde fortress",
    "samshvilde.c7": "Walk to the fortress ruins",
    "samshvilde.c8alt": "Rest at the canyon edge with a valley panorama",
    "samshvilde.c8": "Rest at the canyon edge",
    "samshvilde.c9alt": "Ancient stone monument and a place to rest",
    "samshvilde.c9": "Ancient monument and a place to rest",
    "samshvilde.c10alt": "Picnic on the grass with a canyon view",
    "samshvilde.c10": "Picnic with a canyon view",
    "samshvilde.c11alt": "Viewpoint above the canyon",
    "samshvilde.c11": "Viewpoint above the canyon",
    "samshvilde.c12alt": "Remains of ancient fortress walls",
    "samshvilde.c12": "Remains of ancient fortress walls",
    "samshvilde.c13alt": "Fortress wall and tower of Samshvilde",
    "samshvilde.c13": "Fortress wall and tower",
    "samshvilde.c14alt": "Carved stones of ancient buildings",
    "samshvilde.c14": "Carved stones of ancient buildings",
    "samshvilde.c15alt": "Cape between canyons — pasture by the ruins",
    "samshvilde.c15": "Cape between canyons — pasture by the ruins",
    "samshvilde.c16alt": "Ruins of Samshvilde Sioni",
    "samshvilde.c16": "Ruins of Samshvilde Sioni",
    "samshvilde.c17alt": "Inside an ancient stone church",
    "samshvilde.c17": "Inside an ancient stone church",
    "samshvilde.c18alt": "Ruins of a roofless church — grass and arched openings",
    "samshvilde.c18": "Roofless church — time and nature",

    "brewery.title": "Beer as art: a craft brewery tour with tasting",
    "brewery.subtitle": "Brewery",
    "brewery.lead":
      "Before moving to Georgia I worked 11 years as a microbiology engineer at a large brewery, so I learned brewing processes and equipment from the inside. I'll talk about beer from different angles — traditions and technology. We'll taste unique beers, hear the brewer's life stories, and visit a bunker.",
    "brewery.p2":
      "The brewery works in small batches and experiments with flavors, so the range has up to 90 original styles — many you won't find anywhere else.",
    "brewery.cta": "Book the experience",
    "brewery.more": "More about the route and details",
    "brewery.see": "You'll see",
    "brewery.see1": "The full beer production cycle.",
    "brewery.see2": "Ingredients, materials, and what makes them special.",
    "brewery.see3": "Equipment — from mill to bottling line.",
    "brewery.see4": "Stories from the brewer and myth-busting.",
    "brewery.see5": "Secrets of craft brewing in Georgia.",
    "brewery.learn": "You'll learn",
    "brewery.learn1": "How craft beer is brewed — from grain to glass.",
    "brewery.learn2": "How craft differs from mass-market beer.",
    "brewery.learn3": "The history of brewing traditions in Georgia.",
    "brewery.learn4": "How ingredients shape taste and aroma.",
    "brewery.learn5": "How fermentation works and why fermenters matter.",
    "brewery.taste": "Tasting",
    "brewery.taste1": "Beer straight from the fermenter.",
    "brewery.taste2": "3–4 beer styles and 4–5 kinds of fruit liqueur.",
    "brewery.taste3": "Light snacks included.",
    "brewery.unique": "What makes it special",
    "brewery.uniqueText":
      "Great for craft beer lovers and foodies looking for non-touristy formats who want to understand from the inside how beer flavor is born — in lively conversation with professional brewers.",
    "brewery.org": "Practical details",
    "brewery.orgText":
      "18+ tour<br>Duration: 2.5 hours.<br>You get to the brewery on your own (about 30 minutes from the center).<br>No food or dairy products on the production floor<br>Eat beforehand and avoid driving after the tour",
    "brewery.price": "Price",
    "brewery.priceText": "120 ₾ or $45 / person<br>Minimum 3 people.<br>Groups of 5+ — 10% off",
    "brewery.c1alt": "Lari — a ritual barley-malt drink in highland Georgia",
    "brewery.c1": "Lari — a ritual barley-malt drink in highland Georgia",
    "brewery.c2alt": "Barley malt — the raw material for beer",
    "brewery.c2": "Barley malt — the raw material for beer",
    "brewery.c3alt": "Megobrebi Brewery beer in a glass",
    "brewery.c3": "Megobrebi Brewery beer in a glass",
    "brewery.c4alt": "Megobrebi craft beer — styles in cans",
    "brewery.c4": "Megobrebi craft beer — styles in cans",
    "brewery.c5alt": "Guide talking about equipment by the fermenters",
    "brewery.c5": "Guide talking about equipment by the fermenters",
    "brewery.c6alt": "Qvevri for fermentation at the brewery",
    "brewery.c6": "Qvevri for fermentation at the brewery",
    "brewery.c7alt": "Group with beer on a brewery tour",
    "brewery.c7": "Group with beer on a brewery tour",
    "brewery.c8alt": "Smelling hops at the brewery",
    "brewery.c8": "Smelling hops at the brewery",
    "brewery.c9alt": "Brewery floor — fermenters and equipment",
    "brewery.c9": "Brewery floor — fermenters and equipment",
    "brewery.c10alt": "Relaxing on the brewery grounds",
    "brewery.c10": "Relaxing on the brewery grounds",

    "coffee.title": "Specialty coffee tasting in the Old Town",
    "coffee.subtitle": "Café in the historic center",
    "coffee.lead":
      "Enjoy a good cup in a cozy café, meet roasters who live for their craft, and discover the world of specialty coffee. In a small group you'll learn how coffee flavor is shaped and try a professional tasting.",
    "coffee.cta": "Book the experience",
    "coffee.more": "More about the format and details",
    "coffee.topics": "Topics",
    "coffee.topics1":
      "In a small Old Town café we'll host an intimate specialty coffee tasting.",
    "coffee.topics2":
      "A chance to try several coffees the way roasters and baristas do — and learn to tell flavors, aromas, and character apart.",
    "coffee.topics3":
      "In a cozy setting you'll enter the world of specialty coffee and learn why one cup can taste like berries or chocolate, and another like citrus or flowers.",
    "coffee.expect": "What to expect",
    "coffee.expect1": "Tasting several specialty coffees from different countries",
    "coffee.expect2": "An introduction to a professional tasting method",
    "coffee.expect3": "A talk about coffee origin, processing, and roasting",
    "coffee.expect4": "Learning to recognize flavor notes",
    "coffee.expect5": "A friendly small-café atmosphere and people who love coffee",
    "coffee.learn": "You'll learn",
    "coffee.learn1": "How specialty coffee differs from ordinary coffee",
    "coffee.learn2": "How coffee flavor is formed",
    "coffee.learn3": "Why the same variety can taste different",
    "coffee.learn4": "How to start sensing flavor notes",
    "coffee.unique": "What makes it special",
    "coffee.unique1": "For those who want to understand coffee more deeply through conversation and practice",
    "coffee.unique2":
      "For specialty fans and newcomers alike — in a small group and a welcoming atmosphere",
    "coffee.unique3": "Convenient location near the sights",
    "coffee.org": "Practical details",
    "coffee.orgText": "Duration: 1.5 hrs<br>Small group — 2 to 5 people<br>Every Saturday at 10:00 and 14:00",
    "coffee.price": "Price",
    "coffee.priceText": "70 ₾ or $27",
    "coffee.c1alt": "Professional coffee tasting — Chemex, cups and beans on the table",
    "coffee.c1": "Cupping-style tasting",
    "coffee.c2alt": "Specialty bean bag and a cup of freshly brewed coffee",
    "coffee.c2": "Beans and cup — meeting a variety",
    "coffee.c3alt": "Tasting guest with a glass of coffee",
    "coffee.c3": "Intimate atmosphere",
    "coffee.c4alt": "Group at a specialty coffee tasting in a cozy café",
    "coffee.c4": "Conversation and tasting",
    "coffee.c5alt": "Guest exploring coffee aroma and taste",
    "coffee.c5": "A professional approach to the cup",
    "coffee.c6alt": "Pour-over brewing demo behind the café counter",
    "coffee.c6": "Brewing and equipment walkthrough",
    "coffee.c7alt": "Espresso machine — extraction into cups on scales",
    "coffee.c7": "Precise espresso extraction",
    "coffee.c8alt": "Pouring coffee from a server into tasting cups",
    "coffee.c8": "From brew to tasting",
    "coffee.c9alt": "Pour-over brewing: kettle and V60 dripper",
    "coffee.c9": "Pour-over by hand",
    "coffee.c10alt": "Roasted beans in a professional cupping tray",
    "coffee.c10": "Beans before the cup",

    "custom.title": "A custom route for your request",
    "custom.text":
      "I'll build a day around your interests and pace — no templates. Tell me what you want to see and feel, and I'll propose a route with living logic and attention to detail.",
    "custom.cta": "Discuss a route",

    "unique.title": "What makes it different",
    "unique.p1":
      "What sets my tours apart? I try to make them not only informative but personal — with a non-standard approach and special attention to guests. Every tour for me is not just a job, but a chance to share my love for this place, its history and culture.",
    "unique.p2":
      "I live in Tbilisi and know it from the inside: not only the history, but the rhythm, character, and contrasts. Architecture, art, landscape, and human stories matter more to me than dry dates. I connect eras, explain the complex in simple words, and create the feeling that you've come to visit a good friend.",
    "unique.p3":
      "Thanks to an engineering background and a sensitive approach, my routes are thoughtful and rich — attentive to detail, but never overloaded.",

    "reviews.title": "Reviews",
    "reviews.tripster": "Review on Tripster",
    "reviews.tbilisi": "Tbilisi city tour",
    "reviews.r1":
      "Huge thanks for a wonderful trip! The David monastery is incredibly beautiful. In my view, one of Georgia's most underrated sights. Captivating views of the Gareja desert, a lovely picnic overlooking Martian landscapes. And a very warm atmosphere on the trip.",
    "reviews.a1": "— Eva, April 2025 · ",
    "reviews.r2":
      "Lyubov is a wonderful storyteller and a very pleasant person! Thanks to her we got to know ancient Georgian culture, visited churches from different periods, and even saw excavations! Our guide did everything for our comfort, answered every question, prepared a delicious picnic, and after the tour shared many tips for places to visit in Tbilisi! Since it was our first time, that was very helpful :) If you want to enrich yourself culturally in an easy, interesting way, I recommend this tour — Lyubov tells it like a good friend you've come to visit to explore Georgia :) Thank you for this mini-journey and the chance to feel the heart of the city!",
    "reviews.a2": "— Marina, August 2025 · ",
    "reviews.r3":
      "I really enjoyed the tour — learning the history of buildings you walk past every day was so interesting, and you're very pleasant and engaging to listen to. Perfect pace (we never rushed, but didn't linger too long either) — I'll definitely join you on other routes 👍",
    "reviews.a3": "— Anna, February 2025 · Tbilisi city tour",
    "reviews.r4":
      "On September 17 we visited the cave monastery in the Gareja desert. It was magnificent! The place is so captivating in its beauty, power, and calm. Lyubov did everything possible to show us how unique this place is. Huge thanks to her!!! And the “cherry on top” was the picnic on the marble hills. Lyubov — you're wonderful!",
    "reviews.a4": "— Tatiana, September 2025 · ",
    "reviews.r5":
      "I liked the interactive parts — involving the audience with questions and riddles. I liked the stories about artists and interesting facts. I liked the overall vibe of the tour.",
    "reviews.a5": "— Daria, January 2026 · Tbilisi city tour",
    "reviews.r6":
      "We booked a private tour from Tbilisi to Mtskheta and surroundings. We loved the route. Lyuba took us through all the historic sites of Georgia's ancient capital. Everything was interesting, educational, and heartfelt. The highlight was a picnic on a hillside overlooking a scenic valley by the Aragvi River. We recommend Lyubov as a professional guide.",
    "reviews.a6": "— Akhmetov, October 2025 · ",
    "reviews.r7":
      "We had long wanted to visit Georgia and see its natural beauty. And finally our dreams came true! The majesty of the mountains and the beauty of the landscape mesmerized us. The old monastery architecture immersed us in history. A perfectly chosen route, a comfortable car, and safety on the road. Special thanks to Lyuba — a kind, responsive person who loves her work and gives it her all. Thanks to her we left with wonderful impressions of this country!",
    "reviews.a7": "— Anastasia, August 2025 · ",

    "footer.tagline": "Tbilisi • Private tours",
    "footer.rental": "Rental",

    "shop.back": "← Tours",
    "shop.title": "Tourist gear rental",
    "shop.lead1": "Tent and gear rental in Tbilisi — for Kazbegi, Svaneti and trips around Georgia.",
    "shop.lead2": "A ready kit or build your own.",
    "shop.nav.kits": "Kits",
    "shop.nav.items": "À la carte",
    "shop.nav.book": "Book",

    "shop.kits.title": "Ready kits",
    "shop.kits.lead": "Most popular — everything you need, already packed.",
    "shop.kit2.title": "Kit for 2 people",
    "shop.kit2.compose": "Tent, 2 sleeping bags, 2 mats",
    "shop.kit2.desc":
      "A ready set for a couple or two friends: everything for overnight stays in the mountains or by the sea. Take it if you don't want to assemble gear item by item.",
    "shop.kit2.alt": "Kit for 2 people in the mountains",
    "shop.kit2.p1": "1 day — 75&nbsp;₾",
    "shop.kit2.p24": "2–4 days — 65&nbsp;₾/day",
    "shop.kit2.p5": "5+ days — 55&nbsp;₾/day",
    "shop.kit4.title": "Family kit (4 people)",
    "shop.kit4.compose": "Tent, 4 sleeping bags, 4 mats",
    "shop.kit4.desc":
      "For a family or a small group. Includes a spacious tent and sleeping spots for four — more convenient and better value than renting everything separately.",
    "shop.kit4.alt": "Family camping kit by the river",
    "shop.kit4.p1": "1 day — 115&nbsp;₾",
    "shop.kit4.p24": "2–4 days — 100&nbsp;₾/day",
    "shop.kit4.p5": "5+ days — 90&nbsp;₾/day",
    "shop.book": "Book",

    "shop.items.title": "À la carte",
    "shop.tent2.from": "from 25&nbsp;₾ / day",
    "shop.tent2.p1": "1 day — 35&nbsp;₾",
    "shop.tent2.p24": "2–4 days — 30&nbsp;₾/day",
    "shop.tent2.p5": "5+ days — 25&nbsp;₾/day",
    "shop.tent4.from": "from 45&nbsp;₾ / day",
    "shop.tent4.p1": "1 day — 55&nbsp;₾",
    "shop.tent4.p24": "2–4 days — 50&nbsp;₾/day",
    "shop.tent4.p5": "5+ days — 45&nbsp;₾/day",
    "shop.bag.from": "from 10&nbsp;₾ / day",
    "shop.bag.p1": "1 day — 15&nbsp;₾",
    "shop.bag.p24": "2–4 days — 13&nbsp;₾/day",
    "shop.bag.p5": "5+ days — 10&nbsp;₾/day",
    "shop.mat.from": "from 10&nbsp;₾ / day",
    "shop.mat.p1": "1 day — 15&nbsp;₾",
    "shop.mat.p24": "2–4 days — 13&nbsp;₾/day",
    "shop.mat.p5": "5+ days — 10&nbsp;₾/day",
    "shop.chair.from": "from 6&nbsp;₾ / day",
    "shop.chair.p1": "1 day — 10&nbsp;₾",
    "shop.chair.p24": "2–4 days — 8&nbsp;₾/day",
    "shop.chair.p5": "5+ days — 6&nbsp;₾/day",
    "shop.onRequest": "on request",

    "shop.tent2.name": "2-person Quechua tent",
    "shop.tent2.desc":
      "Lightweight Quechua MH100 Fresh & Black for two — for Kazbegi, Svaneti and short trips. We'll show you how to pitch it quickly if it's your first time.",
    "shop.tent2.specs": "Weight 3.8 kg · packed 58 × 18 × 18 cm",
    "shop.tent4.name": "4-person Quechua tent",
    "shop.tent4.desc":
      "Spacious Quechua MH100 XXL with a tall vestibule — you can stand up and leave backpacks inside. For a family or group of up to four.",
    "shop.tent4.specs": "Weight 8.8 kg · packed 70 × 30 × 28 cm",
    "shop.bag.name": "Comfort 10°C sleeping bag",
    "shop.bag.desc":
      "Rectangular Comfort 10°C sleeping bag — more room than a mummy. Soft, good for warm nights in the mountains and by the sea. Every bag comes with a clean individual liner — for hygiene and your comfort.",
    "shop.bag.specs": "Bag 2.2 kg (43 × 30 × 30 cm) · liner 0.32 kg",
    "shop.mat.name": "Comfort mat 200×70×8 cm",
    "shop.mat.desc":
      "Thick self-inflating Comfort mat 200 × 70 × 8 cm — soft sleep and insulation from the ground. More comfortable than a thin foam pad on rocky sites.",
    "shop.mat.specs": "Weight 3.2 kg · rolled 70 × 25 cm",
    "shop.chair.name": "Folding chair",
    "shop.chair.desc":
      "Folding camping chair with armrests and a mesh cup holder. Carry strap included — handy by the tent and at a picnic.",
    "shop.chair.specs": "Weight 2.8 kg · packed 86 × 20 × 18 cm",
    "shop.burner.name": "Gas stove",
    "shop.burner.desc":
      "Compact stove with piezo ignition — no matches, fits in your palm. We'll match a 230 g canister to your route separately.",
    "shop.burner.specs": "Stove 0.18 kg · canister (full) 0.38 kg",

    "shop.request.title": "On request",
    "shop.request1": "Folding table for 4 — 4.8 kg (60 × 60 × 7 cm)",
    "shop.request2": "Camping lantern — 0.25 kg",
    "shop.request3": "Foam sit pad — 0.04 kg (40 × 30 × 2 cm)",
    "shop.request4": "Gas canister 230 g — 0.38 kg (full)",
    "shop.request5": "Cookware and other camping gear",

    "shop.form.title": "Book",
    "shop.form.lead":
      "Choose a kit or individual items, set the dates — the request goes to Telegram, and we'll confirm availability.",
    "shop.form.kitLegend": "1. Ready kit",
    "shop.form.kitHint": "Tent + sleeping bags + mats already included",
    "shop.form.or": "or",
    "shop.form.diyLegend": "Build your own",
    "shop.form.diyHint": "E.g. if there are three of you — pick a tent, bags and mats for your group size",
    "shop.form.diy": "Build your own",
    "shop.form.addons": "2. Extra options",
    "shop.form.addonsHint": "After a kit or custom build — chair, stove, table and more",
    "shop.form.qty": "Quantity",
    "shop.form.start": "Start date",
    "shop.form.end": "End date",
    "shop.form.people": "Number of people",
    "shop.form.destination": "Where you're going",
    "shop.form.destinationPh": "Kazbegi, Svaneti…",
    "shop.form.name": "Name",
    "shop.form.phone": "Phone",
    "shop.form.comment": "Comment",
    "shop.form.commentPh": "Notes on tent size, pickup time…",
    "shop.form.submit": "Send request to Telegram",
    "shop.form.bagShort": "Comfort sleeping bag",
    "shop.form.matShort": "Comfort mat 8 cm",
    "shop.form.table": "Folding table",
    "shop.form.lantern": "Camping lantern",
    "shop.form.sitpad": "Foam sit pad",

    "shop.why.title": "Why people choose us",
    "shop.why1": "Modern Decathlon Quechua gear",
    "shop.why2": "Everything clean, checked and ready for the trip",
    "shop.why3": "Gear is treated after every client",
    "shop.why4": "We'll help pick a kit for your route and group size",
    "shop.why5": "We'll show you how to pitch a tent quickly",
    "shop.why6": "Suitable even if it's your first time with a tent",

    "shop.footer": "Tbilisi • Rental & tours",
    "shop.footer.tours": "Tours",

    "order.back": "← Shop",
    "order.title": "Your order",
    "order.label": "Order ",
    "order.status": "Status: ",
    "order.period": "Period: ",
    "order.contact": "Contact: ",
    "order.items": "Items",
    "order.total": "Total: ",
    "order.payment": "Payment",
    "order.telegram": "Message on Telegram",
    "order.footer.shop": "Shop",

    "js.estimateDates": "Select dates — we'll show a price estimate",
    "js.estimateEndBefore": "End date must be on or after the start date",
    "js.estimatePickItems": "Select a tent, sleeping bags or mats",
    "js.estimateCustom": "Estimate: {total} ₾ for {days} days ({items})",
    "js.estimateKit": "Estimate: {total} ₾ for {days} days — {kit}",
    "js.kit2": "Kit for 2 people",
    "js.kit4": "Family kit (4 people)",
    "js.errDates": "Please check the rental dates.",
    "js.errItems": "Select at least one item.",
    "js.msgHello": "Hello! Rental request.\n\n",
    "js.msgWhat": "What: ",
    "js.msgDates": "Dates: ",
    "js.msgDays": " days)",
    "js.msgPeople": "People: ",
    "js.msgWhere": "Where: ",
    "js.msgEstimate": "Estimate: ",
    "js.msgName": "Name: ",
    "js.msgPhone": "Phone: ",
    "js.msgComment": "Comment: ",
    "js.msgClarify": "to confirm",
    "js.status.pending": "Awaiting payment",
    "js.status.confirmed": "Confirmed",
    "js.status.cancelled": "Cancelled",
    "js.status.completed": "Completed",
    "js.loadError": "Loading error",
    "js.noToken": "Order number is missing.",
    "js.days": " days)",

    "lang.label": "Language",
  };

  var ruJs = {
    "js.estimateDates": "Выберите даты — покажем ориентир по цене",
    "js.estimateEndBefore": "Дата окончания должна быть не раньше даты начала",
    "js.estimatePickItems": "Отметьте палатку, спальники или коврики",
    "js.estimateCustom": "Ориентир: {total} ₾ за {days} дн. ({items})",
    "js.estimateKit": "Ориентир: {total} ₾ за {days} дн. — {kit}",
    "js.kit2": "Комплект для 2 человек",
    "js.kit4": "Семейный комплект (4 человека)",
    "js.errDates": "Проверьте даты аренды.",
    "js.errItems": "Выберите хотя бы одну позицию.",
    "js.msgHello": "Здравствуйте! Заявка на прокат.\n\n",
    "js.msgWhat": "Что: ",
    "js.msgDates": "Даты: ",
    "js.msgDays": " дн.)",
    "js.msgPeople": "Людей: ",
    "js.msgWhere": "Куда: ",
    "js.msgEstimate": "Ориентир: ",
    "js.msgName": "Имя: ",
    "js.msgPhone": "Телефон: ",
    "js.msgComment": "Комментарий: ",
    "js.msgClarify": "уточним",
    "js.status.pending": "Ожидает оплаты",
    "js.status.confirmed": "Подтверждён",
    "js.status.cancelled": "Отменён",
    "js.status.completed": "Завершён",
    "js.loadError": "Ошибка загрузки",
    "js.noToken": "Не указан номер заказа.",
    "js.days": " дн.)",
  };

  var itemNamesEn = {
    "Палатка 2-местная Quechua": "2-person Quechua tent",
    "Палатка 4-местная Quechua": "4-person Quechua tent",
    "Спальник Comfort": "Comfort sleeping bag",
    "Коврик Comfort 8 см": "Comfort mat 8 cm",
    "Кресло складное": "Folding chair",
    "Газовая горелка": "Gas stove",
    "Стол складной": "Folding table",
    "Фонарь": "Camping lantern",
    "Пенка-сидушка": "Foam sit pad",
  };

  function detectLocale() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ru") return saved;
    } catch (e) {}
    var nav = (navigator.language || "").toLowerCase();
    if (nav.indexOf("en") === 0) return "en";
    return "ru";
  }

  function t(key, vars) {
    var locale = I18N.locale;
    var text;
    if (locale === "en") {
      text = en[key];
    } else if (key.indexOf("js.") === 0) {
      text = ruJs[key];
    }
    if (text == null) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return text;
  }

  function itemLabel(ruName) {
    if (I18N.locale !== "en") return ruName;
    return itemNamesEn[ruName] || ruName;
  }

  function applyText(el, value, html) {
    if (html) el.innerHTML = value;
    else el.textContent = value;
  }

  function apply() {
    var locale = I18N.locale;
    document.documentElement.lang = locale;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var html = el.hasAttribute("data-i18n-html");
      if (el.dataset.i18nDefault == null) {
        el.dataset.i18nDefault = html ? el.innerHTML : el.textContent;
      }
      if (locale === "en") {
        var val = en[key];
        if (val != null) applyText(el, val, html);
      } else {
        applyText(el, el.dataset.i18nDefault, html);
      }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (el.dataset.i18nDefaultAlt == null) {
        el.dataset.i18nDefaultAlt = el.getAttribute("alt") || "";
      }
      if (locale === "en" && en[key] != null) el.setAttribute("alt", en[key]);
      else el.setAttribute("alt", el.dataset.i18nDefaultAlt);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (el.dataset.i18nDefaultPlaceholder == null) {
        el.dataset.i18nDefaultPlaceholder = el.getAttribute("placeholder") || "";
      }
      if (locale === "en" && en[key] != null) el.setAttribute("placeholder", en[key]);
      else el.setAttribute("placeholder", el.dataset.i18nDefaultPlaceholder);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (el.dataset.i18nDefaultAria == null) {
        el.dataset.i18nDefaultAria = el.getAttribute("aria-label") || "";
      }
      if (locale === "en" && en[key] != null) el.setAttribute("aria-label", en[key]);
      else el.setAttribute("aria-label", el.dataset.i18nDefaultAria);
    });

    document.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-content");
      if (el.dataset.i18nDefaultContent == null) {
        el.dataset.i18nDefaultContent = el.getAttribute("content") || "";
      }
      if (locale === "en" && en[key] != null) el.setAttribute("content", en[key]);
      else el.setAttribute("content", el.dataset.i18nDefaultContent);
    });

    var titleEl = document.querySelector("title[data-i18n-title]");
    if (titleEl) {
      var tKey = titleEl.getAttribute("data-i18n-title");
      if (titleEl.dataset.i18nDefaultTitle == null) {
        titleEl.dataset.i18nDefaultTitle = titleEl.textContent;
      }
      if (locale === "en" && en[tKey] != null) titleEl.textContent = en[tKey];
      else titleEl.textContent = titleEl.dataset.i18nDefaultTitle;
    }

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === locale;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    document.dispatchEvent(new CustomEvent("localechange", { detail: { locale: locale } }));
  }

  function setLocale(locale) {
    if (locale !== "en" && locale !== "ru") return;
    I18N.locale = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (e) {}
    apply();
  }

  function mountSwitchers() {
    document.querySelectorAll(".lang-switch").forEach(function (root) {
      root.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          setLocale(btn.getAttribute("data-lang"));
        });
      });
    });
  }

  var I18N = {
    locale: detectLocale(),
    t: t,
    itemLabel: itemLabel,
    setLocale: setLocale,
    apply: apply,
    init: function () {
      mountSwitchers();
      apply();
    },
  };

  window.I18N = I18N;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      I18N.init();
    });
  } else {
    I18N.init();
  }
})();
