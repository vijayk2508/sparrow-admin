import type { ClassSession, Coach, TrainingProgram, MembershipPlan, Testimonial, GymEvent, HeroStat, GalleryItem, WhyChooseUsItem } from "../types";

export const GYM_INFO = {
  name: "Sparrow Training Club",
  tagline: "Boxing & Training Club",
  subtext: "Train hard. Fight smart. Become unstoppable.",
  address: "Near Mathura Wedding Point, Devi Mandir, Kotdwara, Uttarakhand, India 246149",
  phone: "+917668318457",
  email: "sparrowclubkotdwar@gmail.com",
  establishedYear: "2018",
  socials: {
    instagram: "https://www.instagram.com/sparrowclub_kotdwar/",
    facebook: "https://www.facebook.com/people/Sparrow-Training-Club/61592879485548/",
  },
  hours: {
    weekdays: "6:00 AM – 9:00 PM",
    saturday: "8:00 AM – 6:00 PM",
    sunday: "9:00 AM – 3:00 PM",
  }
};

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: "prog-boxing-fund",
    title: "BOXING FUNDAMENTALS",
    category: "Boxing",
    level: "BEGINNER",
    duration: "12 Weeks",
    price: 7999,
    period: "/month",
    description: "Master the foundations of boxing — stance, footwork, combination punching, defense, and heavy bag drills.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800",
    features: [
      "3 group classes per week",
      "Basic technique coaching",
      "Shadowboxing & heavy bag work",
      "Jump rope & conditioning",
      "Gloves & hand wraps provided",
      "Beginner sparring intro"
    ]
  },
  {
    id: "prog-hyrox-challenge",
    title: "HYROX RACE PREP & FITNESS",
    category: "Hyrox",
    level: "INTERMEDIATE",
    badge: "MOST POPULAR",
    popular: true,
    duration: "Ongoing",
    price: 12999,
    period: "/month",
    description: "Official Hyrox simulation training combining functional endurance, SkiErg, Sled Push, Wall Balls, and running.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
    features: [
      "Dedicated Hyrox race simulation floor",
      "Sled push/pull, SkiErg & Rowers",
      "Station pacing & VO2 max building",
      "Weekly timed benchmark tests",
      "Hydration & race strategy guidance",
      "Official Hyrox partner gym entry"
    ]
  },
  {
    id: "prog-fighter-pro",
    title: "FIGHTER PROGRAM",
    category: "Boxing",
    level: "ADVANCED",
    badge: "ELITE",
    duration: "Ongoing",
    price: 14999,
    period: "/month",
    description: "Competition-focused training for dedicated athletes looking to step into the ring and compete.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800",
    features: [
      "Unlimited group sessions",
      "Weekly sparring rounds",
      "Fight strategy coaching",
      "Strength & conditioning",
      "Nutrition consultation",
      "Amateur fight placement"
    ]
  },
  {
    id: "prog-strength-cond",
    title: "STRENGTH & POWER ATHLETICS",
    category: "Strength",
    level: "ALL LEVELS",
    duration: "Ongoing",
    price: 10999,
    period: "/month",
    description: "Build explosive kinetic power, core stability, and muscular endurance designed specifically for combat & endurance athletes.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    features: [
      "Barbell compound lifts & Olympic movements",
      "Kettlebell & plyometric power circuits",
      "Injury prevention & mobility mobility work",
      "Body composition tracking",
      "Custom weight progression logs"
    ]
  },
  {
    id: "prog-cardio-burn",
    title: "HIIT CARDIO BURN",
    category: "Cardio",
    level: "ALL LEVELS",
    duration: "Ongoing",
    price: 7999,
    period: "/month",
    description: "High-intensity metabolic conditioning fusing heavy bag strikes, speed rope, and sprint intervals to scorch 800+ calories.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    features: [
      "Heart-rate targeted interval zones",
      "Heavy bag rhythm work",
      "Agility ladder & battle ropes",
      "Core isolation workouts",
      "Motivational rhythm playlists"
    ]
  },
  {
    id: "prog-fight-camp",
    title: "INTENSIVE FIGHT CAMP",
    category: "Boxing",
    level: "ELITE",
    duration: "8-Week Camp",
    price: 34999,
    period: "/camp",
    description: "Full-time immersive fight-camp preparation. Professional coaching, personal fight analysis, and custom sparring partners.",
    image: "https://images.unsplash.com/photo-1509563839001-b5420716ab35?auto=format&fit=crop&q=80&w=800",
    features: [
      "2x daily training sessions",
      "Personal head coach assigned",
      "Dedicated sparring partners",
      "Video analysis & review",
      "Full nutrition program",
      "Corner team for fights"
    ]
  }
];

