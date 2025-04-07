const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Import der Dienste
const YouTubeAuthService = require('../services/youtube/auth');
const YouTubeUploader = require('../services/youtube/uploader');
const InstagramService = require('../services/instagram/instagram');
const TikTokService = require('../services/tiktok/tiktok');
const SchedulerService = require('../services/scheduler/scheduler');

// Globale Referenzen
let mainWindow;
let youtubeAuth;
let youtubeUploader;
let instagramService;
let tiktokService;
let schedulerService;

// Pfad zur Konfiguration
const configPath = path.join(app.getPath('userData'), 'user-config.json');

// Sicherstellen, dass die Konfigurationsdatei existiert
function ensureConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        appearance: {
          accentColor: "#e69e19",
          theme: "dark"
        },
        credentials: {
          youtube: {
            clientId: "",
            clientSecret: "",
            apiKey: "",
            refreshToken: "",
            accessToken: ""
          },
          instagram: {
            appId: "",
            appSecret: "",
            accessToken: ""
          },
          tiktok: {
            clientKey: "",
            clientSecret: "",
            accessToken: ""
          }
        }
      };
      
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    }
    return true;
  } catch (error) {
    console.error('Fehler beim Erstellen der Konfiguration:', error);
    return false;
  }
}

// Fenster erstellen
const createWindow = () => {
  // Stelle sicher, dass Konfiguration existiert
  ensureConfig();
  
  // Initialisiere Dienste
  initializeServices();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#111111',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false
  });

  // Lade die Index-HTML-Datei
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Fenster anzeigen, wenn geladen
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Entwicklertools öffnen im Dev-Modus
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
};

// Dienste initialisieren
function initializeServices() {
  // YouTube-Dienste
  youtubeAuth = new YouTubeAuthService(configPath);
  
  if (youtubeAuth.isAuthenticated()) {
    youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
  }
  
  // Instagram-Dienst (Placeholder für die zukünftige Implementierung)
  instagramService = new InstagramService(configPath);
  
  // TikTok-Dienst (Placeholder für die zukünftige Implementierung)
  tiktokService = new TikTokService(configPath);
  
  // Scheduler-Dienst
  schedulerService = new SchedulerService(configPath);
  
  // Timer für geplante Uploads starten
  schedulerService.startScheduler({
    youtube: youtubeUploader,
    instagram: instagramService,
    tiktok: tiktokService
  });
}

