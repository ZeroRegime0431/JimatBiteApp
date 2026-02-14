import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { db } from '../config/firebase';
import { getMenuItems } from '../services/database';
import type { MenuItem, Order, Review } from '../types';

import ArrowRightSvg from '../assets/Settings/icons/redarrowright.svg';
import BackArrowLeftSvg from '../assets/SideBar/icons/backarrowleft.svg';

type ItemStats = {
	menuItem: MenuItem;
	soldCount: number;
	revenue: number;
	avgRating: number;
	reviewCount: number;
};

type RestaurantGroup = {
	id: string;
	name: string;
	items: ItemStats[];
};

export default function MerchantMenuItemsPage() {
	const [loading, setLoading] = useState(true);
	const [restaurantsExpanded, setRestaurantsExpanded] = useState(true);
	const [restaurantExpandedMap, setRestaurantExpandedMap] = useState<Record<string, boolean>>({});
	const [restaurants, setRestaurants] = useState<RestaurantGroup[]>([]);

	useEffect(() => {
		loadMenuItems();
	}, []);

	const loadMenuItems = async () => {
		try {
			setLoading(true);
			const menuResult = await getMenuItems();
			const menuItems = menuResult.success && menuResult.data ? menuResult.data : [];

			const ordersSnapshot = await getDocs(collection(db, 'orders'));
			const reviewsSnapshot = await getDocs(collection(db, 'reviews'));

			const orders: Order[] = [];
			const reviews: Review[] = [];

			ordersSnapshot.forEach((docSnap) => {
				const data = docSnap.data();
				orders.push({
					...data,
					orderDate: data.orderDate?.toDate?.(),
					estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate?.(),
					actualDeliveryTime: data.actualDeliveryTime?.toDate?.(),
				} as Order);
			});

			reviewsSnapshot.forEach((docSnap) => {
				const data = docSnap.data();
				reviews.push({
					...data,
					createdAt: data.createdAt?.toDate?.(),
				} as Review);
			});

			const soldById = new Map<string, number>();
			const revenueById = new Map<string, number>();
			const soldByName = new Map<string, number>();
			const revenueByName = new Map<string, number>();

			orders.forEach((order) => {
				if (order.status !== 'delivered') return;
				order.items.forEach((item) => {
					const qty = item.quantity || 0;
					const total = (item.price || 0) * qty;
					const nameKey = item.name.toLowerCase();

					if (item.menuItemId) {
						soldById.set(item.menuItemId, (soldById.get(item.menuItemId) || 0) + qty);
						revenueById.set(item.menuItemId, (revenueById.get(item.menuItemId) || 0) + total);
					} else {
						soldByName.set(nameKey, (soldByName.get(nameKey) || 0) + qty);
						revenueByName.set(nameKey, (revenueByName.get(nameKey) || 0) + total);
					}
				});
			});

			const ratingById = new Map<string, { sum: number; count: number }>();
			const ratingByName = new Map<string, { sum: number; count: number }>();

			reviews.forEach((review) => {
				if (review.menuItemId) {
					const current = ratingById.get(review.menuItemId) || { sum: 0, count: 0 };
					ratingById.set(review.menuItemId, {
						sum: current.sum + review.rating,
						count: current.count + 1,
					});
				}

				if (review.menuItemName) {
					const nameKey = review.menuItemName.toLowerCase();
					const current = ratingByName.get(nameKey) || { sum: 0, count: 0 };
					ratingByName.set(nameKey, {
						sum: current.sum + review.rating,
						count: current.count + 1,
					});
				}
			});

			const grouped = new Map<string, RestaurantGroup>();

			menuItems.forEach((item) => {
				const restaurantKey = item.restaurantId || item.restaurantName || 'unknown';
				const restaurantName = item.restaurantName || 'Unknown Restaurant';
				const nameKey = item.name.toLowerCase();

				const soldCount = soldById.get(item.id) ?? soldByName.get(nameKey) ?? 0;
				const revenue = revenueById.get(item.id) ?? revenueByName.get(nameKey) ?? 0;
				const ratingStats = ratingById.get(item.id) || ratingByName.get(nameKey) || { sum: 0, count: 0 };
				const avgRating = ratingStats.count ? Number((ratingStats.sum / ratingStats.count).toFixed(1)) : 0;

				const stats: ItemStats = {
					menuItem: item,
					soldCount,
					revenue,
					avgRating,
					reviewCount: ratingStats.count,
				};

				if (!grouped.has(restaurantKey)) {
					grouped.set(restaurantKey, {
						id: restaurantKey,
						name: restaurantName,
						items: [],
					});
				}

				grouped.get(restaurantKey)?.items.push(stats);
			});

			const groupedArray = Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
			groupedArray.forEach((group) => {
				group.items.sort((a, b) => a.menuItem.name.localeCompare(b.menuItem.name));
			});

			const expandedMap: Record<string, boolean> = {};
			groupedArray.forEach((group) => {
				expandedMap[group.id] = true;
			});

			setRestaurants(groupedArray);
			setRestaurantExpandedMap(expandedMap);
		} catch (error) {
			console.error('Error loading menu items:', error);
		} finally {
			setLoading(false);
		}
	};

	const toggleRestaurant = (restaurantId: string) => {
		setRestaurantExpandedMap((prev) => ({
			...prev,
			[restaurantId]: !prev[restaurantId],
		}));
	};

	const formatCurrency = (value: number) => {
		return `$${value.toFixed(2)}`;
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={() => router.back()}>
					<BackArrowLeftSvg width={22} height={22} />
				</Pressable>
				<Text style={styles.headerTitle}>Menu Items</Text>
				<View style={styles.backButton} />
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<View style={styles.section}>
					<Pressable style={styles.sectionHeader} onPress={() => setRestaurantsExpanded(!restaurantsExpanded)}>
						<Text style={styles.sectionTitle}>Restaurant</Text>
						<View style={{ flex: 1 }} />
						<View style={[styles.arrowIcon, { transform: [{ rotate: restaurantsExpanded ? '90deg' : '0deg' }] }]}>
							<ArrowRightSvg width={18} height={18} />
						</View>
					</Pressable>

					{restaurantsExpanded && (
						loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#1A5D1A" />
								<Text style={styles.loadingText}>Loading menu items...</Text>
							</View>
						) : restaurants.length === 0 ? (
							<View style={styles.emptyState}>
								<Text style={styles.emptyText}>No restaurants found</Text>
							</View>
						) : (
							restaurants.map((restaurant) => (
								<View key={restaurant.id} style={styles.restaurantCard}>
									<Pressable
										style={styles.restaurantHeader}
										onPress={() => toggleRestaurant(restaurant.id)}
									>
										<Text style={styles.restaurantName}>{restaurant.name}</Text>
										<Text style={styles.itemCount}>{restaurant.items.length} items</Text>
										<View style={{ flex: 1 }} />
										<View
											style={[
												styles.arrowIcon,
												{ transform: [{ rotate: restaurantExpandedMap[restaurant.id] ? '90deg' : '0deg' }] },
											]}
										>
											<ArrowRightSvg width={18} height={18} />
										</View>
									</Pressable>

									{restaurantExpandedMap[restaurant.id] && (
										<View style={styles.itemsList}>
											{restaurant.items.map((itemStats) => (
												<Pressable
													key={itemStats.menuItem.id}
													style={styles.itemCard}
													onPress={() =>
														router.push({
															pathname: './merchant-menu-item-detail',
															params: { itemId: itemStats.menuItem.id },
														})
													}
												>
													<View style={styles.itemHeader}>
														<Text style={styles.itemName}>{itemStats.menuItem.name}</Text>
														<Text style={styles.itemPrice}>{formatCurrency(itemStats.menuItem.price)}</Text>
													</View>
													<View style={styles.itemStatsRow}>
														<Text style={styles.itemStat}>Sold: {itemStats.soldCount}</Text>
														<Text style={styles.itemStat}>Rating: {itemStats.avgRating || 'N/A'}</Text>
														<Text style={styles.itemStat}>Earned: {formatCurrency(itemStats.revenue)}</Text>
													</View>
												</Pressable>
											))}
										</View>
									)}
								</View>
							))
						)
					)}
				</View>

				<View style={{ height: 100 }} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 16,
		backgroundColor: '#F3FFCF',
	},
	backButton: {
		width: 32,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1A5D1A',
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 12,
	},
	section: {
		backgroundColor: '#fff',
		borderRadius: 14,
		padding: 16,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1A5D1A',
	},
	arrowIcon: {
		width: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingContainer: {
		paddingVertical: 24,
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 12,
		fontSize: 14,
		color: '#6B7280',
	},
	emptyState: {
		paddingVertical: 24,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 14,
		color: '#9CA3AF',
	},
	restaurantCard: {
		marginTop: 16,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		borderRadius: 12,
		backgroundColor: '#F9FAFB',
	},
	restaurantHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	restaurantName: {
		fontSize: 15,
		fontWeight: '700',
		color: '#1F2937',
	},
	itemCount: {
		marginLeft: 8,
		fontSize: 12,
		color: '#6B7280',
	},
	itemsList: {
		paddingHorizontal: 12,
		paddingBottom: 12,
	},
	itemCard: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 12,
		marginTop: 10,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	itemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	itemName: {
		fontSize: 14,
		fontWeight: '700',
		color: '#111827',
	},
	itemPrice: {
		fontSize: 13,
		fontWeight: '600',
		color: '#1A5D1A',
	},
	itemStatsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	itemStat: {
		fontSize: 11,
		color: '#6B7280',
	},
});