export const COACHES: Coach[] = [
  {
    id: "coach-1",
    name: "MARCUS 'THE BULL' RIVERA",
    role: "HEAD BOXING COACH",
    recordBadge: "22-1 (18 KOs)",
    bio: "Former WBC Continental Americas Champion. 18 years coaching amateur and professional fighters to national titles.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800",
    specialties: ["Offensive Combinations", "Ring IQ", "Fight Strategy"],
    socials: { instagram: "#", twitter: "#", youtube: "#" }
  },
  {
    id: "coach-2",
    name: "DIANA 'THE DUCHESS' CHEN",
    role: "WOMEN'S BOXING & HYROX HEAD",
    recordBadge: "3× Golden Gloves",
    bio: "3× National Golden Gloves Champion & Elite Hyrox Pro Finisher. Specialist in tactical defense and athletic power development.",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800",
    specialties: ["Defense & Counters", "Footwork", "Hyrox Pacing"],
    socials: { instagram: "#", twitter: "#" }
  },
  {
    id: "coach-3",
    name: "TYSON 'IRON HANDS' BROOKS",
    role: "STRENGTH & CONDITIONING HEAD",
    recordBadge: "Former Pro Athlete",
    bio: "Combat sports S&C specialist. Developed elite conditioning programs for 12 title contenders and Hyrox World finalists.",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=800",
    specialties: ["Power Development", "Energy Systems", "Injury Prevention"],
    socials: { instagram: "#", youtube: "#" }
  },
  {
    id: "coach-4",
    name: "RAFAEL 'EL MAESTRO' VEGA",
    role: "TECHNICAL BOXING COACH",
    recordBadge: "41-0 (27 KOs)",
    bio: "International amateur boxing coach with Olympic-level experience in Cuba and Mexico. Unmatched mittwork mastery.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    specialties: ["Cuban Style Boxing", "Jab Mastery", "Amateur Competition"],
    socials: { instagram: "#", twitter: "#" }
  }
];

