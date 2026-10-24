import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CURRENCY_SYMBOL } from '../data/brand';
import { Heart, Plus, Sparkles, Star } from 'lucide-react-native';

/**
 * MenuItemCard Component (A1 Q8 Requirement 3)
 * Built with React Native primitives (View, Text, Image, TouchableOpacity).
 * Wrapped in React.memo to prevent unnecessary re-renders when parent states change.
 */
const MenuItemCard = React.memo(function MenuItemCard({
  item,
  isFavourite,
  onAddToCart,
  onToggleFavourite
}) {
  const { colors } = useTheme();

  const itemId = item.id || item._id;

  // Verification log for viva / grading (A1 Q8 Requirement 6)
  console.log(`[RENDER] MenuItemCard re-rendered: ${item.name} (ID: ${itemId})`);

  const isAvailable = item.isAvailable !== false;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: isAvailable ? 1 : 0.6
        }
      ]}
    >
      {/* 1. Food Image & Overlay Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Daily Special Badge (A1 Q4 Requirement 5) */}
        {item.isSpecial && (
          <View
            style={[
              styles.specialBadge,
              { backgroundColor: colors.gold || '#D4AF37' }
            ]}
          >
            <Sparkles size={12} color="#2B2118" />
            <Text style={styles.specialText}>Special</Text>
          </View>
        )}

        {/* Unavailable Badge */}
        {!isAvailable && (
          <View
            style={[
              styles.specialBadge,
              { backgroundColor: colors.danger || '#ef4444' }
            ]}
          >
            <Text style={[styles.specialText, { color: '#FFFFFF' }]}>Unavailable</Text>
          </View>
        )}

        {/* Heart Favourite Toggle Button (A1 Q8 Requirement 5) */}
        <TouchableOpacity
          onPress={() => onToggleFavourite(itemId)}
          style={[
            styles.favouriteBtn,
            {
              backgroundColor: isFavourite ? colors.primary : 'rgba(255, 255, 255, 0.9)',
              borderColor: colors.border
            }
          ]}
          activeOpacity={0.8}
        >
          <Heart
            size={16}
            fill={isFavourite ? (colors.gold || '#D4AF37') : 'none'}
            color={isFavourite ? (colors.gold || '#D4AF37') : (colors.primary || '#800020')}
          />
        </TouchableOpacity>

        {/* Rating Chip */}
        {item.rating && (
          <View style={styles.ratingBadge}>
            <Star size={12} color="#D4AF37" fill="#D4AF37" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>

      {/* 2. Card Content */}
      <View style={styles.contentContainer}>
        {/* Title and Category Row */}
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {item.category && (
            <View
              style={[
                styles.categoryTag,
                {
                  backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)',
                  borderColor: colors.border
                }
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {item.category}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text
          numberOfLines={2}
          style={[styles.description, { color: colors.textMuted }]}
        >
          {item.description}
        </Text>

        {/* Price and Add to Cart Action */}
        <View style={[styles.actionRow, { borderColor: colors.border }]}>
          <View style={styles.priceBox}>
            <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
              Price
            </Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              {CURRENCY_SYMBOL} {item.price ? item.price.toLocaleString() : ''}
            </Text>
          </View>

          {/* Add to Cart button (disabled if unavailable as per A1 Q4) */}
          <TouchableOpacity
            disabled={!isAvailable}
            onPress={() => isAvailable && onAddToCart(item)}
            style={[
              styles.addToCartBtn,
              {
                backgroundColor: isAvailable ? colors.primary : colors.border
              }
            ]}
            activeOpacity={0.85}
          >
            <Plus size={14} color={isAvailable ? (colors.onPrimary || '#FFFFFF') : colors.textMuted} />
            <Text
              style={[
                styles.addToCartText,
                { color: isAvailable ? (colors.onPrimary || '#FFFFFF') : colors.textMuted }
              ]}
            >
              {isAvailable ? 'Add to Cart' : 'Sold Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default MenuItemCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#E7E5E4'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  specialBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    elevation: 3,
    zIndex: 10
  },
  specialText: {
    color: '#2B2118',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  favouriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    elevation: 3,
    zIndex: 10
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    elevation: 2,
    zIndex: 10
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2B2118'
  },
  contentContainer: {
    padding: 14
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 0.5
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600'
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1
  },
  priceBox: {
    justifyContent: 'center'
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 1
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 1
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: 'bold'
  }
});