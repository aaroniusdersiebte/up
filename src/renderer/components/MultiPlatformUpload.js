// src/renderer/components/MultiPlatformUpload.js
class MultiPlatformUpload {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.videoFile = null;
      this.thumbnailFile = null;
      this.uploadInProgress = false;
      this.selectedPlatforms = [];
      this.scheduledDate = null;
      this.init();
    }
  
    init() {
      this.render();
      this.attachEventListeners();
    }
  
    render() {
      if (!this.container) return;
  
      this.container.innerHTML = `
        <div class="upload-form">
          <h2>Video auf mehreren Plattformen hochladen</h2>
          
          <div class="form-section">
            <h3>1. Video auswählen</h3>
            <div class="file-drop-area" id="video-drop-area">
              <div class="file-message">Video hierher ziehen oder</div>
              <button id="select-video-btn" class="secondary-button">Video auswählen</button>
              <div id="selected-video-info" class="selected-file-info"></div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>2. Plattformen auswählen</h3>
            <div class="platform-selection">
              <div class="platform-item">
                <input type="checkbox" id="platform-youtube" name="platform" value="youtube" checked>
                <label for="platform-youtube">
                  <div class="platform-icon platform-youtube"></div>
                  <span>YouTube</span>
                </label>
              </div>
              <div class="platform-item">
                <input type="checkbox" id="platform-instagram" name="platform" value="instagram">
                <label for="platform-instagram">
                  <div class="platform-icon platform-instagram"></div>
                  <span>Instagram</span>
                </label>
              </div>
              <div class="platform-item">
                <input type="checkbox" id="platform-tiktok" name="platform" value="tiktok">
                <label for="platform-tiktok">
                  <div class="platform-icon platform-tiktok"></div>
                  <span>TikTok</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>3. Video-Details</h3>
            <div class="form-group">
              <label for="video-title">Titel*</label>
              <input type="text" id="video-title" class="form-control" placeholder="Gib deinem Video einen Namen" required>
            </div>
            
            <div class="form-group">
              <label for="video-description">Beschreibung</label>
              <textarea id="video-description" class="form-control" rows="4" placeholder="Beschreibe dein Video (Unterstützt Links, Hashtags und Timestamps)"></textarea>
            </div>
            
            <div class="form-group">
              <label for="video-tags">Tags (mit Komma getrennt)</label>
              <input type="text" id="video-tags" class="form-control" placeholder="tag1, tag2, tag3">
            </div>
          </div>
          
          <div class="form-section">
            <h3>4. Thumbnail</h3>
            <div class="thumbnail-section">
              <div class="thumbnail-preview" id="thumbnail-preview">
                <div class="thumbnail-placeholder">Keine Vorschau</div>
              </div>
              <button id="select-thumbnail-btn" class="secondary-button">Thumbnail auswählen</button>
            </div>
          </div>
          
          <div class="form-section">
            <h3>5. Zeitplan</h3>
            <div class="form-group">
              <label for="publish-option">Veröffentlichungsoption</label>
              <select id="publish-option" class="form-control">
                <option value="now">Sofort veröffentlichen</option>
                <option value="scheduled">Geplante Veröffentlichung</option>
              </select>
            </div>
            
            <div id="schedule-options" style="display: none;">
              <div class="form-group">
                <label for="schedule-date">Datum</label>
                <input type="date" id="schedule-date" class="form-control" min="${new Date().toISOString().split('T')[0]}">
              </div>
              
              <div class="form-group">
                <label for="schedule-time">Uhrzeit</label>
                <input type="time" id="schedule-time" class="form-control">
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>6. Plattform-spezifische Einstellungen</h3>
            
            <div id="youtube-settings" class="platform-settings">
              <h4>YouTube</h4>
              <div class="form-group">
                <label for="privacy-setting">Sichtbarkeit</label>
                <select id="privacy-setting" class="form-control">
                  <option value="private">Privat</option>
                  <option value="unlisted">Nicht gelistet</option>
                  <option value="public">Öffentlich</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="video-category">Kategorie</label>
                <select id="video-category" class="form-control">
                  <option value="1">Film & Animation</option>
                  <option value="2">Autos & Fahrzeuge</option>
                  <option value="10">Musik</option>
                  <option value="15">Tiere</option>
                  <option value="17">Sport</option>
                  <option value="20">Gaming</option>
                  <option value="22" selected>Menschen & Blogs</option>
                  <option value="23">Komödie</option>
                  <option value="24">Unterhaltung</option>
                  <option value="25">Nachrichten & Politik</option>
                  <option value="26">Praktische Tipps & Styling</option>
                  <option value="27">Bildung</option>
                  <option value="28">Wissenschaft & Technik</option>
                </select>
              </div>
            </div>
            
            <div id="instagram-settings" class="platform-settings" style="display: none;">
              <h4>Instagram</h4>
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="instagram-feed" name="instagram-feed" checked>
                  Im Feed posten
                </label>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="instagram-reels" name="instagram-reels">
                  Als Reels posten
                </label>
              </div>
            </div>
            
            <div id="tiktok-settings" class="platform-settings" style="display: none;">
              <h4>TikTok</h4>
              <div class="form-group">
                <label for="tiktok-privacy">Sichtbarkeit</label>
                <select id="tiktok-privacy" class="form-control">
                  <option value="public">Öffentlich</option>
                  <option value="friends">Nur Freunde</option>
                  <option value="private">Privat</option>
                </select>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="tiktok-comments" name="tiktok-comments" checked>
                  Kommentare erlauben
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button id="cancel-upload-btn" class="cancel-button">Abbrechen</button>
            <button id="start-upload-btn" class="primary-button" disabled>Hochladen starten</button>
          </div>
        </div>
      `;
    }
  
    attachEventListeners() {
      // Video auswählen
      const selectVideoBtn = document.getElementById('select-video-btn');
      if (selectVideoBtn) {
        selectVideoBtn.addEventListener('click', () => this.handleSelectVideo());
      }
      
      // Thumbnail auswählen
      const selectThumbnailBtn = document.getElementById('select-thumbnail-btn');
      if (selectThumbnailBtn) {
        selectThumbnailBtn.addEventListener('click', () => this.handleSelectThumbnail());
      }
      
      // Plattformen Toggle
      const platformCheckboxes = document.querySelectorAll('input[name="platform"]');
      platformCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => this.togglePlatformSettings());
      });
      
      // Veröffentlichungsoption
      const publishOption = document.getElementById('publish-option');
      if (publishOption) {
        publishOption.addEventListener('change', () => this.toggleScheduleOptions());
      }
      
      // Upload starten
      const startUploadBtn = document.getElementById('start-upload-btn');
      const videoTitle = document.getElementById('video-title');
      if (startUploadBtn && videoTitle) {
        videoTitle.addEventListener('input', () => {
          startUploadBtn.disabled = !videoTitle.value.trim() || !this.videoFile;
        });
        
        startUploadBtn.addEventListener('click', () => this.startUpload());
      }
      
      // Upload abbrechen
      const cancelUploadBtn = document.getElementById('cancel-upload-btn');
      if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => this.cancelUpload());
      }
      
      // Drag & Drop für Videos
      const dropArea = document.getElementById('video-drop-area');
      if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        });
        
        dropArea.addEventListener('dragenter', () => dropArea.classList.add('drag-over'));
        dropArea.addEventListener('dragover', () => dropArea.classList.add('drag-over'));
        dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
        dropArea.addEventListener('drop', (e) => {
          dropArea.classList.remove('drag-over');
          const files = e.dataTransfer.files;
          if (files.length) {
            this.handleDroppedVideo(files[0]);
          }
        });
      }
    }
    
    togglePlatformSettings() {
      // Sammle ausgewählte Plattformen
      this.selectedPlatforms = Array.from(
        document.querySelectorAll('input[name="platform"]:checked')
      ).map(input => input.value);
      
      // Zeige/verstecke entsprechende Einstellungen
      document.getElementById('youtube-settings').style.display = 
        this.selectedPlatforms.includes('youtube') ? 'block' : 'none';
        
      document.getElementById('instagram-settings').style.display = 
        this.selectedPlatforms.includes('instagram') ? 'block' : 'none';
        
      document.getElementById('tiktok-settings').style.display = 
        this.selectedPlatforms.includes('tiktok') ? 'block' : 'none';
    }
    
    toggleScheduleOptions() {
      const publishOption = document.getElementById('publish-option');
      const scheduleOptions = document.getElementById('schedule-options');
      
      if (publishOption && scheduleOptions) {
        scheduleOptions.style.display = 
          publishOption.value === 'scheduled' ? 'block' : 'none';
      }
    }
    
    async handleSelectVideo() {
      try {
        // Im realen Szenario verwenden wir die Electron-API über das Preload-Script
        if (window.youtube && window.youtube.selectVideo) {
          const result = await window.youtube.selectVideo();
          
          if (!result.canceled) {
            this.videoFile = {
              name: result.fileName,
              path: result.filePath
            };
            
            this.updateVideoInfo();
          }
        } else {
          // Fallback für Test-Zwecke - simuliere Dateiauswahl
          this.simulateFileSelection('video');
        }
      } catch (error) {
        console.error('Error selecting video:', error);
        alert('Fehler beim Auswählen des Videos.');
      }
    }
    
    handleDroppedVideo(file) {
      // Stelle sicher, dass es sich um ein Video handelt
      if (file.type.startsWith('video/')) {
        this.videoFile = {
          name: file.name,
          path: file.path || URL.createObjectURL(file),
          size: this.formatFileSize(file.size),
          file: file // Speichere das File-Objekt für Browser-Umgebungen
        };
        
        this.updateVideoInfo();
      } else {
        alert('Bitte wähle eine gültige Videodatei aus!');
      }
    }
    
    updateVideoInfo() {
      const fileInfo = document.getElementById('selected-video-info');
      const startUploadBtn = document.getElementById('start-upload-btn');
      const videoTitle = document.getElementById('video-title');
      
      if (fileInfo && this.videoFile) {
        fileInfo.innerHTML = `
          <div class="file-icon">📹</div>
          <div class="file-details">
            <div class="file-name">${this.videoFile.name}</div>
            <div class="file-meta">${this.videoFile.size || ''}</div>
          </div>
        `;
      }
      
      if (startUploadBtn && videoTitle) {
        startUploadBtn.disabled = !videoTitle.value.trim();
      }
    }
    
    async handleSelectThumbnail() {
      try {
        if (window.youtube && window.youtube.selectThumbnail) {
          const result = await window.youtube.selectThumbnail();
          
          if (!result.canceled) {
            this.thumbnailFile = {
              name: result.fileName,
              path: result.filePath
            };
            
            this.updateThumbnailPreview();
          }
        } else {
          // Fallback für Test-Zwecke
          this.simulateFileSelection('image');
        }
      } catch (error) {
        console.error('Error selecting thumbnail:', error);
        alert('Fehler beim Auswählen des Thumbnails.');
      }
    }
    
    updateThumbnailPreview() {
      const thumbnailPreview = document.getElementById('thumbnail-preview');
      
      if (thumbnailPreview && this.thumbnailFile) {
        thumbnailPreview.innerHTML = `
          <div class="thumbnail-img">
            <div class="placeholder-thumbnail" style="background-color: var(--accent-color);">
              <span>Thumbnail: ${this.thumbnailFile.name}</span>
            </div>
          </div>
        `;
      }
    }
    
    simulateFileSelection(type) {
      // Diese Methode simuliert eine Dateiauswahl für Testzwecke
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type === 'video' ? 'video/*' : 'image/*';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (type === 'video') {
          this.videoFile = {
            name: file.name,
            path: URL.createObjectURL(file),
            size: this.formatFileSize(file.size),
            file: file
          };
          
          this.updateVideoInfo();
        } else {
          this.thumbnailFile = {
            name: file.name,
            path: URL.createObjectURL(file),
            file: file
          };
          
          this.updateThumbnailPreview();
        }
      };
      
      input.click();
    }
    
    getFormData() {
      const data = {
        title: document.getElementById('video-title').value,
        description: document.getElementById('video-description').value,
        tags: document.getElementById('video-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
        platforms: this.selectedPlatforms,
        scheduledPublish: document.getElementById('publish-option').value === 'scheduled'
      };
      
      // Sammle geplantes Datum, wenn vorhanden
      if (data.scheduledPublish) {
        const date = document.getElementById('schedule-date').value;
        const time = document.getElementById('schedule-time').value;
        if (date && time) {
          data.publishAt = new Date(`${date}T${time}`);
        }
      }
      
      // Platform-spezifische Daten
      if (data.platforms.includes('youtube')) {
        data.youtube = {
          privacy: document.getElementById('privacy-setting').value,
          categoryId: document.getElementById('video-category').value
        };
      }
      
      if (data.platforms.includes('instagram')) {
        data.instagram = {
          postToFeed: document.getElementById('instagram-feed').checked,
          postToReels: document.getElementById('instagram-reels').checked
        };
      }
      
      if (data.platforms.includes('tiktok')) {
        data.tiktok = {
          privacy: document.getElementById('tiktok-privacy').value,
          allowComments: document.getElementById('tiktok-comments').checked
        };
      }
      
      return data;
    }
    
    startUpload() {
      if (!this.videoFile) {
        alert('Bitte wähle ein Video aus!');
        return;
      }
      
      if (this.selectedPlatforms.length === 0) {
        alert('Bitte wähle mindestens eine Plattform aus!');
        return;
      }
      
      const formData = this.getFormData();
      console.log('Uploading with data:', formData);
      
      // Zeige das Upload-Overlay
      this.showUploadOverlay();
      
      // Simuliere den Upload für Testzwecke
      this.simulateUpload();
    }
    
    showUploadOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'upload-overlay';
      overlay.id = 'upload-overlay';
      
      // Generiere Plattform-Icons basierend auf ausgewählten Plattformen
      const platformIcons = this.selectedPlatforms.map(platform => 
        `<div class="platform-icon platform-${platform}"></div>`
      ).join('');
      
      overlay.innerHTML = `
        <div class="overlay-container">
          <div class="overlay-close" id="overlay-close">×</div>
          <h2>Video wird hochgeladen</h2>
          
          <div class="selected-platforms">
            ${platformIcons}
          </div>
          
          <div class="progress-section">
            <div class="progress-circle">
              <svg class="progress-svg" viewBox="0 0 100 100">
                <circle class="progress-circle-bg" cx="50" cy="50" r="48"></circle>
                <circle class="progress-circle-fill" cx="50" cy="50" r="48"></circle>
              </svg>
              <div class="progress-percentage">0%</div>
            </div>
            
            <div class="progress-details">
              <div class="upload-file">${this.videoFile.name}</div>
              <div class="upload-status">Uploading...</div>
              <div class="upload-time">Initialisiere...</div>
            </div>
          </div>
          
          <div class="platform-progress">
            ${this.selectedPlatforms.map(platform => `
              <div class="platform-progress-item">
                <div class="platform-icon platform-${platform}"></div>
                <div class="platform-status" id="${platform}-status">Warte...</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      // Schließen-Button-Funktionalität
      const closeBtn = document.getElementById('overlay-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          if (confirm('Möchtest du den Upload wirklich abbrechen?')) {
            this.cancelUpload();
          }
        });
      }
    }
    
    simulateUpload() {
      this.uploadInProgress = true;
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += 1;
        
        this.updateUploadProgress({
          progress: progress,
          status: progress < 100 ? 'Uploading...' : 'Processing...',
          timeRemaining: `Etwa ${Math.floor((100 - progress) / 10)} Minuten verbleibend`
        });
        
        // Simuliere verschiedene Plattform-Status
        if (progress === 30) {
          this.updatePlatformStatus('youtube', 'Wird hochgeladen...');
        } else if (progress === 50) {
          this.updatePlatformStatus('instagram', 'Wird hochgeladen...');
        } else if (progress === 60) {
          this.updatePlatformStatus('tiktok', 'Wird hochgeladen...');
        } else if (progress === 80) {
          this.updatePlatformStatus('youtube', 'Wird verarbeitet...');
        } else if (progress === 90) {
          this.updatePlatformStatus('instagram', 'Veröffentlicht!');
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            this.handleUploadSuccess();
          }, 1000);
        }
      }, 100);
    }
    
    updateUploadProgress(data) {
      const progressCircle = document.querySelector('.progress-circle-fill');
      const progressText = document.querySelector('.progress-percentage');
      const uploadStatus = document.querySelector('.upload-status');
      const uploadTime = document.querySelector('.upload-time');
      
      if (progressCircle && progressText) {
        const dashOffset = 301 - (301 * data.progress / 100);
        progressCircle.style.strokeDashoffset = dashOffset;
        progressText.textContent = `${Math.round(data.progress)}%`;
        
        if (uploadStatus) {
          uploadStatus.textContent = data.status;
        }
        
        if (uploadTime) {
          uploadTime.textContent = data.timeRemaining;
        }
      }
    }
    
    updatePlatformStatus(platform, status) {
      const statusElement = document.getElementById(`${platform}-status`);
      if (statusElement) {
        statusElement.textContent = status;
        
        // Füge eine Klasse hinzu, um den Status visuell hervorzuheben
        if (status.includes('Veröffentlicht')) {
          statusElement.classList.add('status-success');
        } else if (status.includes('Fehler')) {
          statusElement.classList.add('status-error');
        }
      }
    }
    
    handleUploadSuccess() {
      const overlay = document.getElementById('upload-overlay');
      if (!overlay) return;
      
      const overlayContainer = overlay.querySelector('.overlay-container');
      if (overlayContainer) {
        overlayContainer.innerHTML = `
          <h2>Upload erfolgreich!</h2>
          <div class="success-animation">
            <div class="success-checkmark">✓</div>
          </div>
          <p>Dein Video wurde erfolgreich hochgeladen und wird auf den ausgewählten Plattformen veröffentlicht.</p>
          
          <div class="platform-success-list">
            ${this.selectedPlatforms.map(platform => `
              <div class="platform-success-item">
                <div class="platform-icon platform-${platform}"></div>
                <div class="platform-success-info">
                  <span class="platform-name">${this.getPlatformName(platform)}</span>
                  <span class="platform-status">Erfolgreich hochgeladen</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="success-actions">
            <button id="dashboard-btn" class="primary-button">Zum Dashboard</button>
            <button id="success-close" class="secondary-button">Schließen</button>
          </div>
        `;
        
        // Event-Listener für Buttons
        const dashboardBtn = document.getElementById('dashboard-btn');
        const successCloseBtn = document.getElementById('success-close');
        
        if (dashboardBtn) {
          dashboardBtn.addEventListener('click', () => {
            overlay.remove();
            this.goToDashboard();
          });
        }
        
        if (successCloseBtn) {
          successCloseBtn.addEventListener('click', () => {
            overlay.remove();
            this.resetForm();
          });
        }
      }
      
      this.uploadInProgress = false;
    }
    
    handleUploadError(errorMessage) {
      const overlay = document.getElementById('upload-overlay');
      if (!overlay) return;
      
      const overlayContainer = overlay.querySelector('.overlay-container');
      if (overlayContainer) {
        overlayContainer.innerHTML = `
          <h2>Upload fehlgeschlagen</h2>
          <div class="error-animation">
            <div class="error-icon">!</div>
          </div>
          <p>Beim Hochladen deines Videos ist ein Fehler aufgetreten:</p>
          <div class="error-message">${errorMessage}</div>
          <div class="error-actions">
            <button id="try-again" class="primary-button">Erneut versuchen</button>
            <button id="error-close" class="secondary-button">Abbrechen</button>
          </div>
        `;
        
        // Event-Listener für Buttons
        const tryAgainBtn = document.getElementById('try-again');
        const errorCloseBtn = document.getElementById('error-close');
        
        if (tryAgainBtn) {
          tryAgainBtn.addEventListener('click', () => {
            overlay.remove();
            this.startUpload();
          });
        }
        
        if (errorCloseBtn) {
          errorCloseBtn.addEventListener('click', () => {
            overlay.remove();
          });
        }
      }
      
      this.uploadInProgress = false;
    }
    
    getPlatformName(platform) {
      const names = {
        'youtube': 'YouTube',
        'instagram': 'Instagram',
        'tiktok': 'TikTok'
      };
      
      return names[platform] || platform;
    }
    
    cancelUpload() {
      const overlay = document.getElementById('upload-overlay');
      if (overlay) {
        overlay.remove();
      }
      
      this.uploadInProgress = false;
    }
    
    goToDashboard() {
      // Navigiere zur Dashboard-Seite
      const dashboardNav = document.querySelector('.sidebar-nav-item[data-page="Dashboard"]');
      if (dashboardNav) {
        dashboardNav.click();
      }
      
      this.resetForm();
    }
    
    resetForm() {
      // Formular zurücksetzen
      const form = this.container.querySelector('.upload-form');
      if (form) {
        form.reset();
      }
      
      // Dateien zurücksetzen
      this.videoFile = null;
      this.thumbnailFile = null;
      
      // UI zurücksetzen
      const fileInfo = document.getElementById('selected-video-info');
      if (fileInfo) {
        fileInfo.innerHTML = '';
      }
      
      const thumbnailPreview = document.getElementById('thumbnail-preview');
      if (thumbnailPreview) {
        thumbnailPreview.innerHTML = `<div class="thumbnail-placeholder">Keine Vorschau</div>`;
      }
      
      // Upload-Button deaktivieren
      const startUploadBtn = document.getElementById('start-upload-btn');
      if (startUploadBtn) {
        startUploadBtn.disabled = true;
      }
      
      // Plattform-Einstellungen zurücksetzen
      this.togglePlatformSettings();
      this.toggleScheduleOptions();
    }
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
  
  // Exportieren für die Verwendung in anderen Dateien
  if (typeof module !== 'undefined') {
    module.exports = MultiPlatformUpload;
  }