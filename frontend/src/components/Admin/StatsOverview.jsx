import React, { useState, useEffect } from "react";
import { getAdminStats } from "../../services/api";
import "./AdminStyles/StatsOverview.css";

const StatsOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load system statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-overview">
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Loading system statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-overview">
        <div className="stats-error">
          <p>{error}</p>
          <button onClick={fetchStats} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-overview">
        <p>No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: "👥",
      color: "#4299e1",
      description: "Registered users in the system"
    },
    {
      title: "Active Users",
      value: stats.active_users,
      icon: "✅",
      color: "#48bb78",
      description: "Currently active users"
    },
    {
      title: "Total Courses",
      value: stats.total_courses,
      icon: "📚",
      color: "#ed8936",
      description: "Courses created in the system"
    },
    {
      title: "Total Events",
      value: stats.total_events,
      icon: "📅",
      color: "#9f7aea",
      description: "Events scheduled across all courses"
    },
    {
      title: "Total Announcements",
      value: stats.total_announcements,
      icon: "📢",
      color: "#f56565",
      description: "Announcements posted"
    },
    {
      title: "Total Assignments",
      value: stats.total_assignments,
      icon: "📝",
      color: "#38b2ac",
      description: "Assignments created"
    }
  ];

  return (
    <div className="stats-overview">
      <div className="stats-header">
        <h2>System Overview</h2>
        <button onClick={fetchStats} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{card.title}</h3>
              <p className="stat-value">{card.value.toLocaleString()}</p>
              <p className="stat-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-details">
        <div className="stats-section">
          <h3>Users by Role</h3>
          <div className="role-stats">
            {Object.entries(stats.users_by_role).map(([role, count]) => (
              <div key={role} className="role-stat">
                <span className="role-name">{role}</span>
                <span className="role-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h3>Authentication Methods</h3>
          <div className="auth-stats">
            {Object.entries(stats.users_by_auth_provider).map(([provider, count]) => (
              <div key={provider} className="auth-stat">
                <span className="auth-name">{provider}</span>
                <span className="auth-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview; 