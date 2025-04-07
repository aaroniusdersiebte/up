// src/renderer/components/Dashboard.js
class Dashboard {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.activeTab = 'overview'; // Default tab
      this.init();
    }
  
    init() {
      this.render();
      this.attachEventListeners();
      this.loadPlatformStatus();
    }
  
    render() {
      if (!this.container) return;
  
      this.container.innerHTML = `
        <div class="dashboard-container">
          <div class="dashboard-header">
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-value">12</div>
                <div class="stat-label">Geplante Uploads</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">4</div>
                <div class="stat-label">Heute</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">8</div>
                <div class="stat-label">Diese Woche</div>
              </div>
            </div>
            
            <div class="platform-status">
              <div class="platform-status-item" id="youtube-status">
                <div class="platform-icon platform-youtube"></div>
                <div class="status-info">
                  <div class="status-name">YouTube</div>
                  <div class="status-indicator disconnected">Nicht verbunden</div>
                </div>
              </div>
              <div class="platform-status-item" id="instagram-status">
                <div class="platform-icon platform-instagram"></div>
                <div class="status-info">
                  <div class="status-name">Instagram</div>
                  <div class="status-indicator disconnected">Nicht verbunden</div>
                </div>
              </div>
              <div class="platform-status-item" id="tiktok-status">
                <div class="platform-icon platform-tiktok"></div>
                <div class="status-info">
                  <div class="status-name">TikTok</div>
                  <div class="status-indicator disconnected">Nicht verbunden</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="platform-tabs">
            <div class="tab-buttons">
              <button id="tab-overview" class="tab-button active" data-tab="overview">Übersicht</button>
              <button id="tab-youtube" class="tab-button" data-tab="youtube">YouTube</button>
              <button id="tab-instagram" class="tab-button" data-tab="instagram">Instagram</button>
              <button id="tab-tiktok" class="tab-button" data-tab="tiktok">TikTok</button>
            </div>
            
            <div class="tab-content">
              <div id="tab-content-overview" class="tab-pane active">
                ${this.renderOverviewTab()}
              </div>
              <div id="tab-content-youtube" class="tab-pane">
                ${this.renderYouTubeTab()}
              </div>
              <div id="tab-content-instagram" class="tab-pane">
                ${this.renderInstagramTab()}
              </div>
              <div id="tab-content-tiktok" class="tab-pane">
                ${this.renderTikTokTab()}
              </div>
            </div>
          </div>
        </div>
      `;
    }
  
    renderOverviewTab() {
      return `
        <div class="overview-tab">
          <div class="section-header">
            <h3>Kürzlich hochgeladen</h3>
          </div>
          
          <div class="recent-uploads">
            <div class="video-card">
              <div class="video-thumbnail" style="background-color: #444;">
                <div class="platform-badge platform-youtube"></div>
              </div>
              <div class="video-info">
                <div class="video-title">Wöchentliches Update</div>
                <div class="video-meta">
                  <span class="upload-time">Vor 2 Tagen</span>
                  <span class="view-count">1.2K Aufrufe</span>
                </div>
              </div>
            </div>
            
            <div class="video-card">
              <div class="video-thumbnail" style="background-color: #555;">
                <div class="platform-badge platform-instagram"></div>
              </div>
              <div class="video-info">
                <div class="video-title">Behind the Scenes</div>
                <div class="video-meta">
                  <span class="upload-time">Vor 3 Tagen</span>
                  <span class="view-count">432 Aufrufe</span>
                </div>
              </div>
            </div>
            
            <div class="video-card">
              <div class="video-thumbnail" style="background-color: #666;">
                <div class="platform-badge platform-tiktok"></div>
              </div>
              <div class="video-info">
                <div class="video-title">Quick Tip</div>
                <div class="video-meta">
                  <span class="upload-time">Vor 5 Tagen</span>
                  <span class="view-count">5.8K Aufrufe</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Nächste geplante Uploads</h3>
          </div>
          
          <div class="scheduled-uploads">
            <div class="schedule-card">
              <div class="schedule-date">
                <div class="day">15</div>
                <div class="month">Mai</div>
              </div>
              <div class="schedule-info">
                <div class="schedule-title">Produkt Review</div>
                <div class="schedule-platforms">
                  <div class="platform-icon platform-youtube"></div>
                  <div class="platform-icon platform-tiktok"></div>
                </div>
              </div>
              <div class="schedule-time">15:00</div>
              <div class="schedule-status scheduled">Geplant</div>
            </div>
            
            <div class="schedule-card">
              <div class="schedule-date">
                <div class="day">18</div>
                <div class="month">Mai</div>
              </div>
              <div class="schedule-info">
                <div class="schedule-title">Tutorial: Videobearbeitung</div>
                <div class="schedule-platforms">
                  <div class="platform-icon platform-youtube"></div>
                </div>
              </div>
              <div class="schedule-time">10:00</div>
              <div class="schedule-status scheduled">Geplant</div>
            </div>
            
            <div class="schedule-card">
              <div class="schedule-date">
                <div class="day">20</div>
                <div class="month">Mai</div>
              </div>
              <div class="schedule-info">
                <div class="schedule-title">Behind the Scenes</div>
                <div class="schedule-platforms">
                  <div class="platform-icon platform-instagram"></div>
                </div>
              </div>
              <div class="schedule-time">18:00</div>
              <div class="schedule-status scheduled">Geplant</div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Kalender</h3>
          </div>
          
          <div class="mini-calendar" id="mini-calendar-container" style="height: 300px;">
            <!-- Hier wird der Kalender geladen -->
          </div>
        </div>
      `;
    }
  
    renderYouTubeTab() {
      return `
        <div class="platform-tab youtube-tab">
          <div class="platform-header">
            <div class="platform-icon platform-youtube large"></div>
            <h2>YouTube Manager</h2>
          </div>
          
          <div class="platform-stats">
            <div class="stat-card">
              <div class="stat-value">1.2K</div>
              <div class="stat-label">Abonnenten</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">8</div>
              <div class="stat-label">Videos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">5.6K</div>
              <div class="stat-label">Aufrufe</div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Deine Videos</h3>
          </div>
          
          <div class="video-list">
            <div class="video-item">
              <div class="video-thumbnail" style="background-color: #444;"></div>
              <div class="video-details">
                <div class="video-title">Wöchentliches Update</div>
                <div class="video-description">Neuigkeiten und Updates der Woche</div>
                <div class="video-meta">
                  <span class="upload-date">12. Mai 2023</span>
                  <span class="view-count">1.2K Aufrufe</span>
                  <span class="like-count">85 Likes</span>
                </div>
              </div>
              <div class="video-actions">
                <button class="action-button">Bearbeiten</button>
                <button class="action-button">Analytics</button>
              </div>
            </div>
            
            <div class="video-item">
              <div class="video-thumbnail" style="background-color: #555;"></div>
              <div class="video-details">
                <div class="video-title">Tutorial: Basics</div>
                <div class="video-description">Grundlagen für Anfänger</div>
                <div class="video-meta">
                  <span class="upload-date">5. Mai 2023</span>
                  <span class="view-count">2.5K Aufrufe</span>
                  <span class="like-count">120 Likes</span>
                </div>
              </div>
              <div class="video-actions">
                <button class="action-button">Bearbeiten</button>
                <button class="action-button">Analytics</button>
              </div>
            </div>
            
            <div class="video-item">
              <div class="video-thumbnail" style="background-color: #666;"></div>
              <div class="video-details">
                <div class="video-title">Produkt Review</div>
                <div class="video-description">Detaillierte Analyse des neuen Produkts</div>
                <div class="video-meta">
                  <span class="upload-date">28. April 2023</span>
                  <span class="view-count">1.8K Aufrufe</span>
                  <span class="like-count">95 Likes</span>
                </div>
              </div>
              <div class="video-actions">
                <button class="action-button">Bearbeiten</button>
                <button class="action-button">Analytics</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  
    renderInstagramTab() {
      return `
        <div class="platform-tab instagram-tab">
          <div class="platform-header">
            <div class="platform-icon platform-instagram large"></div>
            <h2>Instagram Manager</h2>
          </div>
          
          <div class="platform-stats">
            <div class="stat-card">
              <div class="stat-value">950</div>
              <div class="stat-label">Follower</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">12</div>
              <div class="stat-label">Beiträge</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">35</div>
              <div class="stat-label">Durchschn. Likes</div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Deine Beiträge</h3>
          </div>
          
          <div class="post-grid">
            <div class="post-item" style="background-color: #444;">
              <div class="post-info">
                <div class="post-stats">
                  <span class="like-count">52 Likes</span>
                  <span class="comment-count">8 Kommentare</span>
                </div>
                <div class="post-date">10. Mai 2023</div>
              </div>
            </div>
            
            <div class="post-item" style="background-color: #555;">
              <div class="post-info">
                <div class="post-stats">
                  <span class="like-count">38 Likes</span>
                  <span class="comment-count">3 Kommentare</span>
                </div>
                <div class="post-date">5. Mai 2023</div>
              </div>
            </div>
            
            <div class="post-item" style="background-color: #666;">
              <div class="post-info">
                <div class="post-stats">
                  <span class="like-count">45 Likes</span>
                  <span class="comment-count">12 Kommentare</span>
                </div>
                <div class="post-date">28. April 2023</div>
              </div>
            </div>
            
            <div class="post-item" style="background-color: #777;">
              <div class="post-info">
                <div class="post-stats">
                  <span class="like-count">65 Likes</span>
                  <span class="comment-count">9 Kommentare</span>
                </div>
                <div class="post-date">23. April 2023</div>
              </div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Stories</h3>
          </div>
          
          <div class="story-container">
            <div class="story-item">
              <div class="story-thumbnail" style="background-color: #444;"></div>
              <div class="story-date">Heute</div>
              <div class="story-views">125 Aufrufe</div>
            </div>
            
            <div class="story-item">
              <div class="story-thumbnail" style="background-color: #555;"></div>
              <div class="story-date">Gestern</div>
              <div class="story-views">98 Aufrufe</div>
            </div>
          </div>
        </div>
      `;
    }
  
    renderTikTokTab() {
      return `
        <div class="platform-tab tiktok-tab">
          <div class="platform-header">
            <div class="platform-icon platform-tiktok large"></div>
            <h2>TikTok Manager</h2>
          </div>
          
          <div class="platform-stats">
            <div class="stat-card">
              <div class="stat-value">2.3K</div>
              <div class="stat-label">Follower</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">15</div>
              <div class="stat-label">Videos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">12.8K</div>
              <div class="stat-label">Likes</div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Deine Videos</h3>
          </div>
          
          <div class="tiktok-grid">
            <div class="tiktok-item">
              <div class="tiktok-thumbnail" style="background-color: #444;">
                <div class="play-overlay">▶</div>
              </div>
              <div class="tiktok-info">
                <div class="tiktok-caption">Quick Tip #1</div>
                <div class="tiktok-stats">
                  <span class="view-count">5.8K</span>
                  <span class="like-count">423</span>
                  <span class="comment-count">18</span>
                </div>
              </div>
            </div>
            
            <div class="tiktok-item">
              <div class="tiktok-thumbnail" style="background-color: #555;">
                <div class="play-overlay">▶</div>
              </div>
              <div class="tiktok-info">
                <div class="tiktok-caption">Behind the Scenes</div>
                <div class="tiktok-stats">
                  <span class="view-count">3.2K</span>
                  <span class="like-count">245</span>
                  <span class="comment-count">12</span>
                </div>
              </div>
            </div>
            
            <div class="tiktok-item">
              <div class="tiktok-thumbnail" style="background-color: #666;">
                <div class="play-overlay">▶</div>
              </div>
              <div class="tiktok-info">
                <div class="tiktok-caption">Tutorial Snippet</div>
                <div class="tiktok-stats">
                  <span class="view-count">4.5K</span>
                  <span class="like-count">312</span>
                  <span class="comment-count">22</span>
                </div>
              </div>
            </div>
            
            <div class="tiktok-item">
              <div class="tiktok-thumbnail" style="background-color: #777;">
                <div class="play-overlay">▶</div>
              </div>
              <div class="tiktok-info">
                <div class="tiktok-caption">Quick Tip #2</div>
                <div class="tiktok-stats">
                  <span class="view-count">2.9K</span>
                  <span class="like-count">187</span>
                  <span class="comment-count">8</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section-header">
            <h3>Trending Hashtags</h3>
          </div>
          
          <div class="hashtag-list">
            <div class="hashtag-item">
              <div class="hashtag-name">#contentcreator</div>
              <div class="hashtag-views">2.5B Aufrufe</div>
            </div>
            
            <div class="hashtag-item">
              <div class="hashtag-name">#tutorial</div>
              <div class="hashtag-views">1.8B Aufrufe</div>
            </div>
            
            <div class="hashtag-item">
              <div class="hashtag-name">#tipps</div>
              <div class="hashtag-views">920M Aufrufe</div>
            </div>
          </div>
        </div>
      `;
    }
  
    attachEventListeners() {
      // Tab Navigation
      const tabButtons = document.querySelectorAll('.tab-button');
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabName = button.getAttribute('data-tab');
          this.switchTab(tabName);
        });
      });
      
      // Platform Status
      const platformStatusItems = document.querySelectorAll('.platform-status-item');
      platformStatusItems.forEach(item => {
        item.addEventListener('click', () => {
          const platform = item.id.split('-')[0];
          this.connectToPlatform(platform);
        });
      });
      
      // Mini Calendar
      setTimeout(() => {
        const miniCalendarContainer = document.getElementById('mini-calendar-container');
        if (miniCalendarContainer) {
          const calendar = new UploadCalendar('mini-calendar-container');
        }
      }, 0);
    }
  
    switchTab(tabName) {
      this.activeTab = tabName;
      
      // Update active tab button
      const tabButtons = document.querySelectorAll('.tab-button');
      tabButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-tab') === tabName);
      });
      
      // Update active tab content
      const tabContents = document.querySelectorAll('.tab-pane');
      tabContents.forEach(content => {
        const contentId = content.id.split('-').pop();
        content.classList.toggle('active', contentId === tabName);
      });
    }
  
    async loadPlatformStatus() {
      // In einer echten Anwendung würden wir den Status von einem Backend-Service laden
      // Für Demo-Zwecke simulieren wir die Abfrage
      
      setTimeout(() => {
        this.updatePlatformStatus('youtube', true); // YouTube verbunden
        this.updatePlatformStatus('instagram', false); // Instagram nicht verbunden
        this.updatePlatformStatus('tiktok', false); // TikTok nicht verbunden
      }, 1000);
    }
  
    updatePlatformStatus(platform, isConnected) {
      const statusElement = document.getElementById(`${platform}-status`);
      if (!statusElement) return;
      
      const statusIndicator = statusElement.querySelector('.status-indicator');
      if (statusIndicator) {
        statusIndicator.className = `status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
        statusIndicator.textContent = isConnected ? 'Verbunden' : 'Nicht verbunden';
      }
    }
  
    connectToPlatform(platform) {
      // Hier würde normalerweise der Authentifizierungsprozess gestartet werden
      // Für Demo-Zwecke simulieren wir eine erfolgreiche Verbindung
      
      alert(`Verbinde zu ${platform}...`);
      
      // Simuliere eine erfolgreiche Verbindung
      setTimeout(() => {
        this.updatePlatformStatus(platform, true);
        alert(`Erfolgreich mit ${platform} verbunden!`);
      }, 2000);
    }
  }
  
  // Exportieren für die Verwendung in anderen Dateien
  if (typeof module !== 'undefined') {
    module.exports = Dashboard;
  }