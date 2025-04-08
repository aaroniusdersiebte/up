// src/main/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Stelle sicher, dass keine der exponierten APIs bereits existierende Eigenschaften überschreibt
const API_KEYS = {
  APP: 'electronApp',
  PLATFORMS: 'platformApis',
  FS: 'fileSystem',
  NOTIFICATIONS: 'notificationSystem',
  SCHEDULER: 'schedulerSystem'
};

// App API Zugriff
contextBridge.exposeInMainWorld(API_KEYS.APP, {
  // Allgemeine App-Funktionen
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  
  // Einstellungen-Funktionen
  getApiSettings: () => ipcRenderer.invoke('app:getApiSettings'),
  saveApiConfig: (config) => ipcRenderer.invoke('app:saveApiConfig', config),
  getTheme: () => ipcRenderer.invoke('app:getTheme'),
  setTheme: (theme) => ipcRenderer.invoke('app:setTheme', theme),
  setAccentColor: (color) => ipcRenderer.invoke('app:setAccentColor', color)
});

// Plattform-spezifische APIs
contextBridge.exposeInMainWorld(API_KEYS.PLATFORMS, {
  // YouTube API
  youtube: {
    checkAuth: () => ipcRenderer.invoke('youtube:checkAuth'),
    authenticate: () => ipcRenderer.invoke('youtube:authenticate'),
    selectVideo: () => ipcRenderer.invoke('youtube:selectVideo'),
    selectThumbnail: () => ipcRenderer.invoke('youtube:selectThumbnail'),
    uploadVideo: (data) => ipcRenderer.invoke('youtube:uploadVideo', data),
    uploadThumbnail: (data) => ipcRenderer.invoke('youtube:uploadThumbnail', data),
    getCategories: () => ipcRenderer.invoke('youtube:getCategories'),
    getPlaylists: () => ipcRenderer.invoke('youtube:getPlaylists'),
    getChannelInfo: () => ipcRenderer.invoke('youtube:getChannelInfo'),
    getVideos: () => ipcRenderer.invoke('youtube:getVideos'),
    onUploadProgress: (callback) => {
      const subscription = (event, data) => callback(data);
      ipcRenderer.on('youtube:uploadProgress', subscription);
      return () => ipcRenderer.removeListener('youtube:uploadProgress', subscription);
    }
  },
  
  // Instagram API
  instagram: {
    checkAuth: () => ipcRenderer.invoke('instagram:checkAuth'),
    authenticate: () => ipcRenderer.invoke('instagram:authenticate'),
    uploadPost: (data) => ipcRenderer.invoke('instagram:uploadPost', data),
    uploadStory: (data) => ipcRenderer.invoke('instagram:uploadStory', data),
    uploadReel: (data) => ipcRenderer.invoke('instagram:uploadReel', data),
    getAccountInfo: () => ipcRenderer.invoke('instagram:getAccountInfo'),
    getPosts: () => ipcRenderer.invoke('instagram:getPosts'),
    getStories: () => ipcRenderer.invoke('instagram:getStories'),
    onUploadProgress: (callback) => {
      const subscription = (event, data) => callback(data);
      ipcRenderer.on('instagram:uploadProgress', subscription);
      return () => ipcRenderer.removeListener('instagram:uploadProgress', subscription);
    }
  },
  
  // TikTok API
  tiktok: {
    checkAuth: () => ipcRenderer.invoke('tiktok:checkAuth'),
    authenticate: () => ipcRenderer.invoke('tiktok:authenticate'),
    uploadVideo: (data) => ipcRenderer.invoke('tiktok:uploadVideo', data),
    getAccountInfo: () => ipcRenderer.invoke('tiktok:getAccountInfo'),
    getVideos: () => ipcRenderer.invoke('tiktok:getVideos'),
    getTrends: () => ipcRenderer.invoke('tiktok:getTrends'),
    onUploadProgress: (callback) => {
      const subscription = (event, data) => callback(data);
      ipcRenderer.on('tiktok:uploadProgress', subscription);
      return () => ipcRenderer.removeListener('tiktok:uploadProgress', subscription);
    }
  }
});

// Dateioperationen
contextBridge.exposeInMainWorld(API_KEYS.FS, {
  selectFile: (options) => ipcRenderer.invoke('fs:selectFile', options),
  selectDirectory: (options) => ipcRenderer.invoke('fs:selectDirectory', options),
  readFile: (filePath, options) => ipcRenderer.invoke('fs:readFile', filePath, options),
  writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  fileExists: (filePath) => ipcRenderer.invoke('fs:fileExists', filePath)
});

// Benachrichtigungen
contextBridge.exposeInMainWorld(API_KEYS.NOTIFICATIONS, {
  show: (options) => ipcRenderer.invoke('notifications:show', options)
});

// Planungs-API
contextBridge.exposeInMainWorld(API_KEYS.SCHEDULER, {
  getScheduledUploads: () => ipcRenderer.invoke('scheduler:getScheduledUploads'),
  scheduleUpload: (uploadData) => ipcRenderer.invoke('scheduler:scheduleUpload', uploadData),
  updateScheduledUpload: (id, uploadData) => ipcRenderer.invoke('scheduler:updateScheduledUpload', id, uploadData),
  deleteScheduledUpload: (id) => ipcRenderer.invoke('scheduler:deleteScheduledUpload', id),
  onScheduleUpdate: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('scheduler:update', subscription);
    return () => ipcRenderer.removeListener('scheduler:update', subscription);
  }
});