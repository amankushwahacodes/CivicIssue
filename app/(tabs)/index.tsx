import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import API from "../../services/api"
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Type definition based on your schema
interface Issue {
  _id: string;
  title: string;
  description: string;
  category: "Roads" | "Lighting" | "Sanitation" | "Traffic" | "Water" | "Other";
  priority: "low" | "normal" | "high" | "critical";
  location: {
    address: string;
    ward?: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  photos: string[];
  status: "Pending" | "In Progress" | "Resolved";
  createdBy: string;
  assignedTo?: string;
  timeline: Array<{
    status: "open" | "acknowledged" | "in_progress" | "resolved" | "closed";
    by: string;
    note?: string;
    at: Date;
  }>;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function HomeScreen() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Issue[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date"); // date, priority, status

  const statusFilters = ["All", "Pending", "In Progress", "Resolved"];

  // Debounced search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/issues/me");
      setComplaints(res.data);
    } catch (err: any) {
      console.error("Error fetching complaints:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load complaints");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [])
  );

  const filteredComplaints = useMemo(() => {
    let filtered = complaints.filter(complaint => {
      const matchesSearch = complaint.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        complaint.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        complaint.location.address.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (complaint.location.ward && complaint.location.ward.toLowerCase().includes(debouncedQuery.toLowerCase()));

      const matchesFilter = selectedFilter === "All" || complaint.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });

    // Sort complaints
    return filtered.sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { "critical": 4, "high": 3, "normal": 2, "low": 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      } else {
        // Sort by createdAt (most recent first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
    });
  }, [complaints, debouncedQuery, selectedFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    highPriority: complaints.filter(c => (c.priority === "high" || c.priority === "critical") && c.status !== "Resolved").length
  }), [complaints]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchComplaints();
      Alert.alert("Refreshed", "Complaint list updated!");
    } catch (err) {
      Alert.alert("Error", "Failed to refresh complaints");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Pending": return "#ff9500";
      case "In Progress": return "#007aff";
      case "Resolved": return "#34c759";
      default: return "#666";
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case "critical": return "#ff3b30";
      case "high": return "#ff6b35";
      case "normal": return "#ff9500";
      case "low": return "#34c759";
      default: return "#666";
    }
  }, []);

  const getPriorityLabel = useCallback((priority: string) => {
    switch (priority) {
      case "critical": return "Critical";
      case "high": return "High";
      case "normal": return "Normal";
      case "low": return "Low";
      default: return "Normal";
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString();
  }, []);

  const handleComplaintPress = useCallback((complaint: Issue) => {
    router.push(`/track/${complaint._id}` as any);
  }, [router]);

  // Memoized render functions to prevent unnecessary re-renders
  const renderComplaintCard = useCallback(({ item }: { item: Issue }) => (
    <TouchableOpacity
      style={[
        styles.card,
        (item.priority === "high" || item.priority === "critical") && styles.highPriorityCard
      ]}
      onPress={() => handleComplaintPress(item)}
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.complaintId}>#{item._id.slice(-8)}</Text>
        </View>
        <View style={styles.badgeContainer}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      {/* Card Content */}
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardMeta}>
        <Text style={styles.location}>📍 {item.location.address}</Text>
        {item.location.ward && (
          <Text style={styles.ward}>Ward: {item.location.ward}</Text>
        )}
        <Text style={styles.category}>{item.category}</Text>
      </View>

      <View style={styles.priorityRow}>
        <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
          {getPriorityLabel(item.priority)} Priority
        </Text>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Reported {item.createdAt ? formatDate(item.createdAt.toString()) : 'Unknown'}
        </Text>
        <Text style={styles.updateText}>
          Updated {item.updatedAt ? formatDate(item.updatedAt.toString()) : 'Unknown'}
        </Text>
      </View>

      {/* Priority Indicator Bar */}
      {(item.priority === "high" || item.priority === "critical") && (
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
      )}
    </TouchableOpacity>
  ), [handleComplaintPress, getPriorityColor, getStatusColor, getPriorityLabel, formatDate]);

  const renderFilterButton = useCallback((filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter && styles.activeFilterText
      ]}>
        {filter}
      </Text>
      {filter !== "All" && (
        <View style={styles.filterCount}>
          <Text style={styles.filterCountText}>
            {filter === "Pending" ? stats.pending :
              filter === "In Progress" ? stats.inProgress :
                filter === "Resolved" ? stats.resolved : 0}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [selectedFilter, stats]);

  const handleSortPress = useCallback(() => {
    const sortOptions = ["date", "priority", "status"];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  }, [sortBy]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedFilter("All");
  }, []);

  // Move header outside of FlatList to prevent re-renders
  const renderFixedHeader = useCallback(() => (
    <View style={styles.fixedHeaderContainer}>
      {/* Title and Stats */}
      <View style={styles.titleSection}>
        <Text style={styles.header}>My Issues</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text> Total
          </Text>
          {stats.highPriority > 0 && (
            <Text style={[styles.statItem, styles.urgentStat]}>
              <Text style={styles.statNumber}>{stats.highPriority}</Text> High Priority
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search issues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {statusFilters.map(renderFilterButton)}
        </View>

        {/* Sort Options */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={handleSortPress}
        >
          <Text style={styles.sortButtonText}>
            Sort: {sortBy === "date" ? "📅 Date" : sortBy === "priority" ? "⚡ Priority" : "📊 Status"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [stats, searchQuery, statusFilters, renderFilterButton, sortBy, handleSortPress]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedFilter !== "All"
          ? "No matching issues found"
          : "No issues yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try adjusting your search or filters"
          : selectedFilter !== "All"
            ? `No ${selectedFilter.toLowerCase()} issues found`
            : "Tap the Report tab to submit your first issue"}
      </Text>
      {(searchQuery || selectedFilter !== "All") && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={handleClearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery, selectedFilter, handleClearFilters]);

  // Key extractor to prevent unnecessary re-renders
  const keyExtractor = useCallback((item: Issue) => item._id, []);

  return (
    <View style={styles.container}>
      {/* Fixed header outside FlatList */}
      {renderFixedHeader()}

      {/* FlatList with only the complaint items */}
      <FlatList
        data={filteredComplaints}
        keyExtractor={keyExtractor}
        renderItem={renderComplaintCard}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredComplaints.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007aff"]}
            tintColor="#007aff"
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  fixedHeaderContainer: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  urgentStat: {
    color: "#ff3b30",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    paddingRight: 45,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    position: "absolute",
    right: 15,
    top: 15,
    fontSize: 16,
  },
  filtersContainer: {
    gap: 12,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
  },
  filterCount: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  sortButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#007aff",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  highPriorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ff3b30",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  complaintId: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  ward: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: "#007aff",
    fontWeight: "500",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityRow: {
    marginBottom: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  updateText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  priorityIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderTopColor: "#ff3b30",
    borderTopRightRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: "#007aff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFiltersText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});