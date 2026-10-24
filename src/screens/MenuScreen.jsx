import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { mockMenuItems, MENU_CATEGORIES, fetchMenuItems } from '../data/menu';
import { useDebounce } from '../hooks/useDebounce';
import { apiClient } from '../api/client';
import MenuItemCard from '../components/MenuItemCard';
import { APP_NAME } from '../data/brand';
import {
  Search,
  X,
  ArrowUp,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
  History,
  Sparkles,
  Heart
} from 'lucide-react-native';

export default function MenuScreen({ onNavigate }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // 1. Data fetching state
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [onlySpecials, setOnlySpecials] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 3. Favourites state array
  const [favouriteIds, setFavouriteIds] = useState(['starter_1', 'main_1']);

  // 4. Cart notification toast state
  const [toastMessage, setToastMessage] = useState(null);

  // 5. Refs
  const searchInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const renderCounterRef = useRef(0);
  renderCounterRef.current += 1;

  const recentSearchesRef = useRef(['Biryani', 'Kebab', 'Karahi']);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Load Menu (MongoDB backend + Offline fallback)
  const loadMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (simulateFailure) {
        throw new Error('Simulated network error. Please try again.');
      }

      let data = [];
      try {
        const response = await apiClient.get('/api/menu');
        if (Array.isArray(response) && response.length > 0) {
          data = response;
        } else if (response && Array.isArray(response.data) && response.data.length > 0) {
          data = response.data;
        }
      } catch (apiError) {
        console.warn('Backend API /api/menu fetch note:', apiError.message);
      }

      if (data.length === 0) {
        data = await fetchMenuItems();
      }

      setItems(data);
    } catch (err) {
      setError(err.message || 'Unable to load menu. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  }, [simulateFailure]);

  useEffect(() => {
    let isSubscribed = true;
    const executeFetch = async () => {
      try {
        await loadMenu();
      } catch (e) {
        if (isSubscribed) setError(e.message);
      }
    };
    executeFetch();
    return () => { isSubscribed = false; };
  }, [loadMenu]);

  // Update recent searches
  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 1) {
      const trimmed = debouncedSearchQuery.trim();
      const current = recentSearchesRef.current.filter(
        item => item.toLowerCase() !== trimmed.toLowerCase()
      );
      recentSearchesRef.current = [trimmed, ...current].slice(0, 5);
    }
  }, [debouncedSearchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current && searchInputRef.current.focus) {
      searchInputRef.current.focus();
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ y: 0, animated: true });
    }
    setShowBackToTop(false);
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowBackToTop(scrollY > 250);
  };

  const categoryCounts = useMemo(() => {
    const counts = { All: items.length };
    MENU_CATEGORIES.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = items.filter(i => i.category === cat).length;
      }
    });
    return counts;
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (onlyFavourites) {
      result = result.filter(item => favouriteIds.includes(item.id || item._id));
    }
    if (onlySpecials) {
      result = result.filter(item => item.isSpecial);
    }
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, selectedCategory, onlyFavourites, onlySpecials, favouriteIds, debouncedSearchQuery, sortBy]);

  const handleAddToCart = useCallback((item) => {
    addToCart(item);
    setToastMessage(`Added 1x ${item.name} to your cart`);
    setTimeout(() => setToastMessage(null), 2200);
  }, [addToCart]);

  const handleToggleFavourite = useCallback((id) => {
    setFavouriteIds(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.gold }]}>
          <Sparkles size={16} color={colors.gold} />
          <Text style={[styles.toastText, { color: colors.text }]}>{toastMessage}</Text>
        </View>
      )}

      {/* Screen Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerTitleBox}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Menu ({filteredAndSortedItems.length})
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Royal Heritage Recipes & Charcoal Grills
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={loadMenu}
            disabled={isLoading}
            style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <RefreshCw size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSimulateFailure(!simulateFailure);
              setTimeout(loadMenu, 50);
            }}
            style={[
              styles.errorToggle,
              { backgroundColor: simulateFailure ? colors.danger : colors.background, borderColor: colors.border }
            ]}
          >
            <AlertTriangle size={14} color={simulateFailure ? '#FFFFFF' : colors.textMuted} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: simulateFailure ? '#FFFFFF' : colors.textMuted }}>
              {simulateFailure ? 'Error: ON' : 'Simulate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollContainerRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search kebab, biryani, karahi, drinks..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <X size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Searches */}
        {recentSearchesRef.current.length > 0 && (
          <View style={styles.recentRow}>
            <View style={styles.recentHeader}>
              <History size={14} color={colors.textMuted} />
              <Text style={[styles.recentLabel, { color: colors.textMuted }]}>Recent:</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
              {recentSearchesRef.current.map((term, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSearchQuery(term)}
                  style={[styles.recentChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 12, color: colors.text }}>{term}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {MENU_CATEGORIES.map(category => {
            const isSelected = selectedCategory === category;
            const count = categoryCounts[category] || 0;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border
                  }
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isSelected ? (colors.onPrimary || '#FFFFFF') : colors.text
                  }}
                >
                  {category} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filter Buttons (Specials, Favourites, Sort) */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            onPress={() => setOnlySpecials(!onlySpecials)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: onlySpecials ? colors.primary : colors.surface,
                borderColor: onlySpecials ? colors.gold : colors.border
              }
            ]}
          >
            <Sparkles size={14} color={onlySpecials ? '#FFFFFF' : colors.gold} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: onlySpecials ? '#FFFFFF' : colors.text }}>
              Specials
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setOnlyFavourites(!onlyFavourites)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: onlyFavourites ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
          >
            <Heart size={14} color={onlyFavourites ? '#D4AF37' : colors.textMuted} fill={onlyFavourites ? '#D4AF37' : 'none'} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
              Favs ({favouriteIds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSortModal(!showSortModal)}
            style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <SlidersHorizontal size={14} color={colors.textMuted} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
              {sortBy === 'none' ? 'Sort' : sortBy === 'price-asc' ? 'Price ↑' : sortBy === 'price-desc' ? 'Price ↓' : 'A-Z'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort Modal Dropdown */}
        {showSortModal && (
          <View style={[styles.sortDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { key: 'none', label: 'Default Order' },
              { key: 'price-asc', label: 'Price: Low to High' },
              { key: 'price-desc', label: 'Price: High to Low' },
              { key: 'name-asc', label: 'Name: A to Z' }
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => { setSortBy(opt.key); setShowSortModal(false); }}
                style={[
                  styles.sortOption,
                  { backgroundColor: sortBy === opt.key ? (colors.tint || '#f4f4f4') : 'transparent' }
                ]}
              >
                <Text style={{ fontSize: 13, color: colors.text, fontWeight: sortBy === opt.key ? 'bold' : 'normal' }}>
                  {opt.label}
                </Text>
                {sortBy === opt.key && <Text style={{ color: colors.primary, fontWeight: 'bold' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 10 }}>Loading Delicacies...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={[styles.centerBox, styles.card, { borderColor: colors.danger, backgroundColor: colors.surface }]}>
            <AlertTriangle size={36} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Unable to Load Menu</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginVertical: 6 }}>{error}</Text>
            <TouchableOpacity onPress={loadMenu} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items List */}
        {!isLoading && !error && (
          <View style={styles.itemsList}>
            {filteredAndSortedItems.map((item) => {
              const itemId = item.id || item._id;
              return (
                <MenuItemCard
                  key={itemId}
                  item={item}
                  isFavourite={favouriteIds.includes(itemId)}
                  onAddToCart={handleAddToCart}
                  onToggleFavourite={handleToggleFavourite}
                />
              );
            })}
          </View>
        )}

        {/* Render Counter Badge (Assignment Requirement) */}
        <View style={styles.counterRow}>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>
            Showing {filteredAndSortedItems.length} of {items.length} dishes
          </Text>
          <View style={[styles.counterBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }}>
              Render Counter: #{renderCounterRef.current}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <TouchableOpacity
          onPress={scrollToTop}
          style={[styles.backToTopBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <ArrowUp size={20} color={colors.onPrimary || '#FFFFFF'} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  headerTitleBox: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { padding: 8, borderRadius: 10, borderWidth: 1 },
  errorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },
  clearBtn: { padding: 4 },
  recentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 8 },
  recentLabel: { fontSize: 12, fontWeight: '600' },
  recentList: { flexDirection: 'row', gap: 6 },
  recentChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  categoryContainer: { flexDirection: 'row', gap: 8, paddingBottom: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  actionsBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1
  },
  sortDropdown: { borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 12 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8 },
  itemsList: { gap: 14, marginTop: 8 },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { borderWidth: 1, borderRadius: 16 },
  primaryBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, marginTop: 6 },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)'
  },
  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  toast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 5
  },
  toastText: { fontSize: 12, fontWeight: '600' },
  backToTopBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 50
  }
});