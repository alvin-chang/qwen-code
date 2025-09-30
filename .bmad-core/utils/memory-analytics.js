// Memory Analytics Utility for BMAD
const fs = require('fs-extra');
const path = require('path');

class MemoryAnalytics {
  constructor(memorySystem) {
    this.memorySystem = memorySystem;
    this.analyticsData = {
      usage: {},
      quality: {},
      trends: {}
    };
  }

  /**
   * Track memory usage
   * @param {string} memoryId - Memory ID
   * @param {Object} accessData - Access information
   */
  trackUsage(memoryId, accessData) {
    if (!this.analyticsData.usage[memoryId]) {
      this.analyticsData.usage[memoryId] = {
        access_count: 0,
        last_accessed: null,
        access_patterns: []
      };
    }
    
    const usage = this.analyticsData.usage[memoryId];
    usage.access_count++;
    usage.last_accessed = new Date().toISOString();
    usage.access_patterns.push({
      timestamp: new Date().toISOString(),
      agent: accessData.agent,
      context: accessData.context
    });
  }

  /**
   * Track memory quality
   * @param {string} memoryId - Memory ID
   * @param {Object} qualityData - Quality metrics
   */
  trackQuality(memoryId, qualityData) {
    if (!this.analyticsData.quality[memoryId]) {
      this.analyticsData.quality[memoryId] = {
        accuracy_score: 0,
        validation_count: 0,
        correction_count: 0,
        feedback: []
      };
    }
    
    const quality = this.analyticsData.quality[memoryId];
    
    if (qualityData.accuracy !== undefined) {
      // Update accuracy score (moving average)
      quality.accuracy_score = (
        (quality.accuracy_score * quality.validation_count) + qualityData.accuracy
      ) / (quality.validation_count + 1);
      quality.validation_count++;
    }
    
    if (qualityData.corrected) {
      quality.correction_count++;
    }
    
    if (qualityData.feedback) {
      quality.feedback.push({
        timestamp: new Date().toISOString(),
        feedback: qualityData.feedback,
        rating: qualityData.rating
      });
    }
  }

  /**
   * Track memory trends
   * @param {Object} trendData - Trend information
   */
  trackTrends(trendData) {
    const timestamp = new Date().toISOString();
    
    if (!this.analyticsData.trends.storage) {
      this.analyticsData.trends.storage = {
        history: [],
        current: {}
      };
    }
    
    // Track storage usage
    if (trendData.storage) {
      this.analyticsData.trends.storage.history.push({
        timestamp,
        ...trendData.storage
      });
      this.analyticsData.trends.storage.current = trendData.storage;
    }
    
    // Track access patterns
    if (!this.analyticsData.trends.access) {
      this.analyticsData.trends.access = {
        history: [],
        current: {}
      };
    }
    
    if (trendData.access) {
      this.analyticsData.trends.access.history.push({
        timestamp,
        ...trendData.access
      });
      this.analyticsData.trends.access.current = trendData.access;
    }
  }

  /**
   * Generate usage report
   * @param {Object} options - Report options
   * @returns {Object} Usage report
   */
  generateUsageReport(options = {}) {
    const report = {
      generated: new Date().toISOString(),
      period: options.period || 'all_time',
      metrics: {}
    };
    
    // Calculate usage metrics
    const usageData = Object.values(this.analyticsData.usage);
    
    report.metrics = {
      total_memories_accessed: usageData.length,
      total_accesses: usageData.reduce((sum, data) => sum + data.access_count, 0),
      average_accesses_per_memory: usageData.length > 0 
        ? usageData.reduce((sum, data) => sum + data.access_count, 0) / usageData.length 
        : 0,
      most_accessed: this.getMostAccessedMemories(5),
      recent_accesses: this.getRecentAccesses(10)
    };
    
    return report;
  }

  /**
   * Generate quality report
   * @param {Object} options - Report options
   * @returns {Object} Quality report
   */
  generateQualityReport(options = {}) {
    const report = {
      generated: new Date().toISOString(),
      period: options.period || 'all_time',
      metrics: {}
    };
    
    // Calculate quality metrics
    const qualityData = Object.values(this.analyticsData.quality);
    
    report.metrics = {
      total_memories_tracked: qualityData.length,
      average_accuracy: qualityData.length > 0 
        ? qualityData.reduce((sum, data) => sum + data.accuracy_score, 0) / qualityData.length 
        : 0,
      total_corrections: qualityData.reduce((sum, data) => sum + data.correction_count, 0),
      memories_needing_attention: this.getMemoriesNeedingAttention(5)
    };
    
    return report;
  }

