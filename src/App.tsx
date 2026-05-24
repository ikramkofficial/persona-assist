import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Anchor,
  Bell,
  Briefcase,
  CalendarClock,
  Car,
  CheckCircle,
  ChefHat,
  ChevronRight,
  Crown,
  CreditCard,
  Diamond,
  Eye,
  EyeOff,
  Gem,
  Globe,
  Landmark,
  LayoutGrid,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Navigation,
  Plane,
  PlaneTakeoff,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  User,
  Utensils,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PLAN_PRICE = 72999;
const INITIAL_BALANCE = 500000;
const ULTRA_PRICE = 150000;

const VALID_ULTRA_KEYS = [
  "ULTRA-9XF2-K7M1",
  "ULTRA-P4V8-J3C9",
  "ULTRA-L6W1-N8Q5",
  "ULTRA-B2R7-T9Y4",
  "ULTRA-C5M3-H1X6",
];

type UserProfile = {
  name: string;
  email: string;
};

type RegisteredUser = {
  name: string;
  email: string;
  pin: string;
  isUltraSubscribed?: boolean;
};

type PrestigeCard = {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
};

type ActivityItem = {
  id: number;
  title: string;
  type: "system" | "transaction" | "booking" | "refund";
  amount: number | null;
  date: string;
  icon: LucideIcon;
  category: string;
  ref: string;
  status?: "active" | "cancelled" | "refunded" | "system";
  refundable?: boolean;
};

type ChatMessage = {
  id: number;
  text?: string;
  sender: "user" | "bot";
  type: "text" | "flight_card" | "dining_card" | "hotel_card" | "support_card";
};

type FormData = {
  name: string;
  email: string;
  pin: string;
};

type FlightLocation = {
  code: string;
  city: string;
  country: string;
};

type NotificationType = "success" | "warning" | "ultra" | "plan" | "ticket" | "dining" | "hotel" | "support" | "info";

type PrestigeNotification = {
  id: number;
  title: string;
  subtitle: string;
  type: NotificationType;
  time: string;
  actionLabel?: string;
  relatedActivityId?: number;
  amount?: number | null;
};

const FLIGHT_LOCATIONS: FlightLocation[] = [
  { code: "KHI", city: "Karachi", country: "Pakistan" },
  { code: "LHE", city: "Lahore", country: "Pakistan" },
  { code: "ISB", city: "Islamabad", country: "Pakistan" },
  { code: "PEW", city: "Peshawar", country: "Pakistan" },
  { code: "MUX", city: "Multan", country: "Pakistan" },
  { code: "JFK", city: "New York", country: "USA" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "LHR", city: "London", country: "United Kingdom" },
  { code: "MAN", city: "Manchester", country: "United Kingdom" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "AUH", city: "Abu Dhabi", country: "UAE" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "NCE", city: "Nice", country: "France" },
  { code: "FCO", city: "Rome", country: "Italy" },
  { code: "MXP", city: "Milan", country: "Italy" },
];

const CITIES = ["Karachi", "Lahore", "Islamabad", "Dubai", "London", "New York", "Paris", "Rome"];

const DINING_OPTIONS: Record<string, string[]> = {
  "Karachi": ["Kolachi", "Cafe Flo", "Okra", "Zouk"],
  "Lahore": ["Monal Lahore", "Café Aylanto", "Cuckoo's Den", "Andaaz"],
  "Islamabad": ["The Monal", "Tuscany Courtyard", "Mantra", "Kabul Restaurant"],
  "Dubai": ["Nusr-Et Steakhouse", "Pierchic", "Zuma", "At.mosphere"],
  "London": ["Gordon Ramsay", "Sketch", "The Ritz", "Dishoom"],
  "New York": ["Le Bernardin", "Per Se", "Eleven Madison Park", "Carbone"],
  "Paris": ["Le Jules Verne", "Alain Ducasse", "L'Ambroisie", "Septime"],
  "Rome": ["La Pergola", "Il Pagliaccio", "Roscioli", "Aroma"]
};

const HOTEL_OPTIONS: Record<string, string[]> = {
  "Karachi": ["Pearl Continental", "Mövenpick", "Marriott", "Avari Towers"],
  "Lahore": ["The Nishat", "Pearl Continental", "Avari", "Luxus Grand"],
  "Islamabad": ["Serena Hotel", "Marriott", "Ramada", "Centaurus Suites"],
  "Dubai": ["Burj Al Arab", "Atlantis The Palm", "Armani Hotel", "The Ritz-Carlton"],
  "London": ["The Savoy", "The Ritz", "Claridge's", "The Dorchester"],
  "New York": ["The Plaza", "The Ritz-Carlton", "St. Regis", "Four Seasons"],
  "Paris": ["Ritz Paris", "Four Seasons George V", "Hôtel de Crillon", "Le Meurice"],
  "Rome": ["Hotel Hassler", "Rome Cavalieri", "Hotel Eden", "The St. Regis"]
};

const PRIVILEGE_LOCATIONS = [
  "Karachi, Pakistan",
  "Lahore, Pakistan",
  "Islamabad, Pakistan",
  "Dubai, UAE",
  "London, UK",
  "New York, USA",
  "Paris, France",
  "Rome, Italy",
];

const PRIVILEGES_BY_CITY: Record<string, any[]> = {
  "Karachi, Pakistan": [
    { id: 1, title: "Clifton VIP Airport Transfer", distance: "15.5 km", icon: PlaneTakeoff, category: "Travel", ultraOnly: false },
    { id: 2, title: "Sea View Fine Dining", distance: "2.0 km", icon: ChefHat, category: "Dining", ultraOnly: false },
    { id: 3, title: "Luxury Chauffeur Ride", distance: "2.4 km", icon: Plane, category: "Transport", ultraOnly: false },
    { id: 4, title: "Personal Shopper Dolmen", distance: "3.1 km", icon: CreditCard, category: "Shopping", ultraOnly: false },
    { id: 5, title: "Home Support Team", distance: "3.8 km", icon: ShieldCheck, category: "Home", ultraOnly: false },
    { id: 6, title: "Private Retail Viewing", distance: "1.2 km", icon: Crown, category: "Retail", ultraOnly: true },
    { id: 7, title: "Helicopter Transfer", distance: "4.5 km", icon: PlaneTakeoff, category: "Travel", ultraOnly: true },
    { id: 8, title: "Private Security Escort", distance: "5.0 km", icon: Shield, category: "Security", ultraOnly: true },
  ],
  "Lahore, Pakistan": [
    { id: 101, title: "Premium Airport Transfer", distance: "12.0 km", icon: PlaneTakeoff, category: "Travel", ultraOnly: false },
    { id: 102, title: "MM Alam VIP Dining", distance: "3.5 km", icon: ChefHat, category: "Dining", ultraOnly: false },
    { id: 103, title: "Luxury Heritage Tour", distance: "5.4 km", icon: Eye, category: "Events", ultraOnly: false },
    { id: 104, title: "Personal Shopper Gulberg", distance: "2.1 km", icon: CreditCard, category: "Shopping", ultraOnly: false },
    { id: 105, title: "Security Escort (DHA)", distance: "1.8 km", icon: Shield, category: "Security", ultraOnly: true },
    { id: 106, title: "Polo Club Exclusive Pass", distance: "6.2 km", icon: Crown, category: "Events", ultraOnly: true },
  ],
  "Islamabad, Pakistan": [
    { id: 201, title: "Diplomatic Enclave Chauffeur", distance: "1.5 km", icon: Plane, category: "Travel", ultraOnly: false },
    { id: 202, title: "Monal Priority Booking", distance: "8.0 km", icon: ChefHat, category: "Dining", ultraOnly: false },
    { id: 203, title: "Centaurus Personal Shopper", distance: "2.5 km", icon: CreditCard, category: "Shopping", ultraOnly: false },
    { id: 204, title: "Serena Hotel Suite Upgrade", distance: "4.1 km", icon: Gem, category: "Hotel", ultraOnly: true },
    { id: 205, title: "Private VIP Security", distance: "3.0 km", icon: Shield, category: "Security", ultraOnly: true },
  ],
  "Dubai, UAE": [
    { id: 10, title: "Burj Khalifa VIP Lounge", distance: "1.2 km", icon: Crown, category: "Events", ultraOnly: true },
    { id: 11, title: "Desert Safari Private SUV", distance: "15.0 km", icon: MapPin, category: "Travel", ultraOnly: false },
    { id: 12, title: "Luxury Yacht Charter", distance: "5.0 km", icon: Plane, category: "Travel", ultraOnly: true },
    { id: 13, title: "7-Star Dining Booking", distance: "3.2 km", icon: ChefHat, category: "Dining", ultraOnly: false },
    { id: 14, title: "Gold Souk Escort", distance: "8.5 km", icon: Shield, category: "Security", ultraOnly: true },
  ],
  "London, UK": [
    { id: 20, title: "Heathrow VIP Fast Track", distance: "25.0 km", icon: PlaneTakeoff, category: "Travel", ultraOnly: false },
    { id: 21, title: "Michelin Star Mayfair", distance: "1.0 km", icon: ChefHat, category: "Dining", ultraOnly: false },
    { id: 22, title: "Private Security Escort", distance: "0.5 km", icon: Shield, category: "Security", ultraOnly: true },
    { id: 23, title: "West End Premium Seats", distance: "2.2 km", icon: CalendarClock, category: "Events", ultraOnly: false },
    { id: 24, title: "Harrods Private Shopper", distance: "3.5 km", icon: CreditCard, category: "Shopping", ultraOnly: true },
  ],
  "New York, USA": [
    { id: 30, title: "Broadway VIP Pass", distance: "0.8 km", icon: CalendarClock, category: "Events", ultraOnly: false },
    { id: 31, title: "Helicopter Transfer JFK", distance: "12.0 km", icon: PlaneTakeoff, category: "Travel", ultraOnly: true },
    { id: 32, title: "5th Ave Personal Shopper", distance: "1.5 km", icon: CreditCard, category: "Shopping", ultraOnly: false },
    { id: 33, title: "Exclusive Rooftop Dining", distance: "2.5 km", icon: ChefHat, category: "Dining", ultraOnly: false },
    { id: 34, title: "Private Art Gallery Tour", distance: "4.0 km", icon: Eye, category: "Events", ultraOnly: true },
  ],
  "Paris, France": [
    { id: 40, title: "Eiffel Tower Private Dining", distance: "2.1 km", icon: Utensils, category: "Dining", ultraOnly: true },
    { id: 41, title: "Louvre VIP After-Hours", distance: "1.5 km", icon: Eye, category: "Events", ultraOnly: true },
    { id: 42, title: "Fashion Week Access", distance: "3.0 km", icon: Sparkles, category: "Events", ultraOnly: true },
    { id: 43, title: "Seine Private Cruise", distance: "2.8 km", icon: Plane, category: "Travel", ultraOnly: false },
    { id: 44, title: "Champs-Élysées Shopper", distance: "1.2 km", icon: CreditCard, category: "Shopping", ultraOnly: false },
  ],
  "Rome, Italy": [
    { id: 50, title: "Colosseum Private Access", distance: "2.0 km", icon: ShieldCheck, category: "Events", ultraOnly: false },
    { id: 51, title: "Luxury Villa Stay", distance: "10.0 km", icon: Gem, category: "Hotel", ultraOnly: true },
    { id: 52, title: "Chauffeur Amalfi Coast", distance: "45.0 km", icon: Plane, category: "Travel", ultraOnly: true },
    { id: 53, title: "Vatican Secret Tour", distance: "3.5 km", icon: Eye, category: "Events", ultraOnly: true },
    { id: 54, title: "Authentic Piazza Dining", distance: "1.0 km", icon: Utensils, category: "Dining", ultraOnly: false },
  ],
};

