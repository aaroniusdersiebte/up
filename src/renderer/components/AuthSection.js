// src/renderer/components/AuthSection.js
class AuthSection {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.channelInfo = null;
      this.init();
    }
  
    init() {
      this.render();
      this.attachEventListeners();
      this.checkAuthStatus();
    }
  
    render() {
      if (!this.container) return;
  
      this.container.innerHTML = `
        <div class="auth-section">
          <h3>Plattform-Verbindungen</h3>
          
          <div class="platform-connections">
            <!-- YouTube -->
            <div class="platform-connection-card" id="youtube-connection">
              <div class="platform-header">
                <div class="platform-icon platform-youtube"></div>
                <div class="platform-name">YouTube</div>
              </div>
              
              <div class="platform-status" id="youtube-status">
                <div class="status-indicator disconnected"></div>
                <span>Nicht verbunden</span>
              </div>
              
              <div class="platform-account-info" id="youtube-account-info" style="display: none;">
                <div class="account-profile">
                  <img src="" alt="Channel Profile" id="youtube-profile-image" class="profile-image">
                  <div class="account-details">
                    <div class="account-name" id="youtube-channel-name">Channel Name</div>
                    <div class="account-stats">
                      <span id="youtube-subscriber-count">0</span> Abonnenten
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="platform-actions">
                <button id="youtube-connect-btn" class="primary-button">Verbinden</button>
              </div>
            </div>
            
            <!-- Instagram -->
            <div class="platform-connection-card" id="instagram-connection">
              <div class="platform-header">
                <div class="platform-icon platform-instagram"></div>
                <div class="platform-name">Instagram</div>
              </div>
              
              <div class="platform-status" id="instagram-status">
                <div class="status-indicator disconnected"></div>
                <span>Nicht verbunden</span>
              </div>
              
              <div class="platform-account-info" id="instagram-account-info" style="display: none;">
                <div class="account-profile">
                  <div class="profile-image-placeholder"></div>
                  <div class="account-details">
                    <div class="account-name">Account Name</div>
                    <div class="account-stats">
                      <span>0</span> Follower
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="platform-actions">
                <button id="instagram-connect-btn" class="primary-button">Verbinden</button>
              </div>
            </div>
            
            <!-- TikTok -->
            <div class="platform-connection-card" id="tiktok-connection">
              <div class="platform-header">
                <div class="platform-icon platform-tiktok"></div>
                <div class="platform-name">TikTok</div>
              </div>
              
              <div class="platform-status" id="tiktok-status">
                <div class="status-indicator disconnected"></div>
                <span>Nicht verbunden</span>
              </div>
              
              <div class="platform-account-info" id="tiktok-account-info" style="display: none;">
                <div class="account-profile">
                  <div class="profile-image-placeholder"></div>
                  <div class="account-details">
                    <div class="account-name">Account Name</div>
                    <div class="account-stats">
                      <span>0</span> Follower
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="platform-actions">
                <button id="tiktok-connect-btn" class="primary-button">Verbinden</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  
    attachEventListeners() {
      // YouTube Connect Button
      const youtubeConnectBtn = document.getElementById('youtube-connect-btn');
      if (youtubeConnectBtn) {
        youtubeConnectBtn.addEventListener('click', () => this.connectYouTube());
      }
      
      // Instagram Connect Button
      const instagramConnectBtn = document.getElementById('instagram-connect-btn');
      if (instagramConnectBtn) {
        instagramConnectBtn.addEventListener('click', () => this.connectInstagram());
      }
      
      // TikTok Connect Button
      const tiktokConnectBtn = document.getElementById('tiktok-connect-btn');
      if (tiktokConnectBtn) {
        tiktokConnectBtn.addEventListener('click', () => this.connectTikTok());
      }
    }
  
    async checkAuthStatus() {
      // YouTube
      this.checkYouTubeAuth();
      
      // Instagram (Demo-Modus)
      this.updatePlatformStatus('instagram', false);
      
      // TikTok (Demo-Modus)
      this.updatePlatformStatus('tiktok', false);
    }
  
    async checkYouTubeAuth() {
      try {
        if (window.platforms && window.platforms.youtube) {
          const isAuthenticated = await window.platforms.youtube.checkAuth();
          this.updatePlatformStatus('youtube', isAuthenticated);
          
          if (isAuthenticated) {
            this.loadYouTubeChannelInfo();
          }
        } else {
          console.warn('YouTube API nicht verfügbar.');
          this.updatePlatformStatus('youtube', false);
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des YouTube-Auth-Status:', error);
        this.updatePlatformStatus('youtube', false);
      }
    }
  
    async loadYouTubeChannelInfo() {
      try {
        if (window.platforms && window.platforms.youtube && window.platforms.youtube.getChannelInfo) {
          this.showLoader('youtube-account-info');
          
          const channelInfo = await window.platforms.youtube.getChannelInfo();
          this.channelInfo = channelInfo;
          
          this.updateYouTubeUI(channelInfo);
          this.hideLoader('youtube-account-info');
        }
      } catch (error) {
        console.error('Fehler beim Laden der YouTube-Kanalinformationen:', error);
        this.hideLoader('youtube-account-info');
      }
    }
  
    updateYouTubeUI(channelInfo) {
      const accountInfo = document.getElementById('youtube-account-info');
      const channelName = document.getElementById('youtube-channel-name');
      const subscriberCount = document.getElementById('youtube-subscriber-count');
      const profileImage = document.getElementById('youtube-profile-image');
      
      if (accountInfo && channelInfo) {
        // Zeige Account-Info-Bereich
        accountInfo.style.display = 'block';
        
        // Kanalname
        if (channelName && channelInfo.snippet && channelInfo.snippet.title) {
          channelName.textContent = channelInfo.snippet.title;
        }
        
        // Abonnenten (formatiert)
        if (subscriberCount && channelInfo.statistics && channelInfo.statistics.subscriberCount) {
          const count = parseInt(channelInfo.statistics.subscriberCount, 10);
          subscriberCount.textContent = this.formatNumber(count);
        }
        
        // Profilbild
        if (profileImage && channelInfo.snippet && channelInfo.snippet.thumbnails) {
          const thumbnail = channelInfo.snippet.thumbnails.default || 
                          channelInfo.snippet.thumbnails.medium || 
                          channelInfo.snippet.thumbnails.high;
                          
          if (thumbnail && thumbnail.url) {
            profileImage.src = thumbnail.url;
            profileImage.alt = channelInfo.snippet.title || 'Channel Profile';
          } else if (channelInfo.localProfileImagePath) {
            // Falls ein lokales Profilbild vorhanden ist
            profileImage.src = channelInfo.localProfileImagePath;
          }
        }
        
        // Ändere den Button-Text
        const connectBtn = document.getElementById('youtube-connect-btn');
        if (connectBtn) {
          connectBtn.textContent = 'Trennen';
        }
      }
    }
  
    updatePlatformStatus(platform, isConnected) {
      const statusElement = document.getElementById(`${platform}-status`);
      const accountInfo = document.getElementById(`${platform}-account-info`);
      const connectBtn = document.getElementById(`${platform}-connect-btn`);
      
      if (statusElement) {
        const statusIndicator = statusElement.querySelector('.status-indicator');
        const statusText = statusElement.querySelector('span');
        
        if (statusIndicator) {
          statusIndicator.className = `status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
        }
        
        if (statusText) {
          statusText.textContent = isConnected ? 'Verbunden' : 'Nicht verbunden';
        }
      }
      
      // Account-Info nur anzeigen, wenn verbunden
      if (accountInfo) {
        accountInfo.style.display = isConnected ? 'block' : 'none';
      }
      
      // Button-Text aktualisieren
      if (connectBtn) {
        connectBtn.textContent = isConnected ? 'Trennen' : 'Verbinden';
      }
    }
  
    async connectYouTube() {
      const connectBtn = document.getElementById('youtube-connect-btn');
      if (connectBtn) {
        connectBtn.disabled = true;
        
        try {
          // Prüfe aktuellen Status
          let isConnected = false;
          if (window.platforms && window.platforms.youtube) {
            isConnected = await window.platforms.youtube.checkAuth();
          }
          
          if (isConnected) {
            // Trennen (in einer echten App: Token widerrufen oder löschen)
            alert('In einer echten App würde die Verbindung jetzt getrennt werden. Diese Demo simuliert nur eine Verbindung.');
            this.updatePlatformStatus('youtube', false);
            
            // Account-Info ausblenden
            const accountInfo = document.getElementById('youtube-account-info');
            if (accountInfo) {
              accountInfo.style.display = 'none';
            }
          } else {
            // Verbinden
            if (window.platforms && window.platforms.youtube && window.platforms.youtube.authenticate) {
              this.showLoader('youtube-connection');
              
              await window.platforms.youtube.authenticate();
              
              // Aktualisiere den Status nach erfolgreicher Authentifizierung
              this.updatePlatformStatus('youtube', true);
              
              // Lade Kanalinformationen
              await this.loadYouTubeChannelInfo();
              
              this.hideLoader('youtube-connection');
            } else {
              alert('YouTube-Authentifizierung nicht verfügbar.');
            }
          }
        } catch (error) {
          console.error('Fehler bei der YouTube-Verbindung:', error);
          alert(`Fehler bei der Verbindung: ${error.message}`);
        } finally {
          connectBtn.disabled = false;
        }
      }
    }
  
    connectInstagram() {
      alert('Instagram-Verbindung ist in dieser Demo nicht verfügbar.');
    }
  
    connectTikTok() {
      alert('TikTok-Verbindung ist in dieser Demo nicht verfügbar.');
    }
  
    showLoader(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.add('loading');
        
        // Erstelle einen Loader, falls noch nicht vorhanden
        if (!element.querySelector('.loader')) {
          const loader = document.createElement('div');
          loader.className = 'loader';
          element.appendChild(loader);
        }
      }
    }
  
    hideLoader(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.remove('loading');
        
        // Entferne den Loader
        const loader = element.querySelector('.loader');
        if (loader) {
          loader.remove();
        }
      }
    }
  
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  }
  
  // Exportieren für die Verwendung in anderen Dateien
  if (typeof module !== 'undefined') {
    module.exports = AuthSection;
  }