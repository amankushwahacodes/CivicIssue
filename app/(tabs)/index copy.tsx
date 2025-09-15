import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import apiService from "../../services/api"; // Adjust path based on your file structure

export default function HomeScreen() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [error, setError] = useState(null);

  const statusFilters = ["All", "Pending", "In Progress", "Resolved"];

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch complaints when filters change
  useEffect(() => {
    fetchComplaints();
  }, [debouncedQuery, selectedFilter, sortBy]);

  // Initial load
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      await apiService.checkHealth();
      console.log('Server is healthy');
    } catch (error) {
      console.warn('Server health check failed:', error.message);
      setError('Unable to connect to server. Please check your connection.');
    }
  };

  const fetchComplaints = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const filters = {
        search: debouncedQuery || undefined,
        status: selectedFilter !== "All" ? selectedFilter : undefined,
        sortBy,
        order: 'desc'
      };

      const response = await apiService.getComplaints(filters);

      if (response.success) {
        setComplaints(response.data);
        setStats(response.stats);
      } else {
        throw new Error(response.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError(error.message);
      Alert.alert(
        "Error",
        `Failed to load complaints: ${error.message}`,
        [
          { text: "Retry", onPress: () => fetchComplaints() },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComplaints(false);
    setRefreshing(false);
  }, [debouncedQuery, selectedFilter, sortBy]);

  const handleComplaintPress = useCallback((complaint) => {
    router.push(`/track/${complaint.id}`);
  }, [router]);

  // Status and priority color helpers remain the same
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Pending": return "#ff9500";
      case "In Progress": return "#007aff";
      case "Resolved": return "#34c759";
      default: return "#666";
    }
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case "High": return "#ff3b30";
      case "Medium": return "#ff9500";
      case "Low": return "#34c759";
      default: return "#666";
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString();
  }, []);

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

  const renderComplaintCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        item.priority === "High" && styles.highPriorityCard
      ]}
      onPress={() => handleComplaintPress(item)}
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.complaintId}>#{item.id}</Text>
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
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>Reported {formatDate(item.date)}</Text>
        <Text style={styles.updateText}>
          Updated {formatDate(item.lastUpdate)}
        </Text>
      </View>

      {/* Priority Indicator Bar */}
      {item.priority === "High" && (
        <View style={styles.priorityIndicator} />
      )}
    </TouchableOpacity>
  ), [handleComplaintPress, getPriorityColor, getStatusColor, formatDate]);

  const renderFilterButton = useCallback((filter) => (
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

  const renderFixedHeader = useCallback(() => (
    <View style={styles.fixedHeaderContainer}>
      {/* Title and Stats */}
      <View style={styles.titleSection}>
        <Text style={styles.header}>My Complaints</Text>
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

      {/* Connection Status */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchComplaints()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search complaints..."
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
  ), [stats, searchQuery, statusFilters, renderFilterButton, sortBy, handleSortPress, error]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedFilter !== "All"
          ? "No matching complaints found"
          : "No complaints yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try adjusting your search or filters"
          : selectedFilter !== "All"
            ? `No ${selectedFilter.toLowerCase()} complaints found`
            : "Tap the Report tab to submit your first complaint"}
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

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007aff" />
      <Text style={styles.loadingText}>Loading complaints...</Text>
    </View>
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading && complaints.length === 0) {
    return (
      <View style={styles.container}>
        {renderFixedHeader()}
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed header outside FlatList */}
      {renderFixedHeader()}

      {/* FlatList with only the complaint items */}
      <FlatList
        data={complaints}
        keyExtractor={keyExtractor}
        renderItem={renderComplaintCard}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          complaints.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007aff"]}
            tintColor="#007aff"
          />
        }
        // Performance optimizations
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
    backgroundColor: '#f5f5f5',
  },
  fixedHeaderContainer: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleSection: {
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    fontSize: 14,
    color: '#666',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#007aff',
  },
  urgentStat: {
    color: '#ff3b30',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#d32f2f',
  },
  retryText: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: 'bold',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    fontSize: 16,
  },
  filtersContainer: {
    gap: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#007aff',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  filterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  sortButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
    position: 'relative',
  },
  highPriorityCard: {
    borderLeftColor: '#ff3b30',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  complaintId: {
    fontSize: 12,
    color: '#999',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#007aff',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  updateText: {
    fontSize: 12,
    color: '#999',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#ff3b30',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});