function getNotificationIcon(type: NotificationType): LucideIcon {
  if (type === "warning") return AlertTriangle;
  if (type === "ultra") return Crown;
  if (type === "plan") return CreditCard;
  if (type === "ticket") return PlaneTakeoff;
  if (type === "dining") return ChefHat;
  if (type === "hotel") return Gem;
  if (type === "support") return CalendarClock;
  return CheckCircle;
}

function getNotificationTone(type: NotificationType) {
  if (type === "warning") return {
    icon: "bg-[#ffd98a]/15 text-[#ffd98a]",
    glow: "shadow-[0_0_32px_rgba(255,217,138,0.18)]",
    bar: "bg-[#ffd98a]",
    chip: "bg-[#ffd98a]/15 text-[#ffd98a] border-[#ffd98a]/20",
  };
  if (type === "ultra" || type === "plan") return {
    icon: "bg-[#ffd98a]/15 text-[#ffd98a]",
    glow: "shadow-[0_0_38px_rgba(255,217,138,0.22)]",
    bar: "bg-[#ffd98a]",
    chip: "bg-[#ffd98a]/15 text-[#ffd98a] border-[#ffd98a]/20",
  };
  if (type === "support") return {
    icon: "bg-sky-400/[0.15] text-sky-300",
    glow: "shadow-[0_0_34px_rgba(125,211,252,0.15)]",
    bar: "bg-sky-300",
    chip: "bg-sky-400/[0.12] text-sky-200 border-sky-300/20",
  };
  return {
    icon: "bg-emerald-400/[0.15] text-emerald-300",
    glow: "shadow-[0_0_34px_rgba(52,211,153,0.15)]",
    bar: "bg-emerald-300",
    chip: "bg-emerald-400/[0.12] text-emerald-200 border-emerald-300/20",
  };
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [walletBalance, setWalletBalance] = useState(INITIAL_BALANCE);
  const [pendingRefundIds, setPendingRefundIds] = useState<number[]>([]);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [prestigeCard, setPrestigeCard] = useState<PrestigeCard | null>(null);

  const [isUltra, setIsUltra] = useState(false);
  const [isUltraSubscribed, setIsUltraSubscribed] = useState(false);
  const [isDiscrete, setIsDiscrete] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [currentCity, setCurrentCity] = useState("Karachi, Pakistan");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newCardInput, setNewCardInput] = useState({ number: "", expiry: "", cvv: "" });
  const [ultraKeyInput, setUltraKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [isAuthenticatingKey, setIsAuthenticatingKey] = useState(false);

  const [notifications, setNotifications] = useState<PrestigeNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<PrestigeNotification | null>(null);
  const [notificationPhase, setNotificationPhase] = useState<"hidden" | "compact" | "expanded" | "collapsed">("hidden");
  const [notificationProgress, setNotificationProgress] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 1,
      title: "Persona Assist Profile Created",
      type: "system",
      amount: null,
      date: "Today, 09:00",
      icon: Shield,
      category: "Security",
      ref: "SEC-9981-X",
      status: "system",
      refundable: false,
    },
    {
      id: 2,
      title: "Airport Pickup Reserved",
      type: "booking",
      amount: -PLAN_PRICE,
      date: "Yesterday",
      icon: Plane,
      category: "Travel",
      ref: "TRV-4421-B",
      status: "active",
      refundable: true,
    },
    {
      id: 3,
      title: "Fine Dining Reservation",
      type: "booking",
      amount: -PLAN_PRICE,
      date: "2 Days Ago",
      icon: Utensils,
      category: "Dining",
      ref: "DIN-8821-P",
      status: "active",
      refundable: true,
    },
  ]);

  const [activitySearch, setActivitySearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<ActivityItem | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Welcome to Persona Assist. Persona Assist is online.",
      sender: "bot",
      type: "text",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    pin: "",
  });

  const [flightFromCode, setFlightFromCode] = useState("KHI");
  const [flightToCode, setFlightToCode] = useState("DXB");

  const flightFrom = FLIGHT_LOCATIONS.find((location) => location.code === flightFromCode) || FLIGHT_LOCATIONS[0];
  const flightTo = FLIGHT_LOCATIONS.find((location) => location.code === flightToCode) || FLIGHT_LOCATIONS[3];

  const [diningCity, setDiningCity] = useState("Karachi");
  const [diningRestaurant, setDiningRestaurant] = useState(DINING_OPTIONS["Karachi"][0]);

  const [hotelCity, setHotelCity] = useState("Karachi");
  const [hotelName, setHotelName] = useState(HOTEL_OPTIONS["Karachi"][0]);

  const groupedFlightLocations = useMemo(() => {
    return FLIGHT_LOCATIONS.reduce((acc, loc) => {
      if (!acc[loc.country]) acc[loc.country] = [];
      acc[loc.country].push(loc);
      return acc;
    }, {} as Record<string, FlightLocation[]>);
  }, []);

  const personaId = useMemo(() => `PRS-${Math.floor(Math.random() * 9000) + 1000}-X`, []);

  const theme = useMemo(
    () =>
      isUltra
        ? {
            accent: "text-[#ffd98a]",
            mutedAccent: "text-[#ffd98a]/70",
            bgAccent: "bg-[#ffd98a]",
            border: "border-[#ffd98a]/25",
            glow: "shadow-[0_20px_80px_rgba(255,217,138,0.18)]",
            btn: "bg-[linear-gradient(135deg,#fff4c7_0%,#ffd98a_45%,#b9862f_100%)] text-[#1c1305] font-semibold shadow-[0_12px_40px_rgba(255,217,138,0.25)] hover:shadow-[0_18px_55px_rgba(255,217,138,0.35)]",
            card: "bg-white/[0.08] border border-[#ffd98a]/20 shadow-[0_24px_80px_rgba(0,0,0,0.38)] rounded-[2.25rem] backdrop-blur-3xl",
            iconBg: "bg-[#ffd98a]/12 border border-[#ffd98a]/20 shadow-inner",
            chip: "bg-[#ffd98a]/15 text-[#ffd98a] border border-[#ffd98a]/25",
          }
        : {
            accent: "text-white",
            mutedAccent: "text-white/65",
            bgAccent: "bg-white",
            border: "border-white/14",
            glow: "shadow-[0_24px_90px_rgba(255,255,255,0.08)]",
            btn: "bg-white text-[#111113] font-semibold shadow-[0_12px_45px_rgba(255,255,255,0.18)] hover:shadow-[0_18px_55px_rgba(255,255,255,0.25)]",
            card: "bg-white/[0.085] border border-white/[0.14] shadow-[0_24px_80px_rgba(0,0,0,0.35)] rounded-[2.25rem] backdrop-blur-3xl",
            iconBg: "bg-white/[0.10] border border-white/[0.12] shadow-inner",
            chip: "bg-white/[0.10] text-white border border-white/[0.12]",
          },
    [isUltra]
  );

  const formatMoney = (amount: number | null) => {
    if (amount === null) return "Verified";
    if (isDiscrete) return "PKR **,***";
    const prefix = amount > 0 ? "+" : "-";
    return `${prefix}PKR ${Math.abs(amount).toLocaleString()}`;
  };

  const formatBalance = () => {
    if (isDiscrete) return "PKR ***,***";
    return `PKR ${walletBalance.toLocaleString()}`;
  };

  const maskedCardNumber = prestigeCard ? `**** **** **** ${prestigeCard.number.slice(-4)}` : "No card linked";

  const displayCardNumber = () => {
    if (!prestigeCard) return "No card linked";
    return showCardDetails ? prestigeCard.number : maskedCardNumber;
  };

  const displayExpiry = () => {
    if (!prestigeCard) return "--/--";
    return showCardDetails ? prestigeCard.expiry : "••/••";
  };

  const displayCvv = () => {
    if (!prestigeCard) return "---";
    return showCardDetails ? prestigeCard.cvv : "•••";
  };

  const removePrestigeCard = () => {
    setPrestigeCard(null);
    setShowCardDetails(false);
    showPrestigeNotification({ title: "Card Removed", subtitle: "Persona Assist payment card has been removed", type: "warning" });
  };

  const handleCardInputChange = (field: "number" | "expiry" | "cvv", value: string) => {
    let val = value;
    if (field === "number") {
      val = val.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
    } else if (field === "expiry") {
      val = val.replace(/\D/g, "").substring(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    } else if (field === "cvv") {
      val = val.replace(/\D/g, "").substring(0, 4);
    }
    setNewCardInput((prev) => ({ ...prev, [field]: val }));
  };

  const saveCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardInput.number.length < 19 || newCardInput.expiry.length < 5 || newCardInput.cvv.length < 3) {
      showPrestigeNotification({ title: "Incomplete Details", subtitle: "Please enter a valid card number, expiry, and CVV", type: "warning" });
      return;
    }
    setPrestigeCard({
      number: newCardInput.number,
      expiry: newCardInput.expiry,
      cvv: newCardInput.cvv,
      holder: currentUser?.name || "Persona Member",
    });
    setShowAddCardModal(false);
    setShowCardDetails(false);
    setNewCardInput({ number: "", expiry: "", cvv: "" });
    showPrestigeNotification({ title: "Card Linked", subtitle: "Your custom payment card is ready for bookings", type: "success" });
  };

  const showPrestigeNotification = (payload: Omit<PrestigeNotification, "id" | "time">) => {
    if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);

    const item: PrestigeNotification = {
      ...payload,
      id: Date.now(),
      time: "Just now",
    };

    setNotifications((prev) => [item, ...prev].slice(0, 20));
    setUnreadNotifications((prev) => prev + 1);
    setActiveNotification(item);
    setNotificationProgress(false);
    setNotificationPhase("compact");

    window.setTimeout(() => setNotificationPhase("expanded"), 90);
    window.setTimeout(() => setNotificationProgress(true), 260);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotificationPhase("collapsed");
      window.setTimeout(() => {
        setNotificationPhase("hidden");
        setActiveNotification(null);
        setNotificationProgress(false);
      }, 520);
    }, 4200);
  };

  const dismissNotification = () => {
    if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
    setNotificationPhase("collapsed");
    window.setTimeout(() => {
      setNotificationPhase("hidden");
      setActiveNotification(null);
    }, 420);
  };

  const handleNotificationAction = (notification: PrestigeNotification) => {
    if (notification.type === "plan") setActiveTab("services");
    if (notification.type === "ultra") setShowProfileModal(true);
    if (notification.relatedActivityId) {
      const activity = activities.find((item) => item.id === notification.relatedActivityId);
      if (activity) setSelectedTransaction(activity);
    }
    dismissNotification();
  };

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (activeTab === "assist") scrollToBottom();
    if (activeTab === "activity") setUnreadNotifications(0);
  }, [chatMessages, isTyping, activeTab]);

  const addActivity = (
    title: string,
    category: string,
    icon: LucideIcon,
    amount: number | null = -PLAN_PRICE,
    notificationType: NotificationType = "success"
  ) => {
    const isPaidBooking = typeof amount === "number" && amount < 0;

    if (isPaidBooking && !prestigeCard) {
      showPrestigeNotification({
        title: "Card Required",
        subtitle: "Add a card before booking paid services",
        type: "warning",
        actionLabel: "View Plan",
      });
      setActiveTab("services");
      return;
    }

    if (isPaidBooking && walletBalance < Math.abs(amount)) {
      showPrestigeNotification({
        title: "Insufficient Balance",
        subtitle: `Add funds to book this service. Required PKR ${Math.abs(amount).toLocaleString()}`,
        type: "warning",
      });
      return;
    }

    const item: ActivityItem = {
      id: Date.now(),
      title,
      type: amount === null ? "system" : amount > 0 ? "refund" : "booking",
      amount,
      date: "Just now",
      icon,
      category,
      ref: `${category.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}-P`,
      status: amount === null ? "system" : amount > 0 ? "refunded" : "active",
      refundable: isPaidBooking,
    };

    if (isPaidBooking) setWalletBalance((prev) => prev - Math.abs(amount));
    if (typeof amount === "number" && amount > 0) setWalletBalance((prev) => prev + amount);

    setActivities((prev) => [item, ...prev]);
    setSelectedTransaction(item);
    showPrestigeNotification({
      title: notificationType === "ticket" ? "Ticket Authorized" : typeof amount === "number" && amount > 0 ? "Refund Completed" : "Booking Confirmed",
      subtitle: `${title}${isPaidBooking && typeof amount === "number" ? ` • PKR ${Math.abs(amount).toLocaleString()} deducted` : ""}`,
      type: notificationType,
      actionLabel: "View Activity",
      relatedActivityId: item.id,
    });
  };

  const cancelBooking = (activity: ActivityItem) => {
    if (!activity.refundable || activity.status !== "active" || !activity.amount || activity.amount >= 0) {
      showPrestigeNotification({ title: "Cannot Cancel", subtitle: "This activity is not refundable", type: "warning" });
      return;
    }

    if (pendingRefundIds.includes(activity.id)) {
      showPrestigeNotification({ title: "Refund Pending", subtitle: "Refund is already being processed", type: "warning" });
      return;
    }

    const refundDelay = Math.floor(Math.random() * 11000) + 10000;
    setPendingRefundIds((prev) => [...prev, activity.id]);
    setActivities((prev): ActivityItem[] =>
      prev.map((item): ActivityItem =>
        item.id === activity.id
          ? { ...item, status: "cancelled", title: `${item.title} Cancelled` }
          : item
      )
    );
    setSelectedTransaction(null);
    showPrestigeNotification({
      title: "Cancellation Started",
      subtitle: `Refund will arrive in ${Math.round(refundDelay / 1000)} seconds`,
      type: "warning",
    });

    window.setTimeout(() => {
      const refundAmount = Math.abs(activity.amount || 0);
      const refundItem: ActivityItem = {
        id: Date.now(),
        title: `${activity.title} Refund Completed`,
        type: "refund",
        amount: refundAmount,
        date: "Just now",
        icon: CreditCard,
        category: "Refund",
        ref: `REF-${Math.floor(Math.random() * 9000) + 1000}-P`,
        status: "refunded",
        refundable: false,
      };

      setWalletBalance((prev) => prev + refundAmount);
      setActivities((prev): ActivityItem[] => {
        const updatedActivities = prev.map((item): ActivityItem =>
          item.id === activity.id ? { ...item, status: "refunded", refundable: false } : item
        );

        return [refundItem, ...updatedActivities];
      });
      setPendingRefundIds((prev) => prev.filter((id) => id !== activity.id));
      showPrestigeNotification({
        title: "Refund Completed",
        subtitle: `PKR ${refundAmount.toLocaleString()} returned to wallet`,
        type: "success",
        actionLabel: "View Activity",
        relatedActivityId: refundItem.id,
      });
    }, refundDelay);
  };

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const name = formData.name.trim();
    const pin = formData.pin.trim();

    if (!email) {
      showPrestigeNotification({ title: "Email Required", subtitle: "Enter your email address", type: "warning" });
      return;
    }

    if (pin.length < 4) {
      showPrestigeNotification({ title: "PIN Required", subtitle: "Enter a 4 digit access PIN", type: "warning" });
      return;
    }

    if (isSignUp) {
      if (!name) {
        showPrestigeNotification({ title: "Name Required", subtitle: "Enter your full name to create account", type: "warning" });
        return;
      }

      const existingUser = registeredUsers.find((user) => user.email === email);
      if (existingUser) {
        showPrestigeNotification({ title: "Account Exists", subtitle: "Use Sign In with your email and PIN", type: "warning" });
        return;
      }

      const newUser: RegisteredUser = { name, email, pin, isUltraSubscribed: false };
      setRegisteredUsers((prev) => [...prev, newUser]);
      setIsTransitioning(true);

      window.setTimeout(() => {
        setCurrentUser({ name: newUser.name, email: newUser.email });
        setIsUltra(false);
        setIsUltraSubscribed(false);
        setIsAuthenticated(true);
        setIsTransitioning(false);
        showPrestigeNotification({ title: "Account Created", subtitle: "Persona Assist profile secured", type: "success" });
        
        window.setTimeout(() => {
          setActiveTab("services");
          setShowAddCardModal(true);
        }, 800);
      }, 650);
      return;
    }

    const user = registeredUsers.find((item) => item.email === email);

    if (!user) {
      showPrestigeNotification({ title: "Signup Required", subtitle: "Create an account before signing in", type: "warning" });
      return;
    }

    if (user.pin !== pin) {
      showPrestigeNotification({ title: "Invalid PIN", subtitle: "PIN does not match this account", type: "warning" });
      return;
    }

    setIsTransitioning(true);
    window.setTimeout(() => {
      setCurrentUser({ name: user.name, email: user.email });
      setIsUltraSubscribed(user.isUltraSubscribed || false);
      setIsUltra(false);
      setIsAuthenticated(true);
      setIsTransitioning(false);
      showPrestigeNotification({ title: "PIN Verified", subtitle: "Secure access granted", type: "success" });
    }, 650);
  };

  const handleLogout = () => {
    setShowProfileModal(false);
    setIsTransitioning(true);
    window.setTimeout(() => {
      setIsAuthenticated(false);
      setIsTransitioning(false);
      setActiveTab("home");
      setWalletBalance(INITIAL_BALANCE);
      setPendingRefundIds([]);
      setPrestigeCard(null);
      setShowCardDetails(false);
      setShowAddCardModal(false);
      setShowUpgradeModal(false);
      setNewCardInput({ number: "", expiry: "", cvv: "" });
      setUltraKeyInput("");
      setKeyError("");
      setIsSignUp(false);
      setIsUltra(false);
      setIsUltraSubscribed(false);
      setFormData({ name: "", email: "", pin: "" });
    }, 650);
  };

  const handleToggleUltra = () => {
    if (isUltra) {
      setIsUltra(false);
      showPrestigeNotification({ title: "Persona Basic", subtitle: "Persona Basic mode active", type: "info" });
    } else {
      if (isUltraSubscribed) {
        setIsUltra(true);
        showPrestigeNotification({ title: "Persona Ultra", subtitle: "Persona Ultra mode active", type: "ultra" });
      } else {
        setShowUpgradeModal(true);
      }
    }
  };

  const handleUpgradeToUltra = () => {
    if (!ultraKeyInput.trim()) return;

    setIsAuthenticatingKey(true);
    setKeyError("");

    window.setTimeout(() => {
      setIsAuthenticatingKey(false);
      if (VALID_ULTRA_KEYS.includes(ultraKeyInput.trim().toUpperCase())) {
        if (walletBalance < ULTRA_PRICE) {
          setKeyError("Insufficient wallet balance.");
          return;
        }

        setWalletBalance(prev => prev - ULTRA_PRICE);
        setIsUltraSubscribed(true);
        setIsUltra(true);
        setShowUpgradeModal(false);
        setUltraKeyInput("");

        const item: ActivityItem = {
          id: Date.now(),
          title: "Persona Ultra Subscription",
          type: "booking",
          amount: -ULTRA_PRICE,
          date: "Just now",
          icon: Crown,
          category: "Subscription",
          ref: `SUB-${Math.floor(Math.random() * 9000) + 1000}-U`,
          status: "active",
          refundable: false,
        };
        setActivities(prev => [item, ...prev]);

        showPrestigeNotification({ title: "Persona Ultra Unlocked", subtitle: "Premium tier activated", type: "ultra" });
      } else {
        setKeyError("Invalid access key.");
      }
    }, 1500);
  };

  const handleServiceAction = (title: string, category: string, _icon: LucideIcon) => {
    void _icon;
    setActiveTab("assist");
    
    let message = `I need assistance with ${title}`;
    const lowerTitle = title.toLowerCase();
    
    if (category === "Travel" || lowerTitle.includes("charter") || lowerTitle.includes("flight")) {
      message = "I need to book a flight ticket";
    } else if (category === "Dining" || lowerTitle.includes("dining")) {
      message = "I want to make a dining reservation";
    } else if (category === "Hotel" || lowerTitle.includes("hotel")) {
      message = "I need to book a hotel room";
    } else if (category === "Security") {
      message = "I need private security protection";
    } else if (category === "Events") {
      message = "I need VIP event passes";
    } else if (category === "Shopping") {
      message = "I need a personal shopper";
    } else if (category === "Global") {
      message = "I need global concierge access";
    }
    
    handleSendMessage(message);
  };

  const handleFlightBooking = () => {
    if (flightFrom.code === flightTo.code) {
      showPrestigeNotification({ title: "Route Error", subtitle: "Choose different cities", type: "warning" });
      return;
    }
    addActivity(`${flightFrom.city} to ${flightTo.city} Flight Reserved`, "Travel", Plane, -PLAN_PRICE, "ticket");
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = { id: Date.now(), text, sender: "user", type: "text" };
    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const lowerText = text.toLowerCase();
      let botMsg: ChatMessage = { id: Date.now() + 1, sender: "bot", type: "text", text: "" };

      if (lowerText.includes("ticket") || lowerText.includes("flight") || lowerText.includes("jet") || lowerText.includes("airport") || lowerText.includes("charter")) {
        botMsg = { id: Date.now() + 1, sender: "bot", type: "flight_card" };
      } else if (lowerText.includes("dining") || lowerText.includes("restaurant") || lowerText.includes("food")) {
        botMsg = { id: Date.now() + 1, sender: "bot", type: "dining_card" };
      } else if (lowerText.includes("hotel") || lowerText.includes("stay") || lowerText.includes("room") || lowerText.includes("suite")) {
        botMsg = { id: Date.now() + 1, sender: "bot", type: "hotel_card" };
      } else if (lowerText.includes("support") || lowerText.includes("help") || lowerText.includes("elite")) {
        botMsg = { id: Date.now() + 1, sender: "bot", type: "support_card" };
      } else if (lowerText.includes("security") || lowerText.includes("protection")) {
         botMsg.text = isUltra ? "Persona Ultra Security Division is on standby. Please specify your location and protection requirements." : "Security services require Persona Ultra tier.";
      } else if (lowerText.includes("event") || lowerText.includes("pass")) {
         botMsg.text = "VIP Event Concierge is ready. Which upcoming event or city are you looking to access?";
      } else if (lowerText.includes("shop") || lowerText.includes("retail")) {
         botMsg.text = "Your Personal Shopper has been alerted. Please provide the brand or specific item you are looking for.";
      } else if (lowerText.includes("global") || lowerText.includes("worldwide")) {
         botMsg.text = isUltra ? "Global Concierge active. Which country do you require assistance in today?" : "Global services require Persona Ultra tier.";
      } else {
        botMsg.text = isUltra
          ? "Persona Ultra protocol active. Priority handling is ready. Choose a service or send a custom request."
          : "Persona Assist is ready. Choose Ticket Booking, Dining, Hotel, or Support to continue.";
      }

      setIsTyping(false);
      setChatMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const filteredActivities = activities.filter(
    (activity) => activity.title.toLowerCase().includes(activitySearch.toLowerCase()) || activity.category.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const getSuggestions = () => {
    if (isUltra) return ["Charter Private Jet", "Michelin Star Dining", "Global Concierge", "Luxury Hotel Stay", "Security Escort", "VIP Event Access"];
    return ["Ticket Booking", "Local Dining", "Hotel Booking", "Chauffeur", "Shopping", "Home Services", "Priority Support"];
  };

  const textFieldClass =
    "w-full rounded-[1.35rem] border border-white/[0.12] bg-white/[0.075] px-5 py-4 text-[14px] text-white placeholder:text-white/38 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition-all duration-300 focus:border-white/28 focus:bg-white/[0.11] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]";

  const NotificationIcon = activeNotification ? getNotificationIcon(activeNotification.type) : CheckCircle;
  const notificationExpanded = notificationPhase === "expanded";
  const notificationTone = activeNotification ? getNotificationTone(activeNotification.type) : getNotificationTone("success");

  const notificationClasses =
    notificationPhase === "hidden"
      ? "-translate-y-16 opacity-0 scale-75 w-14 h-12 rounded-full"
      : notificationPhase === "compact"
      ? "translate-y-0 opacity-100 scale-95 w-16 h-12 rounded-full"
      : notificationPhase === "collapsed"
      ? "translate-y-0 opacity-90 scale-95 w-20 h-12 rounded-full"
      : "translate-y-0 opacity-100 scale-100 w-[92%] max-w-md min-h-[6.25rem] rounded-[2.15rem]";

  if (!isAuthenticated) {
    return (
      <div className={`min-h-[100dvh] overflow-hidden bg-[#09090f] text-white flex items-center justify-center p-4 sm:p-6 relative transition-all duration-700 ease-ios ${isTransitioning ? "scale-[1.03] opacity-0 blur-2xl" : "scale-100 opacity-100 blur-0"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(132,103,255,0.22),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(255,217,138,0.16),transparent_35%)]" />
        <style>{`
          .font-ios { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, Segoe UI, sans-serif; }
          .font-luxury { font-family: Georgia, "Times New Roman", serif; }
          .ease-ios { transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
          .glass-panel { background: linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.055)); border: 1px solid rgba(255,255,255,.14); box-shadow: 0 30px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.10); backdrop-filter: blur(34px); }
          @keyframes appearUp { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .stagger-1 { animation: appearUp .75s cubic-bezier(.22,1,.36,1) forwards .08s; opacity: 0; }
          .stagger-2 { animation: appearUp .75s cubic-bezier(.22,1,.36,1) forwards .18s; opacity: 0; }
          .notification-spring { transition: all 720ms cubic-bezier(.18,1.28,.24,1); }
          .notification-progress { transform-origin: left; transition: transform 4200ms linear; }
          .notification-shine { background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.16) 45%, transparent 70%); animation: notificationShine 2.6s ease-in-out infinite; }
          @keyframes notificationShine { 0% { transform: translateX(-120%); } 100% { transform: translateX(140%); } }
          
          @keyframes iosNavFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-4px);
            }
          }
          .ios-nav-float {
            animation: iosNavFloat 5.5s ease-in-out infinite;
          }
        `}</style>

        {activeNotification && (
          <button onClick={() => handleNotificationAction(activeNotification)} className={`fixed top-6 z-[700] overflow-hidden bg-black/70 border border-white/[0.16] backdrop-blur-3xl shadow-[0_26px_90px_rgba(0,0,0,.55)] ${notificationTone.glow} notification-spring ${notificationClasses}`}>
            <div className="absolute inset-0 notification-shine" />
            <div className="relative flex h-full w-full items-center gap-3 px-3 py-3 text-left">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${notificationTone.icon}`}>
                <NotificationIcon size={17} />
              </div>
              {notificationExpanded && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-white">{activeNotification.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-white/55">{activeNotification.subtitle}</p>
                    </div>
                    <span className="text-[9px] font-bold text-white/30">{activeNotification.time}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {activeNotification.actionLabel && <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${notificationTone.chip}`}>{activeNotification.actionLabel}</span>}
                    <span onClick={(e) => { e.stopPropagation(); dismissNotification(); }} className="rounded-full bg-white/[0.09] px-3 py-1 text-[10px] font-bold text-white/60">Dismiss</span>
                  </div>
                </div>
              )}
            </div>
            {notificationExpanded && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/[0.08]"><div className={`h-full ${notificationTone.bar} notification-progress`} style={{ transform: notificationProgress ? "scaleX(0)" : "scaleX(1)" }} /></div>}
          </button>
        )}

        <div className="relative z-10 w-full max-w-[420px] px-2 sm:px-0 space-y-8 font-ios">
          <div className="text-center stagger-1">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.45rem] bg-white/[0.10] border border-white/[0.14] shadow-[0_18px_60px_rgba(255,255,255,0.08)] backdrop-blur-3xl">
              <Sparkles size={25} className="text-white" strokeWidth={1.7} />
            </div>
            <h1 className="text-[46px] leading-none font-luxury tracking-[0.08em] text-white drop-shadow-sm">Persona</h1>
            <p className="mt-3 text-[11px] uppercase tracking-[0.36em] text-white/52 font-semibold">Assist</p>
          </div>

          <form onSubmit={handleAuth} className="stagger-2 glass-panel rounded-[2.35rem] p-6 md:p-7 transition-all duration-500 ease-ios">
            <div className="mb-6 rounded-[1.65rem] bg-black/15 border border-white/[0.08] p-4">
              <p className="text-[12px] font-semibold text-white/78">Private PIN Access</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/42">Enter your secure PIN to continue Persona Assist.</p>
            </div>
            <div className="space-y-3.5">
              <div className={`overflow-hidden transition-all duration-500 ease-ios ${isSignUp ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
                <input type="text" placeholder="Full Name" className={textFieldClass} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required={isSignUp} />
              </div>
              <input type="email" placeholder="Email Address" className={textFieldClass} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <input type="password" inputMode="numeric" maxLength={6} placeholder="4 Digit PIN" className={`${textFieldClass} text-center tracking-[0.5em]`} value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })} required />
            </div>
            <button type="submit" className={`mt-6 w-full rounded-[1.35rem] py-4 text-[13px] font-bold tracking-wide transition-all duration-300 active:scale-[0.98] ${theme.btn}`}>{isSignUp ? "Apply for Membership" : "Verify PIN"}</button>
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="mt-5 w-full text-center text-[12px] font-semibold text-white/46 hover:text-white transition-colors">{isSignUp ? "Existing member? Sign in" : "Not a member? Apply"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full overflow-hidden bg-[#080910] text-white font-ios selection:bg-white/20 flex flex-col items-center transition-all duration-700 ease-ios ${isTransitioning ? "opacity-0 scale-[0.98] blur-xl" : "opacity-100 scale-100 blur-0"}`}>
      <style>{`
        .font-ios { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, Segoe UI, sans-serif; }
        .font-luxury { font-family: Georgia, "Times New Roman", serif; }
        .ease-ios { transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-panel { background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055)); border: 1px solid rgba(255,255,255,.13); box-shadow: 0 24px 80px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.10); backdrop-filter: blur(34px); }
        .glass-soft { background: linear-gradient(145deg, rgba(255,255,255,.095), rgba(255,255,255,.035)); border: 1px solid rgba(255,255,255,.10); box-shadow: inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(28px); }

        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(24px) scale(.98); filter: blur(5px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); } }
        .anim-slide-up { animation: slideUpFade .65s cubic-bezier(0.23, 1, 0.32, 1) forwards; opacity: 0; }

        @keyframes popIn { 0% { opacity: 0; transform: scale(.92) translateY(12px); filter: blur(8px); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); } }
        .anim-pop-in { animation: popIn .5s cubic-bezier(0.23, 1, 0.32, 1) forwards; opacity: 0; }

        @keyframes shimmerInfinite { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .anim-float { animation: float 6s ease-in-out infinite; }

        @keyframes iosNavFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .ios-nav-float {
          animation: iosNavFloat 5.5s ease-in-out infinite;
        }

        @keyframes ambientDrift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(2%, -2%) scale(1.05); } 66% { transform: translate(-2%, 2%) scale(0.95); } }
        .anim-ambient { animation: ambientDrift 18s ease-in-out infinite alternate; }

        @keyframes slideRight { to { transform: translateX(0); } }
        @keyframes glowPulse { 0%,100% { opacity:.5; transform:scale(1); } 50% { opacity:.9; transform:scale(1.05); } }

        .notification-spring { transition: all 720ms cubic-bezier(.18,1.28,.24,1); }
        .notification-progress { transform-origin: left; transition: transform 4200ms linear; }
        .notification-shine { background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.16) 45%, transparent 70%); animation: notificationShine 2.6s ease-in-out infinite; }
        @keyframes notificationShine { 0% { transform: translateX(-120%); } 100% { transform: translateX(140%); } }
      `}</style>

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(117,93,255,0.20),transparent_30%),radial-gradient(circle_at_50%_105%,rgba(255,217,138,0.14),transparent_36%)] anim-ambient" />
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-out ${isUltra ? "opacity-100" : "opacity-45"} bg-[radial-gradient(circle_at_82%_8%,rgba(255,217,138,0.16),transparent_30%)] anim-ambient`} style={{ animationDelay: '-5s' }} />

      {activeNotification && (
        <div className="fixed top-6 left-0 right-0 z-[700] flex justify-center px-4 pointer-events-none">
          <button onClick={() => handleNotificationAction(activeNotification)} onDoubleClick={dismissNotification} className={`pointer-events-auto overflow-hidden bg-black/70 border border-white/[0.16] backdrop-blur-3xl shadow-[0_26px_90px_rgba(0,0,0,.55)] ${notificationTone.glow} notification-spring ${notificationClasses}`}>
            <div className="absolute inset-0 notification-shine" />
            <div className="relative flex h-full w-full items-center gap-3 px-3 py-3 text-left">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${notificationTone.icon}`}>
                <NotificationIcon size={18} />
              </div>
              {notificationExpanded && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-white">{activeNotification.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-white/55">{activeNotification.subtitle}</p>
                    </div>
                    <span className="text-[9px] font-bold text-white/30">{activeNotification.time}</span>
                  </div>
                  {activeNotification.type === "ticket" && (
                    <div className="mt-3 flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2 text-[10px] font-black text-white/75">
                      <span>{flightFrom.code}</span><Plane size={12} className={theme.accent} /><span>{flightTo.code}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    {activeNotification.actionLabel && <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${notificationTone.chip}`}>{activeNotification.actionLabel}</span>}
                    <span onClick={(e) => { e.stopPropagation(); dismissNotification(); }} className="rounded-full bg-white/[0.09] px-3 py-1 text-[10px] font-bold text-white/60">Dismiss</span>
                  </div>
                </div>
              )}
            </div>
            {notificationExpanded && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/[0.08]"><div className={`h-full ${notificationTone.bar} notification-progress`} style={{ transform: notificationProgress ? "scaleX(0)" : "scaleX(1)" }} /></div>}
          </button>
        </div>
      )}

      {showNotificationCenter && (
        <div className="fixed inset-0 z-[650] grid place-items-center overflow-y-auto bg-black/60 px-4 py-6 sm:p-6 backdrop-blur-2xl transition-all" onClick={() => setShowNotificationCenter(false)}>
          <div className="m-auto w-full max-w-md rounded-[2.25rem] glass-panel p-5 sm:p-6 anim-pop-in max-h-[calc(100dvh-3rem)] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-black tracking-[-0.04em]">Notification Center</h3>
                <p className="text-[12px] font-semibold text-white/42">{notifications.length} latest Persona Assist updates</p>
              </div>
              <button onClick={() => { setNotifications([]); setUnreadNotifications(0); }} className="rounded-full bg-white/[0.08] px-3 py-2 text-[11px] font-bold text-white/60">Clear All</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="rounded-[1.5rem] bg-white/[0.06] p-8 text-center text-[12px] font-bold text-white/42">No notifications yet</div>
              ) : notifications.map((item) => {
                const Icon = getNotificationIcon(item.type);
                const tone = getNotificationTone(item.type);
                return (
                  <button key={item.id} onClick={() => handleNotificationAction(item)} className="group relative flex w-full items-center gap-3 overflow-hidden rounded-[1.65rem] bg-white/[0.06] p-4 text-left transition hover:bg-white/[0.10] active:scale-[0.99]">
                    <div className={`grid h-11 w-11 place-items-center rounded-full ${tone.icon}`}><Icon size={18} /></div>
                    <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[13px] font-black text-white">{item.title}</p><span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase ${tone.chip}`}>{item.type}</span></div><p className="mt-0.5 truncate text-[11px] font-semibold text-white/42">{item.subtitle}</p></div>
                    <span className="text-[10px] font-bold text-white/30">{item.time}</span>
                    <div className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${tone.bar}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showAddCardModal && (
        <div className="fixed inset-0 z-[600] grid place-items-center overflow-y-auto px-4 py-6 sm:p-6 bg-black/60 backdrop-blur-2xl" onClick={() => setShowAddCardModal(false)}>
          <div className={`m-auto w-full max-w-sm rounded-[2.25rem] p-6 sm:p-7 glass-panel anim-slide-up max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-hide shadow-[0_40px_100px_rgba(0,0,0,0.6)] ${theme.glow}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[20px] font-bold tracking-[-0.03em] text-white">Link Payment Card</h3>
                <p className="text-[12px] font-semibold text-white/42">Enter details to authorize bookings</p>
              </div>
              <button onClick={() => setShowAddCardModal(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-white/60 transition hover:bg-white/[0.15] hover:text-white active:scale-95"><X size={16} /></button>
            </div>
            <form onSubmit={saveCustomCard} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Card Number</label>
                <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" className={textFieldClass} value={newCardInput.number} onChange={(e) => handleCardInputChange("number", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Expiry Date</label>
                  <input type="text" inputMode="numeric" placeholder="MM/YY" className={textFieldClass} value={newCardInput.expiry} onChange={(e) => handleCardInputChange("expiry", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">CVV</label>
                  <input type="password" inputMode="numeric" placeholder="•••" className={`${textFieldClass} tracking-widest`} value={newCardInput.cvv} onChange={(e) => handleCardInputChange("cvv", e.target.value)} />
                </div>
              </div>
              <button type="submit" className={`mt-2 w-full rounded-[1.35rem] py-4 text-[13px] font-bold transition active:scale-[0.98] ${theme.btn}`}>
                Link Secure Card
              </button>
            </form>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[600] grid place-items-center overflow-y-auto px-4 py-6 sm:p-6 bg-black/70 backdrop-blur-2xl" onClick={() => setShowUpgradeModal(false)}>
          <div className="relative m-auto w-full max-w-sm overflow-hidden rounded-[2.35rem] p-6 sm:p-7 text-center glass-panel anim-slide-up border border-[#ffd98a]/30 bg-[linear-gradient(145deg,rgba(28,19,5,0.9),rgba(0,0,0,0.85))] shadow-[0_40px_100px_rgba(255,217,138,0.25)] max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full blur-[3rem] opacity-20 bg-[#ffd98a] pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full blur-[3rem] opacity-20 bg-[#ffd98a] pointer-events-none" />

            <button onClick={() => setShowUpgradeModal(false)} className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] text-white/60 backdrop-blur-md transition hover:bg-white/[0.15] hover:text-white active:scale-95"><X size={18} /></button>
            
            <div className="relative z-10">
              <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-[1.75rem] bg-[#ffd98a]/10 border border-[#ffd98a]/20 shadow-inner">
                <Crown size={32} className="text-[#ffd98a]" />
              </div>
              <h3 className="text-[24px] font-bold tracking-[-0.02em] text-white">Persona Ultra</h3>
              <p className="mt-1.5 text-[12px] font-semibold text-[#ffd98a]/70">PKR {ULTRA_PRICE.toLocaleString()} / month</p>

              <div className="my-6 space-y-3 text-left">
                {[
                  "Private Jet Charters",
                  "Global Michelin Star Dining",
                  "VIP Event Access & Tickets",
                  "Private Security & Escorts",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[1rem] bg-black/30 border border-[#ffd98a]/10 p-3">
                    <CheckCircle size={14} className="text-[#ffd98a]" />
                    <span className="text-[12px] font-bold text-white/80">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="ENTER ULTRA KEY" 
                  value={ultraKeyInput}
                  onChange={(e) => { setUltraKeyInput(e.target.value.toUpperCase()); setKeyError(""); }}
                  disabled={isAuthenticatingKey}
                  className="w-full rounded-[1.2rem] border border-[#ffd98a]/20 bg-black/40 px-4 py-3.5 text-center font-mono text-[13px] font-bold tracking-[0.25em] text-[#ffd98a] placeholder:text-[#ffd98a]/30 outline-none transition focus:border-[#ffd98a]/50 disabled:opacity-50"
                />
                {keyError && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400">{keyError}</p>}
              </div>

              <button onClick={handleUpgradeToUltra} disabled={isAuthenticatingKey} className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#fff4c7_0%,#ffd98a_45%,#b9862f_100%)] py-4 text-[13px] font-bold text-[#1c1305] shadow-[0_12px_40px_rgba(255,217,138,0.25)] transition hover:shadow-[0_18px_55px_rgba(255,217,138,0.35)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100">
                {isAuthenticatingKey ? <Loader2 size={16} className="animate-spin text-[#1c1305]" /> : <Crown size={16} />}
                {isAuthenticatingKey ? "VERIFYING KEY..." : "AUTHORIZE UPGRADE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[500] grid place-items-center overflow-y-auto px-4 py-6 sm:p-6 bg-black/60 backdrop-blur-2xl transition-all" onClick={() => { if (!isAuthenticatingKey) setShowProfileModal(false); }}>
          <div className={`relative m-auto w-full max-w-sm overflow-hidden rounded-[2.35rem] p-6 sm:p-7 text-center glass-panel anim-pop-in max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-hide shadow-[0_40px_100px_rgba(0,0,0,0.6)] ${theme.glow}`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProfileModal(false)} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] text-white/45 transition hover:bg-white/[0.13] hover:text-white"><X size={18} /></button>
            <div className={`absolute -left-16 -top-16 h-40 w-40 rounded-full blur-[3rem] opacity-30 pointer-events-none ${isUltra ? "bg-[#ffd98a]" : "bg-white"}`} />
            <div className={`absolute -bottom-16 -right-16 h-40 w-40 rounded-full blur-[3rem] opacity-20 pointer-events-none ${isUltra ? "bg-[#ffd98a]" : "bg-white"}`} />

            <button onClick={() => setShowProfileModal(false)} className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] text-white/60 backdrop-blur-md transition hover:bg-white/[0.15] hover:text-white active:scale-95"><X size={18} /></button>
            
            <div className="relative z-10">
              <div className={`mx-auto mb-4 grid h-24 w-24 relative place-items-center rounded-[2.25rem] ${theme.iconBg} shadow-2xl anim-float border ${isUltra ? 'border-[#ffd98a]/30' : 'border-white/10'}`}>
                <User size={38} className={isUltra ? "text-[#ffd98a]" : "text-white/80"} />
                {isUltra && (
                  <div className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-[#1c1305] border border-[#ffd98a]/30 shadow-[0_4px_12px_rgba(255,217,138,0.4)]">
                    <Crown size={14} className="text-[#ffd98a]" />
                  </div>
                )}
              </div>
              <h3 className="text-[24px] font-bold tracking-[-0.02em] text-white">{currentUser?.name}</h3>
              <p className="mt-1 text-[13px] font-medium text-white/50">{currentUser?.email}</p>

              <div className="my-7 flex flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-[1.25rem] bg-black/20 border border-white/[0.06] p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Shield className={theme.accent} size={16} />
                    <span className="text-[12px] font-semibold text-white/70">Current Tier</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${theme.accent}`}>{isUltra ? "Persona Ultra" : "Persona Basic"}</span>
                </div>

                <div className="flex items-center justify-between rounded-[1.25rem] bg-black/20 border border-white/[0.06] p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <ActivityIcon className="text-white/60" size={16} />
                    <span className="text-[12px] font-semibold text-white/70">Active Bookings</span>
                  </div>
                  <span className="text-[14px] font-bold text-white">{activities.filter(a => a.status === 'active').length}</span>
                </div>

                <div className="flex items-center justify-between rounded-[1.25rem] bg-black/20 border border-white/[0.06] p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Lock className="text-white/60" size={16} />
                    <span className="text-[12px] font-semibold text-white/70">Persona ID</span>
                  </div>
                  <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-white/90">{personaId}</span>
                </div>
              </div>

              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-red-400/20 bg-red-500/[0.08] py-4 text-[13px] font-bold text-red-300 transition hover:bg-red-500/[0.15] hover:border-red-400/30 active:scale-[0.98]">
                <LogOut size={16} /> Disconnect Session
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-2xl p-4 sm:p-6 transition-all" onClick={() => setSelectedTransaction(null)}>
          <div className="m-auto w-full max-w-sm rounded-[2.2rem] p-5 sm:p-6 glass-panel anim-pop-in max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-hide shadow-[0_40px_100px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between"><div className={`grid h-16 w-16 place-items-center rounded-[1.6rem] ${theme.iconBg}`}>{React.createElement(selectedTransaction.icon, { size: 28, strokeWidth: 1.6 })}</div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/36">Booking Log</p></div>
            <h3 className="mb-1 text-[25px] font-semibold tracking-[-0.03em] text-white">{selectedTransaction.title}</h3>
            <p className="mb-7 text-[12px] text-white/45">{selectedTransaction.date}</p>
            <div className="mb-7 space-y-3 rounded-[1.55rem] bg-black/16 p-4 border border-white/[0.07]">
              {[["Category", selectedTransaction.category], ["Amount", formatMoney(selectedTransaction.amount)], ["Status", selectedTransaction.status || "active"], ["Ref ID", selectedTransaction.ref]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0 last:pb-0"><span className="text-[12px] font-semibold text-white/42">{label}</span><span className="text-[12px] font-bold text-white/82">{value}</span></div>)}
            </div>
            {selectedTransaction.refundable && selectedTransaction.status === "active" && (
              <button onClick={() => cancelBooking(selectedTransaction)} className="mb-3 w-full rounded-[1.25rem] bg-red-500/[0.12] border border-red-300/15 py-4 text-[12px] font-bold text-red-200 transition hover:bg-red-500/[0.18]">
                Cancel Booking & Refund
              </button>
            )}
            {selectedTransaction.status === "cancelled" && (
              <div className="mb-3 rounded-[1.25rem] bg-[#ffd98a]/[0.10] border border-[#ffd98a]/20 px-4 py-3 text-center text-[12px] font-bold text-[#ffd98a]">
                Refund processing in 10–20 seconds
              </div>
            )}
            <button onClick={() => setSelectedTransaction(null)} className="w-full rounded-[1.25rem] bg-white/[0.10] py-4 text-[12px] font-bold text-white transition hover:bg-white/[0.15]">Close Log</button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="relative z-10 flex h-full w-full max-w-5xl flex-col">
        <header className="z-20 flex items-center justify-between px-4 pb-4 pt-6 sm:px-5 sm:pt-7 md:px-10 md:pt-9 shrink-0">
          <div className="flex cursor-pointer items-center gap-3.5 group" onClick={() => setShowProfileModal(true)}>
            <div className={`grid h-12 w-12 place-items-center rounded-[1.25rem] ${theme.iconBg}`}>
              <User size={20} className={isUltra ? "text-[#ffd98a]" : "text-white/76"} />
            </div>
            <div className="anim-slide-up">
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-white">{currentUser?.name}</h2>
              <p className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${theme.mutedAccent}`}>{isUltra ? "Persona Ultra" : "Persona Basic"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowNotificationCenter(true); setUnreadNotifications(0); }} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] border border-white/[0.10] text-white/70"><Bell size={17} />{unreadNotifications > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ffd98a] px-1 text-[9px] font-black text-[#111113]">{unreadNotifications}</span>}</button>
            <div 
              onClick={handleToggleUltra} 
              className={`relative flex h-11 w-40 cursor-pointer items-center rounded-full p-1 border backdrop-blur-3xl transition-all duration-500 ease-ios active:scale-95 ${
                isUltra ? "bg-[#ffd98a]/[0.08] border-[#ffd98a]/25 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]" : "bg-black/30 border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]"
              }`}
            >
              <div 
                className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-ios ${
                  isUltra 
                    ? "left-[calc(50%+2px)] bg-[linear-gradient(135deg,#fff4c7_0%,#ffd98a_45%,#c48f32_100%)] shadow-[0_4px_24px_rgba(255,217,138,0.45)]" 
                    : "left-1 bg-white/20 border border-white/10 shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
                }`} 
              />
              <div className={`relative z-10 flex-1 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isUltra ? "text-[#ffd98a]/40" : "text-white drop-shadow-md"}`}>
                Basic
              </div>
              <div className={`relative z-10 flex-1 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isUltra ? "text-[#1c1305]" : "text-[#ffd98a]/40"}`}>
                Ultra
              </div>
            </div>
          </div>
        </header>

        <main className="z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-6 sm:pb-8 lg:pb-10 md:px-10 scrollbar-hide">
          <div key={activeTab} className="anim-pop-in flex flex-1 flex-col h-full min-h-0">
            {activeTab === "home" && (
              <div className="space-y-5 md:space-y-7 h-full">
                <section onClick={() => showPrestigeNotification({ title: "Plan Active", subtitle: `Wallet Balance ${formatBalance()}`, type: "plan", actionLabel: "View Plan" })} className={`relative overflow-hidden p-6 md:p-8 ${theme.card} ${theme.glow} anim-slide-up cursor-pointer`}>
                <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2"><p className="text-[12px] font-bold text-white/48">Persona Wallet Balance</p><button onClick={(e) => { e.stopPropagation(); setIsDiscrete(!isDiscrete); }} className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.08] text-white/55 transition hover:bg-white/[0.12] hover:text-white">{isDiscrete ? <EyeOff size={14} /> : <Eye size={14} />}</button></div><h3 className="text-[36px] sm:text-[42px] font-bold tracking-[-0.055em] md:text-[56px] truncate max-w-[250px] sm:max-w-none">{formatBalance()}</h3><div className="mt-4 sm:mt-5 flex items-center gap-3"><span className="rounded-full border border-emerald-300/20 bg-emerald-400/[0.12] px-3 py-1.5 text-[11px] font-black text-emerald-300">Active</span><span className="text-[11px] sm:text-[12px] font-semibold text-white/38">Bookings deduct PKR {PLAN_PRICE.toLocaleString()}</span></div></div><div className={`hidden sm:grid h-16 w-16 shrink-0 place-items-center rounded-[1.55rem] ${theme.iconBg} anim-float`}><Diamond size={30} /></div></div>
              </section>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">{[
                { title: "Travel", subtitle: "Flights & Airport", icon: Plane, ultraOnly: false, category: "Travel" },
                { title: "Dining", subtitle: "Priority Booking", icon: Utensils, ultraOnly: false, category: "Dining" },
                { title: "Hotel", subtitle: "Suites & Upgrades", icon: Gem, ultraOnly: false, category: "Hotel" },
                { title: "Events", subtitle: "VIP Passes", icon: CalendarClock, ultraOnly: false, category: "Events" },
                { title: "Shopping", subtitle: "Personal Shopper", icon: CreditCard, ultraOnly: false, category: "Shopping" },
                { title: "Security", subtitle: "Private Protection", icon: Shield, ultraOnly: true, category: "Security" },
                { title: "Global", subtitle: "Worldwide Access", icon: Globe, ultraOnly: true, category: "Global" },
                { title: "Charter", subtitle: "Private Jet", icon: Crown, ultraOnly: true, category: "Travel" },
                { title: "Shuttles", subtitle: "Domestic Routes", icon: Car, ultraOnly: false, category: "Travel", comingSoon: true },
                { title: "Cab Service", subtitle: "Local Transfers", icon: Car, ultraOnly: false, category: "Travel", comingSoon: true },
                { title: "Cash Transit", subtitle: "Local Deliveries", icon: Briefcase, ultraOnly: true, category: "Finance", comingSoon: true },
                { title: "Banking", subtitle: "Offshore & Local", icon: Landmark, ultraOnly: true, category: "Finance", comingSoon: true },
                { title: "Assistants", subtitle: "Global Concierge", icon: User, ultraOnly: false, category: "Personal", comingSoon: true },
                { title: "Yachts", subtitle: "Global Charters", icon: Anchor, ultraOnly: true, category: "Travel", comingSoon: true },
                { title: "Resorts", subtitle: "Int'l & Domestic", icon: Sun, ultraOnly: false, category: "Hotel", comingSoon: true },
                { title: "Helicopter", subtitle: "Domestic Flights", icon: Navigation, ultraOnly: true, category: "Travel", comingSoon: true },
                { title: "Logistics", subtitle: "Global Shipping", icon: Truck, ultraOnly: false, category: "Logistics", comingSoon: true },
              ].map((service, index) => {
                if (service.ultraOnly && !isUltra) return null;
                
                if (service.comingSoon) {
                  return (
                    <button 
                      key={service.title} 
                      onClick={() => showPrestigeNotification({ title: "Coming Soon", subtitle: `${service.title} will be available in future updates.`, type: "info" })}
                      className={`anim-slide-up relative group rounded-[1.85rem] p-5 text-left border border-white/[0.05] bg-white/[0.02] opacity-65 grayscale transition duration-300 hover:opacity-80 active:scale-[0.98]`} 
                      style={{ animationDelay: `${(index + 1) * 0.04}s` }}
                    >
                      <div className="absolute top-4 right-4 rounded-full bg-white/[0.12] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/70">Soon</div>
                      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-[1.1rem] bg-white/[0.08] text-white/50`} >
                          {React.createElement(service.icon, { size: 20 })}
                      </div>
                      <h4 className="text-[14px] font-bold text-white/70">{service.title}</h4>
                      <p className="mt-1 text-[10px] font-semibold text-white/40">{service.subtitle}</p>
                    </button>
                  );
                }

                return <button key={service.title} onClick={() => handleServiceAction(`${service.title} Service Requested`, service.category, service.icon)} className={`anim-slide-up group rounded-[1.85rem] p-5 text-left transition duration-300 active:scale-[0.98] ${service.ultraOnly ? "border border-[#ffd98a]/18 bg-[#ffd98a]/[0.075]" : "glass-soft hover:bg-white/[0.11]"}`} style={{ animationDelay: `${(index + 1) * 0.04}s` }}><div className={`mb-5 grid h-12 w-12 place-items-center rounded-[1.25rem] ${service.ultraOnly ? "bg-[#ffd98a]/14 text-[#ffd98a]" : "bg-white/[0.10] text-white"}`} >{React.createElement(service.icon, { size: 22 })}</div><h4 className="text-[15px] font-bold text-white">{service.title}</h4><p className="mt-1 text-[11px] font-semibold text-white/40">{service.subtitle}</p></button>;
              })}</div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-7 py-2">
              <div className="anim-slide-up relative mx-auto min-h-[18rem] w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/18 p-6 shadow-[0_28px_90px_rgba(0,0,0,.42)] transition hover:-translate-y-1">
                <div className={`absolute inset-0 ${isUltra ? "bg-[linear-gradient(135deg,#fff1bd_0%,#ffd98a_34%,#a87322_100%)]" : "bg-[linear-gradient(135deg,#f8f8fb_0%,#bfc2cc_42%,#4f5563_100%)]"}`} />
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.36)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shimmerInfinite_3.4s_linear_infinite]" />
                <div className="relative z-10 flex min-h-[15.5rem] flex-col justify-between text-[#161616]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-luxury text-[17px] font-bold tracking-[0.13em]">{isUltra ? "PERSONA ULTRA" : "PERSONA BASIC"}</h3>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.24em] opacity-55">PKR {PLAN_PRICE.toLocaleString()} Per Booking</p>
                    </div>
                    <button onClick={() => prestigeCard && setShowCardDetails(!showCardDetails)} disabled={!prestigeCard} className="grid h-9 w-9 place-items-center rounded-full bg-black/10 text-black/60 disabled:opacity-30">
                      {showCardDetails ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div>
                    <p className="mb-4 font-mono text-[20px] font-semibold tracking-[0.14em]">{displayCardNumber()}</p>
                    <div className="mb-4 grid grid-cols-3 gap-3 rounded-[1.15rem] bg-black/10 p-3 text-left">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] opacity-45">Holder</p>
                        <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.08em]">{prestigeCard?.holder || "No Card Linked"}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] opacity-45">Expiry</p>
                        <p className="mt-1 font-mono text-[12px] font-black">{displayExpiry()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] opacity-45">CVV</p>
                        <p className="mt-1 font-mono text-[12px] font-black">{displayCvv()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] opacity-70">
                      <span>{prestigeCard ? "Card Active" : "Action Required"}</span>
                      <span>{walletBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
                {prestigeCard ? (
                  <>
                    <button onClick={removePrestigeCard} className="rounded-[1.35rem] border border-red-300/15 bg-red-500/[0.10] py-3 text-[11px] font-black uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/[0.16]">
                      Remove Card
                    </button>
                    <button onClick={() => setShowCardDetails(!showCardDetails)} className="rounded-[1.35rem] border border-white/[0.10] bg-white/[0.08] py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white/75 transition hover:bg-white/[0.13]">
                      {showCardDetails ? "Hide Details" : "Show Details"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowAddCardModal(true)} className="col-span-2 rounded-[1.35rem] border border-emerald-300/15 bg-emerald-500/[0.12] py-3 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-200 transition hover:bg-emerald-500/[0.18]">
                    Link Secure Card to Activate Services
                  </button>
                )}
              </div>
              <div className="anim-slide-up mx-auto max-w-sm rounded-[2rem] p-5 glass-panel"><p className="mb-5 text-center text-[11px] font-black uppercase tracking-[0.24em] text-white/48">Active Features</p><div className="space-y-4">{[
                { name: "Ticket Booking", detail: "Country and city route selector", icon: PlaneTakeoff },
                { name: "Dining", detail: "VIP table confirmation", icon: ChefHat },
                { name: "Hotel", detail: "Luxury suite reservation", icon: Gem },
                { name: "Chauffeur", detail: "Luxury car with driver", icon: Plane },
                { name: "Event Access", detail: "VIP passes and reservations", icon: CalendarClock },
                { name: "Shopping", detail: "Personal shopper and delivery", icon: CreditCard },
                { name: "Home Services", detail: "Cleaning, repairs, helpers", icon: ShieldCheck },
                { name: "Security", detail: "Private protection and escort", icon: Shield },
                { name: "Visa & Documents", detail: "Travel document assistance", icon: Globe },
                { name: "Support", detail: "Priority callback support", icon: CalendarClock },
              ].map((item) => <button key={item.name} onClick={() => { setActiveTab("assist"); handleSendMessage(item.name); }} className="flex w-full items-center justify-between rounded-[1.45rem] bg-white/[0.07] border border-white/[0.08] p-4 text-left transition hover:bg-white/[0.11]"><div className="flex items-center gap-3"><div className={`grid h-11 w-11 place-items-center rounded-[1.1rem] ${theme.iconBg}`}>{React.createElement(item.icon, { size: 19 })}</div><div><p className="text-[13px] font-bold text-white">{item.name}</p><p className="text-[11px] font-semibold text-white/38">{item.detail}</p></div></div><ChevronRight size={17} className="text-white/35" /></button>)}</div></div>
            </div>
          )}

          {activeTab === "nearby" && (
            <div className="space-y-5 h-full">
              <div className="anim-slide-up flex flex-col gap-4 border-b border-white/[0.08] pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.05em]">Privileges</h2>
                  <p className="mt-1 text-[13px] font-semibold text-white/42">Available near you</p>
                </div>
                <div className="relative flex w-full sm:w-fit items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5 border border-white/[0.10] backdrop-blur-2xl">
                  <MapPin size={14} className={`shrink-0 ${theme.accent}`} />
                  <select
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className="appearance-none bg-transparent text-[12px] font-bold text-white/82 outline-none pr-4 cursor-pointer w-full truncate"
                  >
                    {PRIVILEGE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-[#111113] text-white">
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={12} className="absolute right-3 text-white/40 rotate-90 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3.5">
                {PRIVILEGES_BY_CITY[currentCity].map((offer, index) => {
                  const isLocked = offer.ultraOnly && !isUltra;
                  return (
                    <div
                      key={offer.id}
                      onClick={() =>
                        isLocked
                          ? showPrestigeNotification({
                              title: "Persona Ultra Required",
                              subtitle: "Toggle Ultra persona to access",
                              type: "ultra",
                            })
                          : addActivity(
                              offer.title,
                              offer.category,
                              offer.icon,
                              -PLAN_PRICE,
                              offer.category === "Dining" ? "dining" : "success"
                            )
                      }
                      className={`anim-slide-up relative rounded-[1.75rem] p-4 transition duration-300 ${
                        isLocked
                          ? "bg-white/[0.035] border border-white/[0.06] opacity-55 grayscale"
                          : "glass-soft hover:bg-white/[0.11] cursor-pointer active:scale-[0.99]"
                      }`}
                      style={{ animationDelay: `${index * 0.07}s` }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`grid h-14 w-14 place-items-center rounded-[1.25rem] ${
                              isLocked ? "bg-white/[0.05] text-white/25" : theme.iconBg
                            }`}
                          >
                            {React.createElement(offer.icon, { size: 22 })}
                          </div>
                          <div>
                            <h4 className="flex items-center gap-2 text-[14px] font-bold text-white">
                              {offer.title}
                              {offer.ultraOnly && (
                                <span
                                  className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                                    isUltra ? theme.chip : "bg-white/[0.08] text-white/35"
                                  }`}
                                >
                                  Ultra
                                </span>
                              )}
                            </h4>
                            <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-white/38">
                              <span>{offer.category}</span>
                              <span>•</span>
                              <span>{offer.distance}</span>
                            </div>
                          </div>
                        </div>
                        {isLocked ? (
                          <Lock size={16} className="text-white/24" />
                        ) : (
                          <ChevronRight size={18} className="text-white/34" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-5"><div className="anim-slide-up flex flex-col gap-4 border-b border-white/[0.08] pb-5 md:flex-row md:items-end md:justify-between"><div><h2 className="text-[34px] font-bold tracking-[-0.05em]">Activity</h2><p className="mt-1 text-[13px] font-semibold text-white/42">Persona History</p></div><div className="relative w-full md:w-72"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/34" size={16} /><input type="text" placeholder="Search Activity" className="w-full rounded-full border border-white/[0.10] bg-white/[0.075] py-3 pl-11 pr-5 text-[13px] outline-none backdrop-blur-2xl transition focus:bg-white/[0.11]" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} /></div></div><div className="anim-slide-up overflow-hidden rounded-[2rem] glass-panel">{filteredActivities.length > 0 ? <div className="divide-y divide-white/[0.07]">{filteredActivities.map((item, index) => <button key={item.id} onClick={() => setSelectedTransaction(item)} className="anim-slide-up flex w-full items-center justify-between p-5 text-left transition hover:bg-white/[0.06]" style={{ animationDelay: `${index * 0.05}s` }}><div className="flex items-center gap-4"><div className={`grid h-13 w-13 place-items-center rounded-[1.2rem] ${theme.iconBg}`}>{React.createElement(item.icon, { size: 20 })}</div><div><h4 className="text-[14px] font-bold text-white">{item.title}</h4><p className="mt-1 text-[11px] font-semibold text-white/38">{item.date} • {item.category} • {item.status || "active"}</p></div></div><div className="text-right">{item.amount ? <p className="font-mono text-[13px] font-bold text-white/82">{formatMoney(item.amount)}</p> : <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/18 bg-emerald-400/[0.12] px-2.5 py-1 text-[10px] font-black text-emerald-300"><ShieldCheck size={12} /> Verified</span>}</div></button>)}</div> : <div className="py-24 text-center text-[12px] font-bold uppercase tracking-[0.24em] text-white/32">No logs found</div>}</div></div>
          )}

          {activeTab === "assist" && (
            <div className="flex flex-1 flex-col min-h-0 h-full"><div className="anim-slide-up mb-4 flex items-center gap-4 border-b border-white/[0.08] pb-4 sm:pb-5"><div className="relative"><div className={`absolute inset-0 rounded-[1.25rem] blur-xl opacity-40 ${isUltra ? "bg-[#ffd98a]" : "bg-white"}`} /><div className={`relative grid h-12 w-12 place-items-center rounded-[1.25rem] ${theme.iconBg}`}><Sparkles className={theme.accent} size={20} /></div></div><div><h3 className="text-[14px] sm:text-[15px] font-bold text-white">Persona Assist</h3><div className="mt-1 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.75)]" /><p className="text-[11px] font-bold text-emerald-300">Secured</p></div></div></div>
              <div className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto pb-4 pr-1 scrollbar-hide">{chatMessages.map((msg, index) => <div key={msg.id} className={`anim-slide-up flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`} style={{ animationDelay: `${Math.min(index * 0.06, 0.35)}s` }}>{msg.type === "text" && <div className={`max-w-[88%] sm:max-w-[82%] rounded-[1.55rem] px-4 sm:px-5 py-3 sm:py-4 text-[13px] sm:text-[14px] leading-relaxed shadow-xl ${msg.sender === "user" ? (isUltra ? "rounded-br-md bg-[#ffd98a] text-[#1c1305]" : "rounded-br-md bg-white text-[#111113]") : "rounded-tl-md glass-soft text-white/86"}`}>{msg.text}</div>}
                {msg.type === "flight_card" && <div className="w-[92%] sm:w-[86%] max-w-sm rounded-[2rem] p-4 sm:p-5 glass-panel transition hover:scale-[1.01]"><div className="mb-4 sm:mb-5 flex items-center gap-3 border-b border-white/[0.07] pb-3 sm:pb-4 text-white/42"><PlaneTakeoff size={18} className={theme.accent} /><span className="text-[11px] font-black uppercase tracking-[0.22em]">Ticket Booking</span></div><div className="mb-4 sm:mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">From</span><select value={flightFromCode} onChange={(e) => setFlightFromCode(e.target.value)} className="w-full rounded-[1.1rem] border border-white/[0.10] bg-[#111113] px-3 py-3 text-[12px] font-bold text-white outline-none">{Object.entries(groupedFlightLocations).map(([country, locs]) => <optgroup key={country} label={country} className="bg-[#111113] text-white/50 font-bold">{locs.map((loc) => <option key={loc.code} value={loc.code} className="text-white">{loc.city} ({loc.code})</option>)}</optgroup>)}</select></label><label className="space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">To</span><select value={flightToCode} onChange={(e) => setFlightToCode(e.target.value)} className="w-full rounded-[1.1rem] border border-white/[0.10] bg-[#111113] px-3 py-3 text-[12px] font-bold text-white outline-none">{Object.entries(groupedFlightLocations).map(([country, locs]) => <optgroup key={country} label={country} className="bg-[#111113] text-white/50 font-bold">{locs.map((loc) => <option key={loc.code} value={loc.code} className="text-white">{loc.city} ({loc.code})</option>)}</optgroup>)}</select></label></div><div className="mb-6 sm:mb-7 flex items-center justify-between"><div className="text-center"><h2 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.05em]">{flightFrom.code}</h2><p className="text-[10px] sm:text-[11px] font-semibold text-white/38">{flightFrom.city}</p><p className="text-[9px] sm:text-[10px] font-semibold text-white/28">{flightFrom.country}</p></div><div className="flex flex-1 items-center px-2 sm:px-5"><div className="h-px flex-1 bg-white/12" /><Plane size={16} className={`mx-2 sm:mx-3 ${theme.accent}`} /><div className="h-px flex-1 bg-white/12" /></div><div className="text-center"><h2 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.05em]">{flightTo.code}</h2><p className="text-[10px] sm:text-[11px] font-semibold text-white/38">{flightTo.city}</p><p className="text-[9px] sm:text-[10px] font-semibold text-white/28">{flightTo.country}</p></div></div><button onClick={handleFlightBooking} className={`w-full rounded-[1.25rem] py-4 text-[12px] font-bold transition active:scale-[.98] ${theme.btn}`}>Authorize Ticket</button></div>}
                {msg.type === "dining_card" && (
                  <div className="w-[92%] sm:w-[86%] max-w-sm rounded-[2rem] p-4 sm:p-5 glass-panel">
                    <div className="mb-4 sm:mb-5 flex items-center gap-3 border-b border-white/[0.07] pb-3 sm:pb-4 text-white/42">
                      <ChefHat size={18} className={theme.accent} />
                      <span className="text-[11px] font-black uppercase tracking-[0.22em]">Dining Reservation</span>
                    </div>
                    <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">City</span>
                      <select value={diningCity} onChange={(e) => { setDiningCity(e.target.value); setDiningRestaurant(DINING_OPTIONS[e.target.value][0]); }} className="w-full rounded-[1.1rem] border border-white/[0.10] bg-[#111113] px-3 py-3 text-[12px] font-bold text-white outline-none">
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">Restaurant</span>
                      <select value={diningRestaurant} onChange={(e) => setDiningRestaurant(e.target.value)} className="w-full rounded-[1.1rem] border border-white/[0.10] bg-[#111113] px-3 py-3 text-[12px] font-bold text-white outline-none">
                        {DINING_OPTIONS[diningCity].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </label>
                  </div>
                  <h3 className="mb-2 text-[20px] sm:text-[22px] font-bold tracking-[-0.04em] truncate">{diningRestaurant}</h3>
                  <p className="mb-6 sm:mb-7 flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-white/44"><MapPin size={14} className={theme.accent} /> {diningCity} • VIP Table for 2</p>
                  <button onClick={() => addActivity(`${diningRestaurant}, ${diningCity} Reservation`, "Dining", ChefHat, -PLAN_PRICE, "dining")} className={`w-full rounded-[1.25rem] py-4 text-[12px] font-bold transition active:scale-[.98] ${theme.btn}`}>Confirm Reservation</button>
                </div>
              )}
              {msg.type === "hotel_card" && (
                  <div className="w-[92%] sm:w-[86%] max-w-sm rounded-[2rem] p-4 sm:p-5 glass-panel">
                    <div className="mb-4 sm:mb-5 flex items-center gap-3 border-b border-white/[0.07] pb-3 sm:pb-4 text-white/42">
                      <Gem size={18} className={theme.accent} />
                      <span className="text-[11px] font-black uppercase tracking-[0.22em]">Hotel Stay</span>
                    </div>
                    <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">City</span>
                      <select value={hotelCity} onChange={(e) => { setHotelCity(e.target.value); setHotelName(HOTEL_OPTIONS[e.target.value][0]); }} className="w-full rounded-[1.1rem] border border-white/[0.10] bg-[#111113] px-3 py-3 text-[12px] font-bold text-white outline-none">
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">Hotel</span>
                      <select value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full rounded-[1.1rem] border border-white/[0.10] bg-[#111113] px-3 py-3 text-[12px] font-bold text-white outline-none">
                        {HOTEL_OPTIONS[hotelCity].map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </label>
                  </div>
                  <h3 className="mb-2 text-[20px] sm:text-[22px] font-bold tracking-[-0.04em] truncate">{hotelName}</h3>
                  <p className="mb-6 sm:mb-7 flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-white/44"><MapPin size={14} className={theme.accent} /> {hotelCity} • Luxury Suite</p>
                  <button onClick={() => addActivity(`${hotelName}, ${hotelCity} Suite`, "Hotel", Gem, -PLAN_PRICE, "hotel")} className={`w-full rounded-[1.25rem] py-4 text-[12px] font-bold transition active:scale-[.98] ${theme.btn}`}>Reserve Suite</button>
                </div>
              )}
              {msg.type === "support_card" && <div className="w-[92%] sm:w-[86%] max-w-sm rounded-[2rem] p-4 sm:p-5 glass-panel"><div className="mb-4 sm:mb-5 flex items-center gap-3 border-b border-white/[0.07] pb-3 sm:pb-4 text-white/42"><CalendarClock size={18} className={theme.accent} /><span className="text-[11px] font-black uppercase tracking-[0.22em]">Persona Support</span></div><h3 className="mb-2 text-[20px] sm:text-[22px] font-bold tracking-[-0.04em]">Priority Support</h3><p className="mb-6 sm:mb-7 text-[12px] sm:text-[13px] font-semibold text-white/44">Your support request will be logged instantly.</p><button onClick={() => addActivity("Priority Support Activated", "Support", CalendarClock, null, "support")} className={`w-full rounded-[1.25rem] py-4 text-[12px] font-bold transition active:scale-[.98] ${theme.btn}`}>Activate Support</button></div>}
            </div>)}
            {isTyping && <div className="flex justify-start anim-slide-up"><div className="flex items-center gap-2 rounded-[1.45rem] rounded-tl-md px-5 py-4 glass-soft"><div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" /><div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "140ms" }} /><div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "280ms" }} /></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="anim-slide-up border-t border-white/[0.08] pt-3 sm:pt-4 shrink-0"><div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{getSuggestions().map((suggestion) => <button key={suggestion} onClick={() => handleSendMessage(suggestion)} className="whitespace-nowrap rounded-full border border-white/[0.10] bg-white/[0.075] px-4 py-2.5 text-[11px] font-bold text-white/58 backdrop-blur-2xl transition hover:bg-white/[0.12] hover:text-white">{suggestion}</button>)}</div><div className="relative"><input type="text" placeholder="Ask Persona..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(chatInput); }} className="w-full rounded-[1.45rem] border border-white/[0.10] bg-white/[0.08] py-3.5 sm:py-4 pl-4 sm:pl-5 pr-14 text-[13px] sm:text-[14px] outline-none backdrop-blur-3xl transition focus:bg-white/[0.12]" /><button onClick={() => handleSendMessage(chatInput)} disabled={!chatInput.trim()} className={`absolute right-1.5 sm:right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[1.05rem] transition active:scale-95 disabled:opacity-30 ${chatInput.trim() ? `${theme.bgAccent} text-[#111113]` : "bg-white/[0.10] text-white/38"}`}><Send size={16} /></button></div></div>
        </div>
          )}
          </div>
        </main>

        <div className="pointer-events-none fixed bottom-[5.5rem] left-0 right-0 z-40 h-40 bg-gradient-to-t from-[#080910]/70 via-[#080910]/18 to-transparent" />
        
        <nav className="ios-nav-float fixed bottom-[7rem] inset-x-0 z-50 mx-auto flex h-[4.35rem] w-[88%] max-w-[24rem] items-center justify-evenly gap-1 rounded-[2.15rem] border border-white/[0.18] bg-[#09090e]/55 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.10)] backdrop-blur-[28px] backdrop-saturate-150 transition-all duration-500 ease-out sm:h-[4.55rem] sm:max-w-md lg:max-w-2xl lg:px-4 xl:max-w-3xl">
         {[{ id: "home", label: "Home", icon: LayoutGrid }, { id: "services", label: "Plan", icon: CreditCard }, { id: "assist", label: "Assist", icon: MessageSquare }, { id: "nearby", label: "Nearby", icon: MapPin }, { id: "activity", label: "Log", icon: ActivityIcon }].map((item) => { 
            const active = activeTab === item.id; 
            
            if (item.id === "assist") {
              return (
                <button key={item.id} onClick={() => setActiveTab("assist")} className={`relative z-10 grid h-[3.8rem] w-[3.8rem] sm:h-[4.2rem] sm:w-[4.2rem] shrink-0 place-items-center rounded-[1.65rem] transition duration-300 active:scale-95 ${activeTab === "assist" ? `${theme.btn} scale-[1.03]` : "bg-white/[0.10] text-white/70 border border-white/[0.08]"}`}>
                  <MessageSquare size={22} />
                  {activeTab !== "assist" && <span className={`absolute right-3.5 top-3.5 h-2 w-2 rounded-full ${isUltra ? "bg-[#ffd98a]" : "bg-white"}`} />}
                </button>
              );
            }

            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex min-w-[4rem] flex-col items-center justify-center gap-1.5 rounded-[1.4rem] px-1 py-2.5 transition-all duration-300 ${active ? "bg-white/[0.12] text-white scale-[1.03]" : "text-white/34 hover:text-white/72"}`}>
                {React.createElement(item.icon, { size: 20 })}
                {item.id === "activity" && unreadNotifications > 0 && <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-[#ffd98a]" />}
                <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
              </button>
            ); 
         })}
        </nav>
      </div>
    </div>
  );
}