export const SCHEDULE_CLASSES: ClassSession[] = [
  // Monday
  {
    id: "sched-1",
    title: "Boxing Fundamentals",
    serviceType: "Boxing",
    coachName: "Rivera",
    day: "MON",
    time: "6:00 AM",
    duration: "60 min",
    level: "Beginner",
    colorTag: "bg-emerald-950 text-emerald-400 border-emerald-700",
    description: "Stance, jab-cross technique, and light bag work for morning starters.",
    capacity: 20,
    spotsLeft: 4,
    price: 25
  },
  {
    id: "sched-2",
    title: "Women's Boxing",
    serviceType: "Boxing",
    coachName: "Chen",
    day: "MON",
    time: "9:00 AM",
    duration: "60 min",
    level: "Intermediate",
    colorTag: "bg-purple-950 text-purple-400 border-purple-700",
    description: "Empowering technical session focused on combination punching & speed.",
    capacity: 18,
    spotsLeft: 2,
    price: 25
  },
  {
    id: "sched-3",
    title: "Lunchtime Boxing",
    serviceType: "Boxing",
    coachName: "Vega",
    day: "MON",
    time: "12:00 PM",
    duration: "45 min",
    level: "All Levels",
    colorTag: "bg-blue-950 text-blue-400 border-blue-700",
    description: "Express midday workout to release stress and sharpen combinations.",
    capacity: 25,
    spotsLeft: 7,
    price: 20
  },
  {
    id: "sched-4",
    title: "Advanced Boxing",
    serviceType: "Boxing",
    coachName: "Rivera",
    day: "MON",
    time: "5:30 PM",
    duration: "75 min",
    level: "Advanced",
    colorTag: "bg-rose-950 text-rose-400 border-rose-700",
    description: "High-level counter-punching, ring generalship, and tactical drills.",
    capacity: 15,
    spotsLeft: 3,
    price: 30
  },
  {
    id: "sched-5",
    title: "Hyrox Race Conditioning",
    serviceType: "Hyrox",
    coachName: "Brooks",
    day: "MON",
    time: "7:00 PM",
    duration: "60 min",
    level: "Intermediate",
    colorTag: "bg-amber-950 text-amber-400 border-amber-700",
    description: "Sled push, SkiErg, and lunges circuit simulation for Hyrox racers.",
    capacity: 16,
    spotsLeft: 5,
    price: 30
  },

  // Tuesday
  {
    id: "sched-6",
    title: "Hyrox Fitness & Sleds",
    serviceType: "Hyrox",
    coachName: "Chen",
    day: "TUE",
    time: "6:00 AM",
    duration: "60 min",
    level: "All Levels",
    colorTag: "bg-amber-950 text-amber-400 border-amber-700",
    description: "Full-body functional power, SkiErg intervals, and heavy sled pushes.",
    capacity: 18,
    spotsLeft: 6,
    price: 30
  },
  {
    id: "sched-7",
    title: "Strength & Conditioning",
    serviceType: "Strength",
    coachName: "Brooks",
    day: "TUE",
    time: "9:00 AM",
    duration: "60 min",
    level: "Intermediate",
    colorTag: "bg-cyan-950 text-cyan-400 border-cyan-700",
    description: "Compound lifts, kettlebell power, and core stability for combat power.",
    capacity: 15,
    spotsLeft: 3,
    price: 25
  },
  {
    id: "sched-8",
    title: "Sparring Class",
    serviceType: "Boxing",
    coachName: "Rivera",
    day: "TUE",
    time: "5:30 PM",
    duration: "90 min",
    level: "Advanced",
    colorTag: "bg-rose-950 text-rose-400 border-rose-700",
    description: "Supervised technical sparring with full mouthguard and 16oz gloves.",
    capacity: 12,
    spotsLeft: 2,
    price: 35
  },
  {
    id: "sched-9",
    title: "HIIT Cardio Burn",
    serviceType: "Cardio",
    coachName: "Chen",
    day: "TUE",
    time: "7:00 PM",
    duration: "50 min",
    level: "Beginner",
    colorTag: "bg-orange-950 text-orange-400 border-orange-700",
    description: "Non-stop heavy bag intervals and jump rope calorie torching.",
    capacity: 22,
    spotsLeft: 8,
    price: 20
  },

  // Wednesday
  {
    id: "sched-10",
    title: "Boxing Fundamentals",
    serviceType: "Boxing",
    coachName: "Rivera",
    day: "WED",
    time: "6:00 AM",
    duration: "60 min",
    level: "Beginner",
    colorTag: "bg-emerald-950 text-emerald-400 border-emerald-700",
    description: "Slip drills, counter jabs, and heavy bag rhythm work.",
    capacity: 20,
    spotsLeft: 5,
    price: 25
  },
  {
    id: "sched-11",
    title: "Hyrox Station Masterclass",
    serviceType: "Hyrox",
    coachName: "Brooks",
    day: "WED",
    time: "12:00 PM",
    duration: "60 min",
    level: "All Levels",
    colorTag: "bg-amber-950 text-amber-400 border-amber-700",
    description: "Technical mastery on Wall Balls, Burpee Broad Jumps, and Farmers Carry.",
    capacity: 16,
    spotsLeft: 4,
    price: 30
  },
  {
    id: "sched-12",
    title: "Advanced Boxing",
    serviceType: "Boxing",
    coachName: "Vega",
    day: "WED",
    time: "5:30 PM",
    duration: "75 min",
    level: "Advanced",
    colorTag: "bg-rose-950 text-rose-400 border-rose-700",
    description: "Cuban shoulder roll, defense counters, and high speed mitts.",
    capacity: 14,
    spotsLeft: 1,
    price: 30
  },

  // Thursday
  {
    id: "sched-13",
    title: "Strength & Power Lifts",
    serviceType: "Strength",
    coachName: "Brooks",
    day: "THU",
    time: "6:00 AM",
    duration: "60 min",
    level: "Intermediate",
    colorTag: "bg-cyan-950 text-cyan-400 border-cyan-700",
    description: "Trap bar deadlifts, overhead presses, and kinetic kinetic chain work.",
    capacity: 15,
    spotsLeft: 4,
    price: 25
  },
  {
    id: "sched-14",
    title: "Cuban Style Boxing",
    serviceType: "Boxing",
    coachName: "Vega",
    day: "THU",
    time: "7:00 PM",
    duration: "60 min",
    level: "Intermediate",
    colorTag: "bg-purple-950 text-purple-400 border-purple-700",
    description: "Rhythmic angles, lateral pivot footwork, and counter boxing.",
    capacity: 18,
    spotsLeft: 3,
    price: 28
  },

  // Friday
  {
    id: "sched-15",
    title: "Fight Club Sparring",
    serviceType: "Boxing",
    coachName: "Rivera",
    day: "FRI",
    time: "5:30 PM",
    duration: "90 min",
    level: "Advanced",
    colorTag: "bg-rose-950 text-rose-400 border-rose-700",
    description: "Full ring controlled sparring session with coaches cornering.",
    capacity: 12,
    spotsLeft: 2,
    price: 35
  },

  // Saturday & Sunday
  {
    id: "sched-16",
    title: "Saturday Open Sparring & Ring",
    serviceType: "Boxing",
    coachName: "Rivera",
    day: "SAT",
    time: "10:00 AM",
    duration: "120 min",
    level: "Advanced",
    colorTag: "bg-rose-950 text-rose-400 border-rose-700",
    description: "Open ring sparring, timer rounds, and heavy bag conditioning.",
    capacity: 25,
    spotsLeft: 8,
    price: 30
  },
  {
    id: "sched-17",
    title: "Hyrox Weekend Race Simulation",
    serviceType: "Hyrox",
    coachName: "Chen",
    day: "SUN",
    time: "10:00 AM",
    duration: "90 min",
    level: "All Levels",
    colorTag: "bg-amber-950 text-amber-400 border-amber-700",
    description: "Full 8-station Hyrox course walkthrough with live timing.",
    capacity: 20,
    spotsLeft: 5,
    price: 35
  }
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "plan-monthly",
    name: "Monthly",
    tagline: "Perfect for newcomers and flexible training",
    price: 6999,
    currency: "₹",
    period: "/month",
    features: [
      "3 group classes per week",
      "Basic equipment access",
      "Locker room & shower access",
      "Online class booking system",
      "Cancel anytime, no contract"
    ]
  },
  {
    id: "plan-two-month",
    name: "Two Months",
    tagline: "For the dedicated fighter and fitness athlete",
    price: 12999,
    currency: "₹",
    period: "/2 months",
    badge: "BEST VALUE",
    popular: true,
    features: [
      "Unlimited group classes (Boxing, Hyrox, Strength)",
      "Full gym & open heavy bag floor access",
      "Sparring privileges (3x/week)",
      "Monthly nutrition consultation",
      "2 Personal training sessions per month",
      "Competition prep support",
      "Guest pass (2x/month)"
    ]
  },
  {
    id: "plan-three-month",
    name: "Three Months",
    tagline: "The professional fight & athletic experience",
    price: 17999,
    currency: "₹",
    period: "/3 months",
    features: [
      "Unlimited everything (Classes + Sparring + Hyrox)",
      "Daily sparring & ring access",
      "4 Personal training sessions per month",
      "Full customized nutrition program",
      "Video fight analysis sessions",
      "Fight camp access",
      "VIP events & fight night seminars"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "CARLOS MENDEZ, 28",
    age: 28,
    memberDuration: "Member for 8 months",
    quote: "Sparrow Fitness changed my life. I came in overweight with zero fight experience. 8 months later I won my first amateur bout. They train your mind as much as your body.",
    resultBadge: "AMATEUR CHAMPION",
    resultText: "Lost 42 lbs. Won first amateur bout.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    rating: 5
  },
  {
    id: "test-2",
    name: "SARAH KIM, 34",
    age: 34,
    memberDuration: "Member for 2 years",
    quote: "Coach Chen and Coach Brooks are world class. The Hyrox and Boxing combination here is unmatched. I qualified for nationals twice because of Sparrow Fitness.",
    resultBadge: "NATIONAL QUALIFIER",
    resultText: "3× City champion. Hyrox Top 10.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    rating: 5
  },
  {
    id: "test-3",
    name: "DEVON PRICE, 22",
    age: 22,
    memberDuration: "Member for 18 months",
    quote: "I came in as a total beginner. Rivera saw something in me and built me from the ground up. I just signed my first pro contract at 22. None of that happens without Sparrow.",
    resultBadge: "PRO SIGNED",
    resultText: "Signed pro contract after 18 months.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300",
    rating: 5
  },
  {
    id: "test-4",
    name: "MARIA SANTOS, 41",
    age: 41,
    memberDuration: "Member for 6 months",
    quote: "I never thought boxing and functional strength would be for me at 41. The community here is demanding but incredibly welcoming. Best shape of my life!",
    resultBadge: "TRANSFORMATION",
    resultText: "Lost 28 lbs. Best shape of my life.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    rating: 5
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "g-1", order: 1, category: "Training", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800", title: "Heavy Bag Drills" },
  { id: "g-2", order: 2, category: "Sparring", image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800", title: "Technical Ring Sparring" },
  { id: "g-3", order: 3, category: "Hyrox", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800", title: "Hyrox Sled Push Station" },
  { id: "g-4", order: 4, category: "Competition", image: "https://images.unsplash.com/photo-1509563839001-b5420716ab35?auto=format&fit=crop&q=80&w=800", title: "Brooklyn Fight Night VII" },
  { id: "g-5", order: 5, category: "Coaches", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800", title: "Coach Mittwork Session" },
  { id: "g-6", order: 6, category: "Gym", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", title: "Full Size Competition Ring" }
];

export const HERO_STATS: HeroStat[] = [
  { id: "stat-members", label: "ACTIVE MEMBERS", value: 500, suffix: "+" },
  { id: "stat-coaches", label: "ELITE COACHES", value: 12 },
  { id: "stat-titles", label: "CHAMPIONSHIPS", value: 47 },
  { id: "stat-exp", label: "EXPERIENCE", value: 15, prefix: "", suffix: "yrs" }
];

export const WHY_CHOOSE_US_FEATURES: WhyChooseUsItem[] = [
  {
    id: "why-1",
    num: "01",
    icon: "Award",
    title: "CERTIFIED COACHES",
    desc: "All trainers hold USA Boxing, NSCA, and Hyrox Certified credentials with authentic championship combat experience."
  },
  {
    id: "why-2",
    num: "02",
    icon: "ShieldAlert",
    title: "COMPETITION TRAINING",
    desc: "Structured fight camps, supervised sparring rounds, and official Hyrox race prep for amateur and pro athletes."
  },
  {
    id: "why-3",
    num: "03",
    icon: "Zap",
    title: "STRENGTH & CONDITIONING",
    desc: "Fight & endurance specific S&C programming to maximize kinetic explosive power, VO2 max, and resilience."
  },
  {
    id: "why-4",
    num: "04",
    icon: "Apple",
    title: "NUTRITION GUIDANCE",
    desc: "Customized weight management protocols, fight-week cuts, hydration pacing, and performance fueling."
  },
  {
    id: "why-5",
    num: "05",
    icon: "UserCheck",
    title: "PERSONAL COACHING",
    desc: "Dedicated 1-on-1 mittwork, camera technical analysis, footwork refinement, and tailored fight plans."
  },
  {
    id: "why-6",
    num: "06",
    icon: "Dumbbell",
    title: "MODERN EQUIPMENT",
    desc: "Full-size competition ring, 30+ heavy bags, double-end bags, Hyrox SkiErg, Sleds, and full weight floor."
  }
];

export const UPCOMING_EVENTS: GymEvent[] = [
  {
    id: "evt-1",
    type: "FIGHT NIGHT",
    title: "SPARROW FIGHT NIGHT VII",
    dateMonth: "JUL",
    dateDay: "12",
    time: "7:00 PM",
    price: 2999,
    priceLabel: "₹2,999 / ticket",
    location: "Sparrow Fitness Arena, Kotdwara",
    description: "12 bouts. Our best fighters take the stage in what promises to be the most electric fight night in Sparrow history.",
    capacityText: "Limited to 200 spectators",
    image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "evt-2",
    type: "WORKSHOP",
    title: "BOXING TECHNIQUE & HYROX MASTERCLASS",
    dateMonth: "JUL",
    dateDay: "26",
    time: "10:00 AM",
    price: 4999,
    priceLabel: "₹4,999 / person",
    location: "Sparrow Training Club Main Floor",
    description: "3-hour intensive with Head Coach Rivera & Coach Chen. Counter-punching, defense, and Hyrox race pacing.",
    capacityText: "Max 25 participants",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "evt-3",
    type: "TOURNAMENT",
    title: "KOTDWARA GOLDEN GLOVES QUALIFIER",
    dateMonth: "AUG",
    dateDay: "09",
    time: "2:00 PM",
    price: 0,
    priceLabel: "Free for spectators",
    location: "Sparrow Training Club, Kotdwara",
    description: "Official Golden Gloves qualifier. Sparrow athletes compete for spots in the city-wide tournament.",
    capacityText: "Open registration",
    image: "https://images.unsplash.com/photo-1509563839001-b5420716ab35?auto=format&fit=crop&q=80&w=800"
  }
];
