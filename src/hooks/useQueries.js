import { useQuery } from "@tanstack/react-query";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export function useRestaurantsQuery() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "restaurants"));
      return snap.docs.map((doc) => doc.data());
    },
  });
}

export function useMenusQuery() {
  return useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "menus"));
      return snap.docs.map((doc) => doc.data());
    },
  });
}

export function useDealsQuery() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "deals"));
      return snap.docs.map((doc) => doc.data());
    },
  });
}

export function usePromosQuery() {
  return useQuery({
    queryKey: ["promos"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "promos"));
      return snap.docs.map((doc) => doc.data());
    },
  });
}

export function useRestaurantDetailsQuery(restaurantId) {
  const { data: menus = [], isLoading: isMenusLoading } = useMenusQuery();

  const restaurantQuery = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const docRef = doc(db, "restaurants", restaurantId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data();
    },
    enabled: !!restaurantId,
  });

  const restaurant = restaurantQuery.data || null;
  const restaurantMenu = restaurant && restaurant.menu && menus.length > 0
    ? menus.filter((item) => restaurant.menu.includes(item.id))
    : [];

  return {
    restaurant,
    restaurantMenu,
    isLoading: restaurantQuery.isLoading || isMenusLoading,
    error: restaurantQuery.error,
  };
}