  /**
   * Generate trends report
   * @param {Object} options - Report options
   * @returns {Object} Trends report
   */
  generateTrendsReport(options = {}) {
    const report = {
      generated: new Date().toISOString(),
      period: options.period || 'all_time',
      metrics: {}
    };
    
    // Storage trends
    if (this.analyticsData.trends.storage) {
      const storageHistory = this.analyticsData.trends.storage.history;
      report.metrics.storage = {
        current: this.analyticsData.trends.storage.current,
        growth_rate: this.calculateGrowthRate(storageHistory),
        peak_usage: this.getPeakUsage(storageHistory)
      };
    }
    
    // Access trends
    if (this.analyticsData.trends.access) {
      const accessHistory = this.analyticsData.trends.access.history;
      report.metrics.access = {
        current: this.analyticsData.trends.access.current,
        access_patterns: this.identifyAccessPatterns(accessHistory)
      };
    }
    
    return report;
  }

  /**
   * Get most accessed memories
   * @param {number} limit - Number of memories to return
   * @returns {Array} Most accessed memories
   */
  getMostAccessedMemories(limit) {
    return Object.entries(this.analyticsData.usage)
      .sort(([,a], [,b]) => b.access_count - a.access_count)
      .slice(0, limit)
      .map(([id, data]) => ({
        memory_id: id,
        access_count: data.access_count,
        last_accessed: data.last_accessed
      }));
  }

  /**
   * Get recent accesses
   * @param {number} limit - Number of accesses to return
   * @returns {Array} Recent accesses
   */
  getRecentAccesses(limit) {
    const allAccesses = [];
    
    Object.entries(this.analyticsData.usage).forEach(([memoryId, data]) => {
      data.access_patterns.forEach(access => {
        allAccesses.push({
          memory_id: memoryId,
          ...access
        });
      });
    });
    
    return allAccesses
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get memories needing attention (low quality)
   * @param {number} limit - Number of memories to return
   * @returns {Array} Memories needing attention
   */
  getMemoriesNeedingAttention(limit) {
    return Object.entries(this.analyticsData.quality)
      .filter(([,data]) => data.accuracy_score < 0.7 || data.correction_count > 3)
      .sort(([,a], [,b]) => {
        // Sort by lowest accuracy first, then most corrections
        if (a.accuracy_score !== b.accuracy_score) {
          return a.accuracy_score - b.accuracy_score;
        }
        return b.correction_count - a.correction_count;
      })
      .slice(0, limit)
      .map(([id, data]) => ({
        memory_id: id,
        accuracy_score: data.accuracy_score,
        correction_count: data.correction_count
      }));
  }

  /**
   * Calculate growth rate from history data
   * @param {Array} history - History data
   * @returns {number} Growth rate
   */
  calculateGrowthRate(history) {
    if (history.length < 2) return 0;
    
    const first = history[0];
    const last = history[history.length - 1];
    
    const timeDiff = new Date(last.timestamp) - new Date(first.timestamp);
    const valueDiff = last.total_size - first.total_size;
    
    if (timeDiff === 0) return 0;
    
    // Return growth rate per day
    const days = timeDiff / (1000 * 60 * 60 * 24);
    return days > 0 ? (valueDiff / days) : 0;
  }

  /**
   * Get peak usage from history data
   * @param {Array} history - History data
   * @returns {Object} Peak usage data
   */
  getPeakUsage(history) {
    if (history.length === 0) return null;
    
    return history.reduce((peak, current) => {
      return (current.total_size > (peak.total_size || 0)) ? current : peak;
    });
  }

  /**
   * Identify access patterns
   * @param {Array} history - Access history
   * @returns {Object} Pattern analysis
   */
  identifyAccessPatterns(history) {
    if (history.length === 0) return {};
    
    // Simple pattern detection - in a real implementation, you might use
    // more sophisticated time series analysis
    const patterns = {
      increasing: false,
      decreasing: false,
      cyclical: false
    };
    
    if (history.length >= 3) {
      const first = history[0].access_count;
      const middle = history[Math.floor(history.length / 2)].access_count;
      const last = history[history.length - 1].access_count;
      
      patterns.increasing = last > first;
      patterns.decreasing = last < first;
      patterns.cyclical = (middle > first && middle > last) || (middle < first && middle < last);
    }
    
    return patterns;
  }

  /**
   * Save analytics data
   * @param {string} filePath - File path to save to
   */
  async saveAnalytics(filePath) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, this.analyticsData, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save analytics: ${error.message}`);
    }
  }

  /**
   * Load analytics data
   * @param {string} filePath - File path to load from
   */
  async loadAnalytics(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        this.analyticsData = await fs.readJson(filePath);
      }
    } catch (error) {
      throw new Error(`Failed to load analytics: ${error.message}`);
    }
  }

  /**
   * Get analytics data
   * @returns {Object} Analytics data
   */
  getAnalyticsData() {
    return { ...this.analyticsData };
  }

  /**
   * Clear analytics data
   */
  clearAnalytics() {
    this.analyticsData = {
      usage: {},
      quality: {},
      trends: {}
    };
  }
}

module.exports = MemoryAnalytics;