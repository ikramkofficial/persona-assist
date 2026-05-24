import React, { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Bell,
  CalendarClock,
  Car,
  CheckCircle,
  ChefHat,
  ChevronRight,
  Crown,
  CreditCard,
  Eye,
  EyeOff,
  Gem,
  Globe,
  Home,
  Hotel,
  LayoutGrid,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Plane,
  PlaneTakeoff,
  Search,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
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

type TabId = "home" | "services" | "assist" | "nearby" | "activity";

type UserProfile = {
  name: string;
  email: string;
};

type RegisteredUser = {
  name: string;
  email: string;
  pin: string;
  isUltraSubscribed: boolean;
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
  type: "system" | "booking" | "refund" | "subscription";
  amount: number | null;
  date: string;
  icon: LucideIcon;
  category: string;
  ref: string;
  status: "system" | "active" | "cancelled" | "refunded";
  refundable: boolean;
};

type ChatMessage = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

type ServiceItem = {
  id: number;
  title: string;
  detail: string;
  category: string;
  icon: LucideIcon;
  ultraOnly: boolean;
};

type PrivilegeItem = {
  id: number;
  title: string;
  distance: string;
  category: string;
  icon: LucideIcon;
  ultraOnly: boolean;
};

type NotificationType =
  | "success"
  | "warning"
  | "ultra"
  | "plan"
  | "ticket"
  | "dining"
  | "hotel"
  | "support"
  | "info";

type PrestigeNotification = {
  id: number;
  title: string;
  subtitle: string;
  type: NotificationType;
  time: string;
};

const FLIGHT_LOCATIONS = [
  { code: "KHI", city: "Karachi", country: "Pakistan" },
  { code: "LHE", city: "Lahore", country: "Pakistan" },
  { code: "ISB", city: "Islamabad", country: "Pakistan" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "LHR", city: "London", country: "UK" },
  { code: "JFK", city: "New York", country: "USA" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "FCO", city: "Rome", country: "Italy" },
];

const CITIES = ["Karachi", "Lahore", "Islamabad", "Dubai", "London", "New York", "Paris", "Rome"];

const DINING_OPTIONS: Record<string, string[]> = {
  Karachi: ["Kolachi", "Cafe Flo", "Okra", "Zouk"],
  Lahore: ["Monal Lahore", "Café Aylanto", "Andaaz", "Cuckoo's Den"],
  Islamabad: ["The Monal", "Tuscany Courtyard", "Mantra", "Kabul Restaurant"],
  Dubai: ["Nusr-Et", "Pierchic", "Zuma", "At.mosphere"],
  London: ["Gordon Ramsay", "Sketch", "The Ritz", "Dishoom"],
  "New York": ["Le Bernardin", "Per Se", "Carbone", "Eleven Madison Park"],
  Paris: ["Le Jules Verne", "Septime", "Alain Ducasse", "L'Ambroisie"],
  Rome: ["La Pergola", "Roscioli", "Aroma", "Hotel Eden Dining"],
};

const HOTEL_OPTIONS: Record<string, string[]> = {
  Karachi: ["Pearl Continental", "Mövenpick", "Marriott", "Avari Towers"],
  Lahore: ["The Nishat", "Pearl Continental", "Avari", "Luxus Grand"],
  Islamabad: ["Serena Hotel", "Marriott", "Ramada", "Centaurus Suites"],
  Dubai: ["Burj Al Arab", "Atlantis The Palm", "Armani Hotel", "The Ritz-Carlton"],
  London: ["The Savoy", "The Ritz", "Claridge's", "The Dorchester"],
  "New York": ["The Plaza", "St. Regis", "Four Seasons", "The Ritz-Carlton"],
  Paris: ["Ritz Paris", "Four Seasons George V", "Le Meurice", "Hôtel de Crillon"],
  Rome: ["Hotel Hassler", "Rome Cavalieri", "Hotel Eden", "The St. Regis"],
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

const SERVICES: ServiceItem[] = [
  {
    id: 1,
    title: "Flight Ticket Booking",
    detail: "Reserve premium domestic and international flights.",
    category: "Travel",
    icon: PlaneTakeoff,
    ultraOnly: false,
  },
  {
    id: 2,
    title: "Fine Dining Reservation",
    detail: "Book premium restaurants and private dining tables.",
    category: "Dining",
    icon: ChefHat,
    ultraOnly: false,
  },
  {
    id: 3,
    title: "Luxury Hotel Stay",
    detail: "Arrange hotel rooms, suites, and VIP upgrades.",
    category: "Hotel",
    icon: Hotel,
    ultraOnly: false,
  },
  {
    id: 4,
    title: "Chauffeur Service",
    detail: "Airport pickup, executive rides, and city transport.",
    category: "Transport",
    icon: Car,
    ultraOnly: false,
  },
  {
    id: 5,
    title: "Personal Shopper",
    detail: "Luxury shopping assistance and private retail support.",
    category: "Shopping",
    icon: ShoppingBag,
    ultraOnly: false,
  },
  {
    id: 6,
    title: "Home Support Team",
    detail: "Home errands, cleaning support, and priority assistance.",
    category: "Home",
    icon: Home,
    ultraOnly: false,
  },
  {
    id: 7,
    title: "Private Security Escort",
    detail: "Ultra-only personal protection and travel escort.",
    category: "Security",
    icon: Shield,
    ultraOnly: true,
  },
  {
    id: 8,
    title: "Private Jet Charter",
    detail: "Ultra-only private aviation and executive jet support.",
    category: "Travel",
    icon: Plane,
    ultraOnly: true,
  },
  {
    id: 9,
    title: "VIP Event Access",
    detail: "Ultra-only event passes, premium seats, and private entry.",
    category: "Events",
    icon: Crown,
    ultraOnly: true,
  },
  {
    id: 10,
    title: "Global Concierge",
    detail: "Ultra-only worldwide support for premium requests.",
    category: "Global",
    icon: Globe,
    ultraOnly: true,
  },
];

const PRIVILEGES_BY_CITY: Record<string, PrivilegeItem[]> = {
  "Karachi, Pakistan": [
    { id: 1, title: "Clifton VIP Airport Transfer", distance: "15.5 km", category: "Travel", icon: PlaneTakeoff, ultraOnly: false },
    { id: 2, title: "Sea View Fine Dining", distance: "2.0 km", category: "Dining", icon: ChefHat, ultraOnly: false },
    { id: 3, title: "Luxury Chauffeur Ride", distance: "2.4 km", category: "Transport", icon: Car, ultraOnly: false },
    { id: 4, title: "Personal Shopper Dolmen", distance: "3.1 km", category: "Shopping", icon: ShoppingBag, ultraOnly: false },
    { id: 5, title: "Home Support Team", distance: "3.8 km", category: "Home", icon: Home, ultraOnly: false },
    { id: 6, title: "Private Retail Viewing", distance: "1.2 km", category: "Retail", icon: Crown, ultraOnly: true },
    { id: 7, title: "Helicopter Transfer", distance: "4.5 km", category: "Travel", icon: PlaneTakeoff, ultraOnly: true },
    { id: 8, title: "Private Security Escort", distance: "5.0 km", category: "Security", icon: Shield, ultraOnly: true },
  ],
  "Lahore, Pakistan": [
    { id: 101, title: "Premium Airport Transfer", distance: "12.0 km", category: "Travel", icon: PlaneTakeoff, ultraOnly: false },
    { id: 102, title: "MM Alam VIP Dining", distance: "3.5 km", category: "Dining", icon: ChefHat, ultraOnly: false },
    { id: 103, title: "Luxury Heritage Tour", distance: "5.4 km", category: "Events", icon: Eye, ultraOnly: false },
    { id: 104, title: "Personal Shopper Gulberg", distance: "2.1 km", category: "Shopping", icon: ShoppingBag, ultraOnly: false },
    { id: 105, title: "Security Escort DHA", distance: "1.8 km", category: "Security", icon: Shield, ultraOnly: true },
    { id: 106, title: "Polo Club Exclusive Pass", distance: "6.2 km", category: "Events", icon: Crown, ultraOnly: true },
  ],
  "Islamabad, Pakistan": [
    { id: 201, title: "Diplomatic Enclave Chauffeur", distance: "1.5 km", category: "Travel", icon: Car, ultraOnly: false },
    { id: 202, title: "Monal Priority Booking", distance: "8.0 km", category: "Dining", icon: ChefHat, ultraOnly: false },
    { id: 203, title: "Centaurus Personal Shopper", distance: "2.5 km", category: "Shopping", icon: ShoppingBag, ultraOnly: false },
    { id: 204, title: "Serena Suite Upgrade", distance: "4.1 km", category: "Hotel", icon: Gem, ultraOnly: true },
    { id: 205, title: "Private VIP Security", distance: "3.0 km", category: "Security", icon: Shield, ultraOnly: true },
  ],
  "Dubai, UAE": [
    { id: 301, title: "Burj Khalifa VIP Lounge", distance: "1.2 km", category: "Events", icon: Crown, ultraOnly: true },
    { id: 302, title: "Private Desert SUV", distance: "15.0 km", category: "Travel", icon: MapPin, ultraOnly: false },
    { id: 303, title: "Luxury Yacht Charter", distance: "5.0 km", category: "Travel", icon: Plane, ultraOnly: true },
    { id: 304, title: "7-Star Dining Booking", distance: "3.2 km", category: "Dining", icon: ChefHat, ultraOnly: false },
    { id: 305, title: "Gold Souk Escort", distance: "8.5 km", category: "Security", icon: Shield, ultraOnly: true },
  ],
  "London, UK": [
    { id: 401, title: "Heathrow VIP Fast Track", distance: "25.0 km", category: "Travel", icon: PlaneTakeoff, ultraOnly: false },
    { id: 402, title: "Michelin Star Mayfair", distance: "1.0 km", category: "Dining", icon: ChefHat, ultraOnly: false },
    { id: 403, title: "Private Security Escort", distance: "0.5 km", category: "Security", icon: Shield, ultraOnly: true },
    { id: 404, title: "West End Premium Seats", distance: "2.2 km", category: "Events", icon: CalendarClock, ultraOnly: false },
    { id: 405, title: "Harrods Private Shopper", distance: "3.5 km", category: "Shopping", icon: ShoppingBag, ultraOnly: true },
  ],
  "New York, USA": [
    { id: 501, title: "Broadway VIP Pass", distance: "0.8 km", category: "Events", icon: CalendarClock, ultraOnly: false },
    { id: 502, title: "Helicopter Transfer JFK", distance: "12.0 km", category: "Travel", icon: PlaneTakeoff, ultraOnly: true },
    { id: 503, title: "5th Ave Personal Shopper", distance: "1.5 km", category: "Shopping", icon: ShoppingBag, ultraOnly: false },
    { id: 504, title: "Exclusive Rooftop Dining", distance: "2.5 km", category: "Dining", icon: ChefHat, ultraOnly: false },
    { id: 505, title: "Private Art Gallery Tour", distance: "4.0 km", category: "Events", icon: Eye, ultraOnly: true },
  ],
  "Paris, France": [
    { id: 601, title: "Eiffel Tower Private Dining", distance: "2.1 km", category: "Dining", icon: Utensils, ultraOnly: true },
    { id: 602, title: "Louvre After-Hours Access", distance: "1.5 km", category: "Events", icon: Eye, ultraOnly: true },
    { id: 603, title: "Fashion Week Access", distance: "3.0 km", category: "Events", icon: Sparkles, ultraOnly: true },
    { id: 604, title: "Seine Private Cruise", distance: "2.8 km", category: "Travel", icon: Plane, ultraOnly: false },
    { id: 605, title: "Champs-Élysées Shopper", distance: "1.2 km", category: "Shopping", icon: ShoppingBag, ultraOnly: false },
  ],
  "Rome, Italy": [
    { id: 701, title: "Colosseum Private Access", distance: "2.0 km", category: "Events", icon: ShieldCheck, ultraOnly: false },
    { id: 702, title: "Luxury Villa Stay", distance: "10.0 km", category: "Hotel", icon: Gem, ultraOnly: true },
    { id: 703, title: "Chauffeur Amalfi Coast", distance: "45.0 km", category: "Travel", icon: Car, ultraOnly: true },
    { id: 704, title: "Vatican Secret Tour", distance: "3.5 km", category: "Events", icon: Eye, ultraOnly: true },
    { id: 705, title: "Authentic Piazza Dining", distance: "1.0 km", category: "Dining", icon: Utensils, ultraOnly: false },
  ],
};

const tabItems: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "home", label: "Home", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Sparkles },
  { id: "nearby", label: "Nearby", icon: MapPin },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

function formatMoney(amount: number | null, discrete: boolean) {
  if (amount === null) return "Verified";
  if (discrete) return "PKR **,***";
  const prefix = amount > 0 ? "+" : "-";
  return `${prefix}PKR ${Math.abs(amount).toLocaleString()}`;
}

function getNotificationIcon(type: NotificationType): LucideIcon {
  if (type === "warning") return AlertTriangle;
  if (type === "ultra") return Crown;
  if (type === "plan") return CreditCard;
  if (type === "ticket") return PlaneTakeoff;
  if (type === "dining") return ChefHat;
  if (type === "hotel") return Hotel;
  if (type === "support") return CalendarClock;
  return CheckCircle;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "", pin: "" });

  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [contentPage, setContentPage] = useState(1);

  const [walletBalance, setWalletBalance] = useState(INITIAL_BALANCE);
  const [isDiscrete, setIsDiscrete] = useState(false);
  const [isUltra, setIsUltra] = useState(false);
  const [isUltraSubscribed, setIsUltraSubscribed] = useState(false);

  const [prestigeCard, setPrestigeCard] = useState<PrestigeCard | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardInput, setNewCardInput] = useState({ number: "", expiry: "", cvv: "" });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [ultraKeyInput, setUltraKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [isAuthenticatingKey, setIsAuthenticatingKey] = useState(false);

  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notifications, setNotifications] = useState<PrestigeNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<PrestigeNotification | null>(null);

  const [currentCity, setCurrentCity] = useState("Karachi, Pakistan");
  const [activitySearch, setActivitySearch] = useState("");

  const [flightFromCode, setFlightFromCode] = useState("KHI");
  const [flightToCode, setFlightToCode] = useState("DXB");
  const [diningCity, setDiningCity] = useState("Karachi");
  const [diningRestaurant, setDiningRestaurant] = useState(DINING_OPTIONS.Karachi[0]);
  const [hotelCity, setHotelCity] = useState("Karachi");
  const [hotelName, setHotelName] = useState(HOTEL_OPTIONS.Karachi[0]);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, sender: "bot", text: "Welcome to Persona Assist. Choose a service or send a custom request." },
  ]);

  const [pendingRefundIds, setPendingRefundIds] = useState<number[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<ActivityItem | null>(null);

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

  const flightFrom = FLIGHT_LOCATIONS.find((location) => location.code === flightFromCode) || FLIGHT_LOCATIONS[0];
  const flightTo = FLIGHT_LOCATIONS.find((location) => location.code === flightToCode) || FLIGHT_LOCATIONS[3];

  const theme = useMemo(
    () =>
      isUltra
        ? {
            accent: "text-[#ffd98a]",
            btn: "bg-[linear-gradient(135deg,#fff4c7_0%,#ffd98a_48%,#b9862f_100%)] text-[#1c1305] font-black shadow-[0_18px_50px_rgba(255,217,138,0.24)]",
            chip: "bg-[#ffd98a]/15 text-[#ffd98a] border-[#ffd98a]/25",
            card: "bg-white/[0.08] border border-[#ffd98a]/20",
          }
        : {
            accent: "text-white",
            btn: "bg-white text-[#111113] font-black shadow-[0_18px_50px_rgba(255,255,255,0.14)]",
            chip: "bg-white/[0.10] text-white border-white/[0.12]",
            card: "bg-white/[0.08] border border-white/[0.12]",
          },
    [isUltra]
  );

  const filteredActivities = activities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      activity.category.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const visibleServices = SERVICES.filter((service) => !service.ultraOnly || isUltra);
  const nearbyItems = PRIVILEGES_BY_CITY[currentCity] || [];

  const getPageSize = () => {
    if (activeTab === "home") return window.innerWidth >= 1024 ? 6 : 4;
    if (activeTab === "services") return window.innerWidth >= 1024 ? 8 : 4;
    if (activeTab === "nearby") return window.innerWidth >= 1024 ? 8 : 4;
    if (activeTab === "activity") return window.innerWidth >= 1024 ? 6 : 4;
    return 4;
  };

  const getPagedItems = <T,>(items: T[]) => {
    const pageSize = getPageSize();
    const start = (contentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const getTotalPages = (totalItems: number) => Math.max(1, Math.ceil(totalItems / getPageSize()));

  const showPrestigeNotification = (payload: Omit<PrestigeNotification, "id" | "time">) => {
    const item: PrestigeNotification = {
      ...payload,
      id: Date.now(),
      time: "Just now",
    };
    setNotifications((prev) => [item, ...prev].slice(0, 20));
    setActiveNotification(item);
    window.setTimeout(() => setActiveNotification(null), 3500);
  };

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setContentPage(1);
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
      showPrestigeNotification({ title: "PIN Required", subtitle: "Enter at least 4 digits", type: "warning" });
      return;
    }

    if (isSignUp) {
      if (!name) {
        showPrestigeNotification({ title: "Name Required", subtitle: "Enter your full name", type: "warning" });
        return;
      }

      if (registeredUsers.some((user) => user.email === email)) {
        showPrestigeNotification({ title: "Account Exists", subtitle: "Use Sign In instead", type: "warning" });
        return;
      }

      const newUser: RegisteredUser = { name, email, pin, isUltraSubscribed: false };
      setRegisteredUsers((prev) => [...prev, newUser]);
      setCurrentUser({ name, email });
      setIsAuthenticated(true);
      setTimeout(() => setShowAddCardModal(true), 450);
      showPrestigeNotification({ title: "Account Created", subtitle: "Persona Assist profile secured", type: "success" });
      return;
    }

    const user = registeredUsers.find((item) => item.email === email);

    if (!user) {
      showPrestigeNotification({ title: "Signup Required", subtitle: "Create an account first", type: "warning" });
      return;
    }

    if (user.pin !== pin) {
      showPrestigeNotification({ title: "Invalid PIN", subtitle: "PIN does not match this account", type: "warning" });
      return;
    }

    setCurrentUser({ name: user.name, email: user.email });
    setIsUltraSubscribed(user.isUltraSubscribed);
    setIsAuthenticated(true);
    showPrestigeNotification({ title: "PIN Verified", subtitle: "Secure access granted", type: "success" });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab("home");
    setContentPage(1);
    setPrestigeCard(null);
    setWalletBalance(INITIAL_BALANCE);
    setIsUltra(false);
    setIsUltraSubscribed(false);
    setShowProfileModal(false);
    setFormData({ name: "", email: "", pin: "" });
  };

  const handleCardInputChange = (field: "number" | "expiry" | "cvv", value: string) => {
    let formatted = value;

    if (field === "number") {
      formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }

    if (field === "expiry") {
      formatted = value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    }

    if (field === "cvv") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
    }

    setNewCardInput((prev) => ({ ...prev, [field]: formatted }));
  };

  const saveCustomCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newCardInput.number.length < 19 || newCardInput.expiry.length < 5 || newCardInput.cvv.length < 3) {
      showPrestigeNotification({ title: "Incomplete Details", subtitle: "Enter valid card number, expiry, and CVV", type: "warning" });
      return;
    }

    setPrestigeCard({
      number: newCardInput.number,
      expiry: newCardInput.expiry,
      cvv: newCardInput.cvv,
      holder: currentUser?.name || "Persona Member",
    });

    setNewCardInput({ number: "", expiry: "", cvv: "" });
    setShowAddCardModal(false);
    showPrestigeNotification({ title: "Card Linked", subtitle: "Payment card is ready for bookings", type: "success" });
  };

  const addActivity = (
    title: string,
    category: string,
    icon: LucideIcon,
    amount: number | null = -PLAN_PRICE,
    notificationType: NotificationType = "success"
  ) => {
    const isPaidBooking = typeof amount === "number" && amount < 0;

    if (isPaidBooking && !prestigeCard) {
      setShowAddCardModal(true);
      showPrestigeNotification({ title: "Card Required", subtitle: "Add a card before booking paid services", type: "warning" });
      return;
    }

    if (isPaidBooking && walletBalance < Math.abs(amount)) {
      showPrestigeNotification({ title: "Insufficient Balance", subtitle: "Wallet balance is not enough", type: "warning" });
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
    setActiveTab("activity");
    setContentPage(1);

    showPrestigeNotification({
      title: notificationType === "ticket" ? "Ticket Authorized" : "Booking Confirmed",
      subtitle: `${title}${isPaidBooking ? ` • PKR ${Math.abs(amount).toLocaleString()} deducted` : ""}`,
      type: notificationType,
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

    const refundAmount = Math.abs(activity.amount);

    setPendingRefundIds((prev) => [...prev, activity.id]);
    setActivities((prev) =>
      prev.map((item) =>
        item.id === activity.id
          ? { ...item, status: "cancelled", title: `${item.title} Cancelled`, refundable: false }
          : item
      )
    );

    setSelectedTransaction(null);
    showPrestigeNotification({ title: "Cancellation Started", subtitle: "Refund will arrive shortly", type: "warning" });

    window.setTimeout(() => {
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
      setActivities((prev) => [refundItem, ...prev]);
      setPendingRefundIds((prev) => prev.filter((id) => id !== activity.id));
      showPrestigeNotification({ title: "Refund Completed", subtitle: `PKR ${refundAmount.toLocaleString()} returned to wallet`, type: "success" });
    }, 1800);
  };

  const handleUpgradeToUltra = () => {
    const key = ultraKeyInput.trim().toUpperCase();

    if (!key) return;

    setIsAuthenticatingKey(true);
    setKeyError("");

    window.setTimeout(() => {
      setIsAuthenticatingKey(false);

      if (!VALID_ULTRA_KEYS.includes(key)) {
        setKeyError("Invalid access key.");
        return;
      }

      if (walletBalance < ULTRA_PRICE) {
        setKeyError("Insufficient wallet balance.");
        return;
      }

      setWalletBalance((prev) => prev - ULTRA_PRICE);
      setIsUltraSubscribed(true);
      setIsUltra(true);
      setShowUpgradeModal(false);
      setUltraKeyInput("");

      const item: ActivityItem = {
        id: Date.now(),
        title: "Persona Ultra Subscription",
        type: "subscription",
        amount: -ULTRA_PRICE,
        date: "Just now",
        icon: Crown,
        category: "Subscription",
        ref: `SUB-${Math.floor(Math.random() * 9000) + 1000}-U`,
        status: "active",
        refundable: false,
      };

      setActivities((prev) => [item, ...prev]);
      showPrestigeNotification({ title: "Persona Ultra Unlocked", subtitle: "Premium tier activated", type: "ultra" });
    }, 1000);
  };

  const handleToggleUltra = () => {
    if (isUltra) {
      setIsUltra(false);
      showPrestigeNotification({ title: "Persona Basic", subtitle: "Basic mode active", type: "info" });
      return;
    }

    if (isUltraSubscribed) {
      setIsUltra(true);
      showPrestigeNotification({ title: "Persona Ultra", subtitle: "Ultra mode active", type: "ultra" });
      return;
    }

    setShowUpgradeModal(true);
  };

  const handleServiceAction = (service: ServiceItem) => {
    if (service.ultraOnly && !isUltra) {
      setShowUpgradeModal(true);
      showPrestigeNotification({ title: "Ultra Required", subtitle: "Upgrade to unlock this service", type: "ultra" });
      return;
    }

    if (service.category === "Travel") {
      setActiveTab("assist");
      setChatMessages((prev) => [...prev, { id: Date.now(), sender: "bot", text: "Flight service opened. Choose route and authorize booking." }]);
      return;
    }

    addActivity(`${service.title} Reserved`, service.category, service.icon, -PLAN_PRICE, "success");
  };

  const handleFlightBooking = () => {
    if (flightFrom.code === flightTo.code) {
      showPrestigeNotification({ title: "Route Error", subtitle: "Choose different cities", type: "warning" });
      return;
    }

    addActivity(`${flightFrom.city} to ${flightTo.city} Flight Reserved`, "Travel", Plane, -PLAN_PRICE, "ticket");
  };

  const handleDiningBooking = () => {
    addActivity(`${diningRestaurant} Dining Reserved`, "Dining", ChefHat, -PLAN_PRICE, "dining");
  };

  const handleHotelBooking = () => {
    addActivity(`${hotelName} Hotel Stay Reserved`, "Hotel", Hotel, -PLAN_PRICE, "hotel");
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { id: Date.now(), sender: "user", text };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    window.setTimeout(() => {
      const lower = text.toLowerCase();
      let response = "Persona Assist is ready. Choose Ticket Booking, Dining, Hotel, or Support.";

      if (lower.includes("flight") || lower.includes("ticket") || lower.includes("airport")) {
        response = "Flight booking is available. Select departure and destination, then authorize booking.";
      } else if (lower.includes("dining") || lower.includes("restaurant") || lower.includes("food")) {
        response = "Dining reservation is available. Choose city and restaurant below.";
      } else if (lower.includes("hotel") || lower.includes("room") || lower.includes("suite")) {
        response = "Hotel booking is available. Choose city and hotel below.";
      } else if (lower.includes("security") || lower.includes("private")) {
        response = isUltra ? "Ultra Security Division is ready. Select an Ultra security service." : "Security services require Persona Ultra.";
      } else if (lower.includes("ultra")) {
        response = "Persona Ultra unlocks private jet, VIP access, global concierge, and private security.";
      }

      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: response }]);
    }, 500);
  };

  const PageControls = ({ totalItems }: { totalItems: number }) => {
    const totalPages = getTotalPages(totalItems);

    if (totalPages <= 1) return null;

    return (
      <div className="mt-3 flex shrink-0 items-center justify-between gap-3 rounded-[1.45rem] border border-white/[0.10] bg-white/[0.06] p-2">
        <button
          type="button"
          disabled={contentPage === 1}
          onClick={() => setContentPage((prev) => Math.max(1, prev - 1))}
          className="rounded-[1.1rem] bg-white/[0.08] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 transition active:scale-95 disabled:opacity-30"
        >
          Previous
        </button>

        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
          {contentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={contentPage === totalPages}
          onClick={() => setContentPage((prev) => Math.min(totalPages, prev + 1))}
          className={`rounded-[1.1rem] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition active:scale-95 disabled:opacity-30 ${theme.btn}`}
        >
          Next
        </button>
      </div>
    );
  };

  const textFieldClass =
    "w-full rounded-[1.25rem] border border-white/[0.12] bg-white/[0.075] px-4 py-3.5 text-[14px] text-white placeholder:text-white/35 outline-none transition focus:border-white/30 focus:bg-white/[0.11]";

  const cardNumber = prestigeCard
    ? showCardDetails
      ? prestigeCard.number
      : `**** **** **** ${prestigeCard.number.slice(-4)}`
    : "No card linked";

  const currentHomeCards = [
    { title: "Membership", value: isUltra ? "Persona Ultra" : "Persona Basic", icon: Crown },
    { title: "Linked Card", value: cardNumber, icon: CreditCard },
    { title: "Active City", value: currentCity, icon: MapPin },
    { title: "Activities", value: `${activities.length} records`, icon: ActivityIcon },
    { title: "Assistant", value: "Online", icon: MessageSquare },
  ];

  const notificationIcon = activeNotification ? getNotificationIcon(activeNotification.type) : CheckCircle;
  const ActiveNotificationIcon = notificationIcon;

  if (!isAuthenticated) {
    return (
      <div className="relative flex h-[100dvh] overflow-hidden bg-[#09090f] p-4 text-white">
        <style>{`
  .font-ios {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, Segoe UI, sans-serif;
  }

  .font-luxury {
    font-family: Georgia, "Times New Roman", serif;
  }

  .glass-panel {
    background: linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.055));
    border: 1px solid rgba(255,255,255,.14);
    box-shadow: 0 30px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.10);
    backdrop-filter: blur(34px);
    -webkit-backdrop-filter: blur(34px);
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes iosNavFloat {
    0%, 100% {
      transform: translate(-50%, 0);
    }
    50% {
      transform: translate(-50%, -4px);
    }
  }

  @keyframes softAppear {
    from {
      opacity: 0;
      transform: translateY(14px) scale(.98);
      filter: blur(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes glassPulse {
    0%, 100% {
      opacity: .72;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  @keyframes notificationDrop {
    from {
      opacity: 0;
      transform: translateY(-18px) scale(.96);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes cardLift {
    from {
      opacity: 0;
      transform: translateY(18px) scale(.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .ios-nav-float {
    animation: iosNavFloat 5.5s ease-in-out infinite;
  }

  .soft-appear {
    animation: softAppear .55s cubic-bezier(.22, 1, .36, 1) both;
  }

  .glass-pulse {
    animation: glassPulse 4.5s ease-in-out infinite;
  }

  .notification-drop {
    animation: notificationDrop .45s cubic-bezier(.22, 1, .36, 1) both;
  }

  .card-lift {
    animation: cardLift .5s cubic-bezier(.22, 1, .36, 1) both;
  }
`}</style>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(132,103,255,0.22),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(255,217,138,0.16),transparent_35%)]" />

        {activeNotification && (
          <div className="fixed left-0 right-0 top-5 z-[999] flex justify-center px-4">
            <div className="flex w-full max-w-sm items-center gap-3 rounded-[1.5rem] border border-white/[0.14] bg-black/75 p-3 shadow-2xl backdrop-blur-2xl">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.10]">
                <ActiveNotificationIcon size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black">{activeNotification.title}</p>
                <p className="truncate text-[11px] font-semibold text-white/50">{activeNotification.subtitle}</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 m-auto w-full max-w-[430px] font-ios">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[1.45rem] border border-white/[0.14] bg-white/[0.10]">
              <Sparkles size={25} />
            </div>
            <h1 className="font-luxury text-[46px] leading-none tracking-[0.08em]">Persona</h1>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.36em] text-white/52">Assist</p>
          </div>

          <form onSubmit={handleAuth} className="glass-panel rounded-[2.2rem] p-6">
            <div className="mb-5 rounded-[1.4rem] border border-white/[0.08] bg-black/15 p-4">
              <p className="text-[13px] font-black">Private PIN Access</p>
              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-white/42">
                Enter secure details to continue Persona Assist.
              </p>
            </div>

            <div className="space-y-3">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Full Name"
                  className={textFieldClass}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                className={textFieldClass}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="4 Digit PIN"
                className={`${textFieldClass} text-center tracking-[0.5em]`}
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })}
              />
            </div>

            <button type="submit" className={`mt-5 w-full rounded-[1.25rem] py-3.5 text-[13px] ${theme.btn}`}>
              {isSignUp ? "Apply for Membership" : "Verify PIN"}
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp((prev) => !prev)}
              className="mt-5 w-full text-center text-[12px] font-semibold text-white/46"
            >
              {isSignUp ? "Existing member? Sign in" : "Not a member? Apply"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#080910] text-white">
      <style>{`
  .font-ios {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, Segoe UI, sans-serif;
  }

  .font-luxury {
    font-family: Georgia, "Times New Roman", serif;
  }

  .glass-panel {
    background: linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.055));
    border: 1px solid rgba(255,255,255,.14);
    box-shadow: 0 30px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.10);
    backdrop-filter: blur(34px);
    -webkit-backdrop-filter: blur(34px);
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes iosNavFloat {
    0%, 100% {
      transform: translate(-50%, 0);
    }
    50% {
      transform: translate(-50%, -4px);
    }
  }

  @keyframes softAppear {
    from {
      opacity: 0;
      transform: translateY(14px) scale(.98);
      filter: blur(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes glassPulse {
    0%, 100% {
      opacity: .72;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  @keyframes notificationDrop {
    from {
      opacity: 0;
      transform: translateY(-18px) scale(.96);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes cardLift {
    from {
      opacity: 0;
      transform: translateY(18px) scale(.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .ios-nav-float {
    animation: iosNavFloat 5.5s ease-in-out infinite;
  }

  .soft-appear {
    animation: softAppear .55s cubic-bezier(.22, 1, .36, 1) both;
  }

  .glass-pulse {
    animation: glassPulse 4.5s ease-in-out infinite;
  }

  .notification-drop {
    animation: notificationDrop .45s cubic-bezier(.22, 1, .36, 1) both;
  }

  .card-lift {
    animation: cardLift .5s cubic-bezier(.22, 1, .36, 1) both;
  }
`}</style>

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(117,93,255,0.20),transparent_30%),radial-gradient(circle_at_50%_105%,rgba(255,217,138,0.14),transparent_36%)]" />

      {activeNotification && (
        <div className="fixed left-0 right-0 top-4 z-[999] flex justify-center px-4">
          <button
            type="button"
            onClick={() => setActiveNotification(null)}
            className="flex w-full max-w-sm items-center gap-3 rounded-[1.5rem] border border-white/[0.14] bg-black/75 p-3 text-left shadow-2xl backdrop-blur-2xl"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.10]">
              <ActiveNotificationIcon size={18} className={theme.accent} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-black">{activeNotification.title}</p>
              <p className="truncate text-[11px] font-semibold text-white/50">{activeNotification.subtitle}</p>
            </div>
          </button>
        </div>
      )}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] flex-col font-ios">
        <header className="flex h-[5.5rem] shrink-0 items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14">
          <div>
            <p className="font-luxury text-[24px] leading-none tracking-[0.08em] sm:text-[30px]">Persona</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.34em] text-white/40">Assist</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotificationCenter(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/[0.10] bg-white/[0.08]"
            >
              <Bell size={17} />
              {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ffd98a]" />}
            </button>

            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.10] bg-white/[0.08]"
            >
              <User size={17} />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-28 lg:px-10 lg:pb-32 xl:px-14 scrollbar-hide scroll-smooth">
          {activeTab === "home" && (
            <section className="soft-appear flex min-h-full flex-col gap-4">
              <div className="relative mb-4 shrink-0 overflow-hidden rounded-[2.2rem] border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.055))] p-6 shadow-[0_30px_90px_rgba(0,0,0,.42)] backdrop-blur-3xl">
  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#ffd98a]/20 blur-[4rem]" />
  <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-[4rem]" />

  <div className="relative z-10 flex items-start justify-between gap-4">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/42">Persona Wallet</p>
      <h3 className="mt-3 text-[34px] font-black tracking-[-0.06em] sm:text-[44px]">
        {isDiscrete ? "PKR ***,***" : `PKR ${walletBalance.toLocaleString()}`}
      </h3>
      <p className="mt-2 text-[12px] font-semibold text-white/45">
        Available premium service balance
      </p>
    </div>

    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-[1.4rem] ${isUltra ? "bg-[#ffd98a]/15 text-[#ffd98a]" : "bg-white/[0.10] text-white"}`}>
      <CreditCard size={24} />
    </div>
  </div>

  <div className="relative z-10 mt-7 rounded-[1.7rem] border border-white/[0.10] bg-black/20 p-4">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Linked Card</p>
        <p className="mt-2 truncate text-[15px] font-black">{cardNumber}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowCardDetails((prev) => !prev)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.10] text-white/70"
      >
        {showCardDetails ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2">
      <div className="rounded-[1.1rem] bg-white/[0.07] p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Plan</p>
        <p className="mt-1 text-[12px] font-black">{isUltra ? "Ultra" : "Basic"}</p>
      </div>

      <div className="rounded-[1.1rem] bg-white/[0.07] p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Cost</p>
        <p className="mt-1 text-[12px] font-black">PKR {PLAN_PRICE.toLocaleString()}</p>
      </div>

      <div className="rounded-[1.1rem] bg-white/[0.07] p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Status</p>
        <p className="mt-1 text-[12px] font-black">Active</p>
      </div>
    </div>
  </div>

  <div className="relative z-10 mt-4 flex gap-2">
    <button
      type="button"
      onClick={() => setShowAddCardModal(true)}
      className="flex-1 rounded-[1.2rem] bg-white/[0.10] py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/70"
    >
      Add Card
    </button>

    <button
      type="button"
      onClick={handleToggleUltra}
      className={`flex-1 rounded-[1.2rem] py-3 text-[11px] font-black uppercase tracking-[0.16em] ${isUltra ? theme.btn : "bg-white/[0.10] text-white/70"}`}
    >
      {isUltra ? "Ultra Active" : "Enable Ultra"}
    </button>
  </div>
</div>

             <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                {getPagedItems(currentHomeCards).map((card) => {
                  const Icon = card.icon;

                  return (
                    <div key={card.title} className={`rounded-[1.7rem] p-4 ${theme.card}`}>
                      <div className="mb-4 grid h-11 w-11 place-items-center rounded-[1.15rem] bg-white/[0.10]">
                        <Icon size={18} className={theme.accent} />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/35">{card.title}</p>
                      <p className="mt-2 truncate text-[16px] font-black">{card.value}</p>
                    </div>
                  );
                })}
              </div>

              <PageControls totalItems={currentHomeCards.length} />
            </section>
          )}

          {activeTab === "services" && (
            <section className="flex h-full min-h-0 flex-col">
              <div className="mb-4 flex shrink-0 items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-white/40">Services</p>
                  <h2 className="mt-1 text-[28px] font-black tracking-[-0.05em]">Concierge Menu</h2>
                </div>
                <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${theme.chip}`}>
                  {isUltra ? "Ultra" : "Basic"}
                </span>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
                {getPagedItems(visibleServices).map((service) => {
                  const Icon = service.icon;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceAction(service)}
                      className="rounded-[1.7rem] border border-white/[0.12] bg-white/[0.075] p-4 text-left transition active:scale-[0.98]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-[1.15rem] bg-white/[0.10]">
                          <Icon size={18} className={theme.accent} />
                        </div>
                        {service.ultraOnly && <Crown size={16} className="text-[#ffd98a]" />}
                      </div>
                      <p className="text-[15px] font-black">{service.title}</p>
                      <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-relaxed text-white/45">{service.detail}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/32">{service.category}</span>
                        <ChevronRight size={16} className="text-white/40" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <PageControls totalItems={visibleServices.length} />
            </section>
          )}

          {activeTab === "nearby" && (
            <section className="flex h-full min-h-0 flex-col">
              <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-white/40">Nearby</p>
                  <h2 className="mt-1 text-[28px] font-black tracking-[-0.05em]">City Privileges</h2>
                </div>

                <select
                  value={currentCity}
                  onChange={(e) => {
                    setCurrentCity(e.target.value);
                    setContentPage(1);
                  }}
                  className="rounded-[1.15rem] border border-white/[0.12] bg-black/30 px-4 py-3 text-[12px] font-bold text-white outline-none"
                >
                  {PRIVILEGE_LOCATIONS.map((city) => (
                    <option key={city} value={city} className="bg-[#111]">
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
                {getPagedItems(nearbyItems).map((offer) => {
                  const Icon = offer.icon;
                  const locked = offer.ultraOnly && !isUltra;

                  return (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => {
                        if (locked) {
                          setShowUpgradeModal(true);
                          return;
                        }
                        addActivity(`${offer.title} Reserved`, offer.category, offer.icon, -PLAN_PRICE, "success");
                      }}
                      className="rounded-[1.7rem] border border-white/[0.12] bg-white/[0.075] p-4 text-left transition active:scale-[0.98]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-[1.15rem] bg-white/[0.10]">
                          <Icon size={18} className={theme.accent} />
                        </div>
                        {offer.ultraOnly && <Crown size={16} className="text-[#ffd98a]" />}
                      </div>

                      <p className="text-[15px] font-black">{offer.title}</p>
                      <p className="mt-2 text-[12px] font-bold text-white/42">{offer.distance} away</p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/32">{offer.category}</span>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${locked ? "bg-[#ffd98a]/15 text-[#ffd98a]" : "bg-white/[0.10] text-white/50"}`}>
                          {locked ? "Ultra" : "Book"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <PageControls totalItems={nearbyItems.length} />
            </section>
          )}

          {activeTab === "assist" && (
            <section className="flex h-full min-h-0 flex-col">
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-white/40">Assistant</p>
                  <h2 className="mt-1 text-[28px] font-black tracking-[-0.05em]">Persona Assist</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                  Online
                </span>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
                <div className="flex min-h-0 flex-col rounded-[1.8rem] border border-white/[0.12] bg-white/[0.075] p-3">
                  <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
                    {chatMessages.slice(-5).map((message) => (
                      <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-[1.25rem] px-4 py-3 text-[12px] font-semibold leading-relaxed ${message.sender === "user" ? theme.btn : "bg-white/[0.10] text-white/70"}`}>
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(chatInput);
                    }}
                    className="mt-3 flex shrink-0 gap-2"
                  >
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Persona Assist..."
                      className="min-w-0 flex-1 rounded-[1.15rem] border border-white/[0.10] bg-white/[0.08] px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/35"
                    />
                    <button type="submit" className={`grid h-12 w-12 place-items-center rounded-[1.15rem] ${theme.btn}`}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>

                <div className="grid min-h-0 grid-cols-1 gap-3 overflow-hidden">
                  <div className="rounded-[1.7rem] border border-white/[0.12] bg-white/[0.075] p-4">
                    <p className="mb-3 text-[13px] font-black">Flight Booking</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={flightFromCode} onChange={(e) => setFlightFromCode(e.target.value)} className="rounded-[1rem] bg-black/30 px-3 py-2.5 text-[12px] outline-none">
                        {FLIGHT_LOCATIONS.map((loc) => (
                          <option key={loc.code} value={loc.code} className="bg-[#111]">{loc.code} - {loc.city}</option>
                        ))}
                      </select>
                      <select value={flightToCode} onChange={(e) => setFlightToCode(e.target.value)} className="rounded-[1rem] bg-black/30 px-3 py-2.5 text-[12px] outline-none">
                        {FLIGHT_LOCATIONS.map((loc) => (
                          <option key={loc.code} value={loc.code} className="bg-[#111]">{loc.code} - {loc.city}</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={handleFlightBooking} className={`mt-3 w-full rounded-[1rem] py-2.5 text-[11px] ${theme.btn}`}>
                      Authorize Flight
                    </button>
                  </div>

                  <div className="rounded-[1.7rem] border border-white/[0.12] bg-white/[0.075] p-4">
                    <p className="mb-3 text-[13px] font-black">Dining / Hotel</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={diningCity}
                        onChange={(e) => {
                          setDiningCity(e.target.value);
                          setDiningRestaurant(DINING_OPTIONS[e.target.value][0]);
                        }}
                        className="rounded-[1rem] bg-black/30 px-3 py-2.5 text-[12px] outline-none"
                      >
                        {CITIES.map((city) => <option key={city} className="bg-[#111]">{city}</option>)}
                      </select>

                      <select value={diningRestaurant} onChange={(e) => setDiningRestaurant(e.target.value)} className="rounded-[1rem] bg-black/30 px-3 py-2.5 text-[12px] outline-none">
                        {DINING_OPTIONS[diningCity].map((restaurant) => <option key={restaurant} className="bg-[#111]">{restaurant}</option>)}
                      </select>

                      <select
                        value={hotelCity}
                        onChange={(e) => {
                          setHotelCity(e.target.value);
                          setHotelName(HOTEL_OPTIONS[e.target.value][0]);
                        }}
                        className="rounded-[1rem] bg-black/30 px-3 py-2.5 text-[12px] outline-none"
                      >
                        {CITIES.map((city) => <option key={city} className="bg-[#111]">{city}</option>)}
                      </select>

                      <select value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="rounded-[1rem] bg-black/30 px-3 py-2.5 text-[12px] outline-none">
                        {HOTEL_OPTIONS[hotelCity].map((hotel) => <option key={hotel} className="bg-[#111]">{hotel}</option>)}
                      </select>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={handleDiningBooking} className={`rounded-[1rem] py-2.5 text-[11px] ${theme.btn}`}>
                        Dining
                      </button>
                      <button type="button" onClick={handleHotelBooking} className={`rounded-[1rem] py-2.5 text-[11px] ${theme.btn}`}>
                        Hotel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "activity" && (
            <section className="flex h-full min-h-0 flex-col">
              <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-white/40">Records</p>
                  <h2 className="mt-1 text-[28px] font-black tracking-[-0.05em]">Activity</h2>
                </div>

                <div className="flex items-center gap-2 rounded-[1.15rem] border border-white/[0.10] bg-white/[0.08] px-3">
                  <Search size={15} className="text-white/35" />
                  <input
                    value={activitySearch}
                    onChange={(e) => {
                      setActivitySearch(e.target.value);
                      setContentPage(1);
                    }}
                    placeholder="Search"
                    className="h-11 bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden rounded-[1.8rem] border border-white/[0.12] bg-white/[0.075]">
                {getPagedItems(filteredActivities).map((item) => {
                  const Icon = item.icon;
                  const isPending = pendingRefundIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTransaction(item)}
                      className="flex w-full items-center gap-3 border-b border-white/[0.06] p-3 text-left last:border-b-0"
                    >
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.1rem] bg-white/[0.10]">
                        <Icon size={17} className={theme.accent} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-black">{item.title}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                          {item.category} • {item.date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`text-[12px] font-black ${item.amount && item.amount > 0 ? "text-emerald-300" : "text-white/75"}`}>
                          {formatMoney(item.amount, isDiscrete)}
                        </p>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                          {isPending ? "Pending" : item.status}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <PageControls totalItems={filteredActivities.length} />
            </section>
          )}
        </main>
            <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-32 bg-gradient-to-t from-[#080910]/80 via-[#080910]/20 to-transparent" />
        <nav className="ios-nav-float fixed bottom-5 left-1/2 z-50 flex h-[4.35rem] w-[92%] max-w-[24rem] -translate-x-1/2 items-center justify-evenly gap-1 rounded-[2.15rem] border border-white/[0.18] bg-[#09090e]/55 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.10)] backdrop-blur-[28px] backdrop-saturate-150 transition-all duration-500 ease-out sm:bottom-6 sm:h-[4.55rem] sm:max-w-md lg:bottom-7 lg:max-w-2xl lg:px-4 xl:max-w-3xl">
          {tabItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTab(item.id)}
                className={`flex min-w-[3.6rem] flex-col items-center justify-center gap-1.5 rounded-[1.35rem] px-2 py-2 transition lg:min-w-[6.5rem] lg:flex-row lg:px-4 ${
                  active ? "bg-white/[0.12] text-white" : "text-white/36"
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-black uppercase tracking-wider lg:text-[11px]">{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => changeTab("assist")}
            className={`grid h-[3.6rem] w-[3.6rem] shrink-0 place-items-center rounded-[1.45rem] transition lg:w-[6.5rem] ${
              activeTab === "assist" ? theme.btn : "border border-white/[0.08] bg-white/[0.10] text-white/70"
            }`}
          >
            <MessageSquare size={20} />
          </button>

          {tabItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTab(item.id)}
                className={`flex min-w-[3.6rem] flex-col items-center justify-center gap-1.5 rounded-[1.35rem] px-2 py-2 transition lg:min-w-[6.5rem] lg:flex-row lg:px-4 ${
                  active ? "bg-white/[0.12] text-white" : "text-white/36"
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-black uppercase tracking-wider lg:text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {showAddCardModal && (
        <div className="fixed inset-0 z-[700] grid h-[100dvh] place-items-center overflow-hidden bg-black/70 px-4 py-6 backdrop-blur-2xl">
          <div className="glass-panel w-full max-w-[23rem] rounded-[2rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[20px] font-black">Link Payment Card</h3>
                <p className="text-[12px] font-semibold text-white/42">Authorize bookings securely</p>
              </div>
              <button type="button" onClick={() => setShowAddCardModal(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.10]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveCustomCard} className="space-y-3">
              <input
                value={newCardInput.number}
                onChange={(e) => handleCardInputChange("number", e.target.value)}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                className={textFieldClass}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newCardInput.expiry}
                  onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  className={textFieldClass}
                />
                <input
                  value={newCardInput.cvv}
                  onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                  placeholder="CVV"
                  inputMode="numeric"
                  type="password"
                  className={textFieldClass}
                />
              </div>

              <button type="submit" className={`w-full rounded-[1.2rem] py-3.5 text-[12px] ${theme.btn}`}>
                Link Secure Card
              </button>
            </form>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[700] grid h-[100dvh] place-items-center overflow-hidden bg-black/75 px-4 py-6 backdrop-blur-2xl">
          <div className="glass-panel relative w-full max-w-[23rem] rounded-[2rem] border-[#ffd98a]/30 p-5 text-center">
            <button type="button" onClick={() => setShowUpgradeModal(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/[0.10]">
              <X size={16} />
            </button>

            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[1.4rem] border border-[#ffd98a]/20 bg-[#ffd98a]/10">
              <Crown size={28} className="text-[#ffd98a]" />
            </div>

            <h3 className="text-[22px] font-black">Persona Ultra</h3>
            <p className="mt-1 text-[12px] font-bold text-[#ffd98a]/75">PKR {ULTRA_PRICE.toLocaleString()} / month</p>

            <div className="my-5 grid gap-2 text-left">
              {["Private Jet Charters", "VIP Event Access", "Private Security Escort", "Global Concierge"].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-[1rem] border border-[#ffd98a]/10 bg-black/25 p-3">
                  <CheckCircle size={14} className="text-[#ffd98a]" />
                  <span className="text-[12px] font-bold text-white/80">{benefit}</span>
                </div>
              ))}
            </div>

            <input
              value={ultraKeyInput}
              onChange={(e) => {
                setUltraKeyInput(e.target.value.toUpperCase());
                setKeyError("");
              }}
              placeholder="ENTER ULTRA KEY"
              className="w-full rounded-[1.1rem] border border-[#ffd98a]/20 bg-black/35 px-4 py-3 text-center font-mono text-[12px] font-black tracking-[0.18em] text-[#ffd98a] outline-none placeholder:text-[#ffd98a]/30"
            />

            {keyError && <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-red-400">{keyError}</p>}

            <button
              type="button"
              disabled={isAuthenticatingKey}
              onClick={handleUpgradeToUltra}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-[1.2rem] py-3.5 text-[12px] disabled:opacity-60 ${theme.btn}`}
            >
              {isAuthenticatingKey ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
              {isAuthenticatingKey ? "Verifying" : "Authorize Upgrade"}
            </button>
          </div>
        </div>
      )}

      {showNotificationCenter && (
        <div className="fixed inset-0 z-[700] grid h-[100dvh] place-items-center overflow-hidden bg-black/70 px-4 py-6 backdrop-blur-2xl">
          <div className="glass-panel flex h-[70dvh] w-full max-w-[24rem] flex-col rounded-[2rem] p-5 sm:max-w-md">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div>
                <h3 className="text-[20px] font-black">Notifications</h3>
                <p className="text-[12px] font-semibold text-white/42">{notifications.length} latest updates</p>
              </div>
              <button type="button" onClick={() => setShowNotificationCenter(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.10]">
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
              {notifications.slice(0, 6).length === 0 ? (
                <div className="rounded-[1.4rem] bg-white/[0.06] p-7 text-center text-[12px] font-bold text-white/42">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 6).map((item) => {
                  const Icon = getNotificationIcon(item.type);

                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-[1.3rem] bg-white/[0.07] p-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.10]">
                        <Icon size={16} className={theme.accent} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-black">{item.title}</p>
                        <p className="truncate text-[10px] font-semibold text-white/42">{item.subtitle}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setNotifications([])}
              className="mt-3 shrink-0 rounded-[1.15rem] bg-white/[0.08] py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/60"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[700] grid h-[100dvh] place-items-center overflow-hidden bg-black/70 px-4 py-6 backdrop-blur-2xl">
          <div className="glass-panel w-full max-w-[23rem] rounded-[2rem] p-5 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[1.4rem] bg-white/[0.10]">
              <User size={26} />
            </div>

            <h3 className="text-[22px] font-black">{currentUser?.name || "Persona Member"}</h3>
            <p className="mt-1 text-[12px] font-semibold text-white/42">{currentUser?.email}</p>

            <div className="my-5 grid gap-2 text-left">
              <button type="button" onClick={() => setIsDiscrete((prev) => !prev)} className="flex items-center justify-between rounded-[1.2rem] bg-white/[0.07] p-4">
                <span className="text-[12px] font-black">Discrete Balance</span>
                {isDiscrete ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>

              <button type="button" onClick={() => setShowCardDetails((prev) => !prev)} className="flex items-center justify-between rounded-[1.2rem] bg-white/[0.07] p-4">
                <span className="text-[12px] font-black">Show Card Details</span>
                {showCardDetails ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>

              <button type="button" onClick={() => setShowAddCardModal(true)} className="flex items-center justify-between rounded-[1.2rem] bg-white/[0.07] p-4">
                <span className="text-[12px] font-black">Add / Replace Card</span>
                <CreditCard size={17} />
              </button>

              {prestigeCard && (
                <button
                  type="button"
                  onClick={() => {
                    setPrestigeCard(null);
                    setShowCardDetails(false);
                    showPrestigeNotification({ title: "Card Removed", subtitle: "Payment card removed", type: "warning" });
                  }}
                  className="flex items-center justify-between rounded-[1.2rem] bg-red-400/[0.10] p-4 text-red-200"
                >
                  <span className="text-[12px] font-black">Remove Card</span>
                  <Trash2 size={17} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowProfileModal(false)} className="rounded-[1.2rem] bg-white/[0.08] py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                Close
              </button>
              <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-[1.2rem] bg-red-400/[0.12] py-3 text-[11px] font-black uppercase tracking-[0.16em] text-red-200">
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 z-[700] grid h-[100dvh] place-items-center overflow-hidden bg-black/70 px-4 py-6 backdrop-blur-2xl">
          <div className="glass-panel w-full max-w-[23rem] rounded-[2rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-black">Transaction</h3>
                <p className="text-[12px] font-semibold text-white/42">{selectedTransaction.ref}</p>
              </div>
              <button type="button" onClick={() => setSelectedTransaction(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.10]">
                <X size={16} />
              </button>
            </div>

            <div className="rounded-[1.4rem] bg-white/[0.07] p-4">
              <p className="text-[15px] font-black">{selectedTransaction.title}</p>
              <p className="mt-2 text-[12px] font-bold text-white/45">{selectedTransaction.category} • {selectedTransaction.date}</p>
              <p className="mt-4 text-[20px] font-black">{formatMoney(selectedTransaction.amount, isDiscrete)}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{selectedTransaction.status}</p>
            </div>

            {selectedTransaction.refundable && selectedTransaction.status === "active" && (
              <button
                type="button"
                onClick={() => cancelBooking(selectedTransaction)}
                className="mt-4 w-full rounded-[1.2rem] bg-red-400/[0.12] py-3 text-[11px] font-black uppercase tracking-[0.16em] text-red-200"
              >
                Cancel & Refund
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}