// App ist bereit
app.whenReady().then(() => {
  createWindow();
  
  setupIpcHandlers();
  
  // MacOS: Fenster neu erstellen, wenn Dock-Icon angeklickt wird
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Verhindern, dass die App im Hintergrund weiterläuft
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC-Handler einrichten
function setupIpcHandlers() {
  // App-bezogene Handler
  setupAppHandlers();
  
  // Plattform-bezogene Handler
  setupYouTubeHandlers();
  setupInstagramHandlers();
  setupTikTokHandlers();
  
  // Dateisystem-Handler
  setupFsHandlers();
  
  // Benachrichtigungs-Handler
  setupNotificationHandlers();
  
  // Scheduler-Handler
  setupSchedulerHandlers();
}

// App-bezogene IPC-Handler
function setupAppHandlers() {
  // App-Informationen abrufen
  ipcMain.handle('app:getInfo', () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      appPath: app.getAppPath(),
      userDataPath: app.getPath('userData')
    };
  });
  
  // API-Einstellungen abrufen
  ipcMain.handle('app:getApiSettings', async () => {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return {
        youtube: {
          clientId: config.credentials.youtube.clientId,
          clientSecret: config.credentials.youtube.clientSecret,
          apiKey: config.credentials.youtube.apiKey
        },
        instagram: {
          appId: config.credentials.instagram.appId,
          appSecret: config.credentials.instagram.appSecret
        },
        tiktok: {
          clientKey: config.credentials.tiktok.clientKey,
          clientSecret: config.credentials.tiktok.clientSecret
        }
      };
    } catch (error) {
      console.error('Fehler beim Laden der API-Einstellungen:', error);
      return { 
        youtube: { clientId: '', clientSecret: '', apiKey: '' },
        instagram: { appId: '', appSecret: '' },
        tiktok: { clientKey: '', clientSecret: '' }
      };
    }
  });
  
  // API-Konfiguration speichern
  ipcMain.handle('app:saveApiConfig', async (event, config) => {
    try {
      const fullConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // YouTube-Einstellungen aktualisieren
      if (config.youtube) {
        fullConfig.credentials.youtube.clientId = config.youtube.clientId;
        fullConfig.credentials.youtube.clientSecret = config.youtube.clientSecret;
        fullConfig.credentials.youtube.apiKey = config.youtube.apiKey;
      }
      
      // Instagram-Einstellungen aktualisieren
      if (config.instagram) {
        fullConfig.credentials.instagram.appId = config.instagram.appId;
        fullConfig.credentials.instagram.appSecret = config.instagram.appSecret;
      }
      
      // TikTok-Einstellungen aktualisieren
      if (config.tiktok) {
        fullConfig.credentials.tiktok.clientKey = config.tiktok.clientKey;
        fullConfig.credentials.tiktok.clientSecret = config.tiktok.clientSecret;
      }
      
      fs.writeFileSync(configPath, JSON.stringify(fullConfig, null, 2), 'utf8');
      
      // Dienste neu initialisieren
      initializeServices();
      
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Speichern der API-Konfiguration:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Theme-Einstellungen abrufen
  ipcMain.handle('app:getTheme', () => {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.appearance;
    } catch (error) {
      console.error('Fehler beim Laden der Theme-Einstellungen:', error);
      return { theme: 'dark', accentColor: '#e69e19' };
    }
  });
  
  // Theme aktualisieren
  ipcMain.handle('app:setTheme', (event, theme) => {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.appearance.theme = theme;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Themes:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Akzentfarbe aktualisieren
  ipcMain.handle('app:setAccentColor', (event, color) => {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.appearance.accentColor = color;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Akzentfarbe:', error);
      return { success: false, error: error.message };
    }
  });
}

// YouTube-bezogene IPC-Handler
function setupYouTubeHandlers() {
  // Authentifizierungsstatus prüfen
  ipcMain.handle('youtube:checkAuth', async () => {
    return youtubeAuth.isAuthenticated();
  });
  
  // Authentifizierung starten
  ipcMain.handle('youtube:authenticate', async () => {
    try {
      await youtubeAuth.authenticate(mainWindow);
      // Nach erfolgreicher Authentifizierung den Uploader initialisieren
      youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Video auswählen
  ipcMain.handle('youtube:selectVideo', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'wmv'] }
      ]
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    return { 
      canceled: false, 
      filePath: result.filePaths[0],
      fileName: path.basename(result.filePaths[0])
    };
  });
  
  // Thumbnail auswählen
  ipcMain.handle('youtube:selectThumbnail', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
      ]
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    return { 
      canceled: false, 
      filePath: result.filePaths[0],
      fileName: path.basename(result.filePaths[0])
    };
  });
  
  // Video hochladen
  ipcMain.handle('youtube:uploadVideo', async (event, { videoPath, metadata }) => {
    if (!youtubeUploader) {
      youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
    }
    
    try {
      const result = await youtubeUploader.uploadVideo(videoPath, metadata, progress => {
        // Sende Fortschritt an den Renderer-Prozess
        mainWindow.webContents.send('youtube:uploadProgress', progress);
      });
      
      return { success: true, videoId: result.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Thumbnail hochladen
  ipcMain.handle('youtube:uploadThumbnail', async (event, { videoId, thumbnailPath }) => {
    if (!youtubeUploader) {
      youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
    }
    
    try {
      await youtubeUploader.setThumbnail(videoId, thumbnailPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Kategorien abrufen
  ipcMain.handle('youtube:getCategories', async () => {
    if (!youtubeUploader) {
      youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
    }
    
    try {
      const categories = await youtubeUploader.getVideoCategories();
      return { success: true, categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Playlists abrufen
  ipcMain.handle('youtube:getPlaylists', async () => {
    if (!youtubeUploader) {
      youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
    }
    
    try {
      const playlists = await youtubeUploader.getMyPlaylists();
      return { success: true, playlists };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Kanal-Informationen abrufen
ipcMain.handle('youtube:getChannelInfo', async () => {
    try {
      if (!youtubeAuth.isAuthenticated()) {
        return { 
          success: false, 
          error: 'Not authenticated with YouTube'
        };
      }
      
      // Alternativ über den Uploader, falls dieser verfügbar ist
      if (!youtubeUploader) {
        youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
      }
      
      const channelInfo = await youtubeUploader.getChannelInfo();
      
      return { success: true, channelInfo };
    } catch (error) {
      console.error('Fehler beim Abrufen der Kanalinformationen:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  });
  
  // Videos abrufen
  ipcMain.handle('youtube:getVideos', async () => {
    if (!youtubeUploader) {
      youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
    }
    
    try {
      const videos = await youtubeUploader.getVideos();
      return { success: true, videos };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Instagram-bezogene IPC-Handler
function setupInstagramHandlers() {
  // Authentifizierungsstatus prüfen
  ipcMain.handle('instagram:checkAuth', async () => {
    // Demo-Rückgabe: Nicht authentifiziert
    return false;
  });
  
  // Authentifizierung starten
  ipcMain.handle('instagram:authenticate', async () => {
    try {
      // Demo-Rückgabe: Erfolgreich
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Post hochladen
  ipcMain.handle('instagram:uploadPost', async (event, data) => {
    try {
      // Demo-Rückgabe: Erfolgreich
      return { success: true, postId: 'demo-post-id-123' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Story hochladen
  ipcMain.handle('instagram:uploadStory', async (event, data) => {
    try {
      // Demo-Rückgabe: Erfolgreich
      return { success: true, storyId: 'demo-story-id-123' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Reel hochladen
  ipcMain.handle('instagram:uploadReel', async (event, data) => {
    try {
      // Demo-Rückgabe: Erfolgreich
      return { success: true, reelId: 'demo-reel-id-123' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Account-Informationen abrufen
  ipcMain.handle('instagram:getAccountInfo', async () => {
    try {
      // Demo-Rückgabe: Account-Informationen
      return {
        success: true,
        accountInfo: {
          username: 'demo_account',
          followers: 1000,
          following: 500,
          posts: 50
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Posts abrufen
  ipcMain.handle('instagram:getPosts', async () => {
    try {
      // Demo-Rückgabe: Posts
      return {
        success: true,
        posts: [
          { id: 'post1', caption: 'Demo Post 1', likes: 100, comments: 10 },
          { id: 'post2', caption: 'Demo Post 2', likes: 200, comments: 20 }
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Stories abrufen
  ipcMain.handle('instagram:getStories', async () => {
    try {
      // Demo-Rückgabe: Stories
      return {
        success: true,
        stories: [
          { id: 'story1', views: 150 },
          { id: 'story2', views: 300 }
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// TikTok-bezogene IPC-Handler
function setupTikTokHandlers() {
  // Authentifizierungsstatus prüfen
  ipcMain.handle('tiktok:checkAuth', async () => {
    // Demo-Rückgabe: Nicht authentifiziert
    return false;
  });
  
  // Authentifizierung starten
  ipcMain.handle('tiktok:authenticate', async () => {
    try {
      // Demo-Rückgabe: Erfolgreich
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Video hochladen
  ipcMain.handle('tiktok:uploadVideo', async (event, data) => {
    try {
      // Demo-Rückgabe: Erfolgreich
      return { success: true, videoId: 'demo-video-id-123' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Account-Informationen abrufen
  ipcMain.handle('tiktok:getAccountInfo', async () => {
    try {
      // Demo-Rückgabe: Account-Informationen
      return {
        success: true,
        accountInfo: {
          username: 'demo_tiktok',
          followers: 2000,
          following: 500,
          likes: 15000
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Videos abrufen
  ipcMain.handle('tiktok:getVideos', async () => {
    try {
      // Demo-Rückgabe: Videos
      return {
        success: true,
        videos: [
          { id: 'video1', caption: 'Demo Video 1', views: 5000, likes: 400, comments: 30 },
          { id: 'video2', caption: 'Demo Video 2', views: 7000, likes: 600, comments: 45 }
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Trends abrufen
  ipcMain.handle('tiktok:getTrends', async () => {
    try {
      // Demo-Rückgabe: Trends
      return {
        success: true,
        trends: [
          { hashtag: '#trend1', views: 5000000 },
          { hashtag: '#trend2', views: 7000000 },
          { hashtag: '#trend3', views: 3000000 }
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Dateisystem-bezogene IPC-Handler
function setupFsHandlers() {
  // Datei auswählen
  ipcMain.handle('fs:selectFile', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      ...options
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    return { 
      canceled: false, 
      filePath: result.filePaths[0],
      fileName: path.basename(result.filePaths[0])
    };
  });
  
  // Verzeichnis auswählen
  ipcMain.handle('fs:selectDirectory', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      ...options
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    return { 
      canceled: false, 
      directoryPath: result.filePaths[0],
      directoryName: path.basename(result.filePaths[0])
    };
  });
  
  // Datei lesen
  ipcMain.handle('fs:readFile', async (event, filePath, options) => {
    try {
      const data = await fs.promises.readFile(filePath, options);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Datei schreiben
  ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
    try {
      await fs.promises.writeFile(filePath, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Prüfen, ob Datei existiert
  ipcMain.handle('fs:fileExists', async (event, filePath) => {
    try {
      const exists = await fs.promises.access(filePath)
        .then(() => true)
        .catch(() => false);
      return { success: true, exists };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Benachrichtigungs-bezogene IPC-Handler
function setupNotificationHandlers() {
  // Benachrichtigung anzeigen
  ipcMain.handle('notifications:show', async (event, options) => {
    try {
      const notification = new Notification({
        title: options.title || 'Social Media Uploader',
        body: options.body || '',
        icon: options.icon || path.join(__dirname, '../assets/icons/app-icon.png'),
        silent: options.silent || false
      });
      
      notification.show();
      
      if (options.onClick) {
        notification.on('click', () => {
          mainWindow.show();
          mainWindow.webContents.send('notifications:clicked', options.id);
        });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Scheduler-bezogene IPC-Handler
function setupSchedulerHandlers() {
  // Geplante Uploads abrufen
  ipcMain.handle('scheduler:getScheduledUploads', async () => {
    try {
      const uploads = await schedulerService.getScheduledUploads();
      return { success: true, uploads };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Upload planen
  ipcMain.handle('scheduler:scheduleUpload', async (event, uploadData) => {
    try {
      const result = await schedulerService.scheduleUpload(uploadData);
      
      // Benachrichtige alle Fenster über die Änderung
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('scheduler:update', { action: 'add', upload: result });
      });
      
      return { success: true, upload: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Geplanten Upload aktualisieren
  ipcMain.handle('scheduler:updateScheduledUpload', async (event, id, uploadData) => {
    try {
      const result = await schedulerService.updateScheduledUpload(id, uploadData);
      
      // Benachrichtige alle Fenster über die Änderung
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('scheduler:update', { action: 'update', upload: result });
      });
      
      return { success: true, upload: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });



// Kanal-Informationen abrufen
ipcMain.handle('youtube:getChannelInfo', async () => {
    try {
      if (!youtubeAuth.isAuthenticated()) {
        return { 
          success: false, 
          error: 'Not authenticated with YouTube'
        };
      }
      
      // Verwende direkt youtubeAuth, falls vorhanden
      if (youtubeAuth.getChannelInfo) {
        const channelInfo = await youtubeAuth.getChannelInfo();
        return { success: true, channelInfo };
      }
      
      // Alternativ über den Uploader, falls dieser verfügbar ist
      if (!youtubeUploader) {
        youtubeUploader = new YouTubeUploader(youtubeAuth.getAuthClient());
      }
      
      const channelInfo = await youtubeUploader.getChannelInfo();
      
      return { success: true, channelInfo };
    } catch (error) {
      console.error('Fehler beim Abrufen der Kanalinformationen:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  });
  
  // Geplanten Upload löschen
  ipcMain.handle('scheduler:deleteScheduledUpload', async (event, id) => {
    try {
      await schedulerService.deleteScheduledUpload(id);
      
      // Benachrichtige alle Fenster über die Änderung
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('scheduler:update', { action: 'delete', id });
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}