import {
  ShoppingCart,
  UtensilsCrossed,
  Home,
  Car,
  Ticket,
  RefreshCcw,
  HeartPulse,
  ShoppingBag,
  Tag,
  HandCoins,
} from "lucide-react";

export const ICONS = {
  ShoppingCart,
  UtensilsCrossed,
  Home,
  Car,
  Ticket,
  RefreshCcw,
  HeartPulse,
  ShoppingBag,
  Tag,
  HandCoins,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, ...props }) {
  const Icon = ICONS[name] || Tag;
  return <Icon {...props} />;
}
