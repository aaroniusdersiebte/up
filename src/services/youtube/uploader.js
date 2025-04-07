// src/services/youtube/uploader.js
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class YouTubeUploader {
  constructor(authClient) {
    this.authClient = authClient;
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.authClient
    });
    
    // Temporäres Verzeichnis für das zwischenspeichern von Bildern
    this.tempDir = app ? path.join(app.getPath('userData'), 'temp') : path.join(__dirname, 'temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async uploadVideo(videoPath, metadata, progressCallback) {
    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Die Videodatei existiert nicht: ${videoPath}`);
      }
      
      const fileSize = fs.statSync(videoPath).size;
      
      const requestMetadata = {
        snippet: {
          title: metadata.title || 'Untitled Video',
          description: metadata.description || '',
          tags: metadata.tags || [],
          categoryId: metadata.categoryId || '22', // Default to People & Vlogs
          defaultLanguage: metadata.language || 'de',
          defaultAudioLanguage: metadata.language || 'de'
        },
        status: {
          privacyStatus: metadata.privacy || 'private',
          embeddable: metadata.embeddable !== false,
          publicStatsViewable: metadata.publicStatsViewable !== false,
          selfDeclaredMadeForKids: metadata.madeForKids || false,
          license: metadata.license || 'youtube'
        }
      };

      // Handle scheduled publishing
      if (metadata.publishAt) {
        requestMetadata.status.publishAt = new Date(metadata.publishAt).toISOString();
      }

      // Create a resumable upload session
      const fileStream = fs.createReadStream(videoPath);
      
      const res = await this.youtube.videos.insert({
        part: 'snippet,status',
        requestBody: requestMetadata,
        media: {
          body: fileStream
        }
      }, {
        onUploadProgress: evt => {
          const progress = (evt.bytesRead / fileSize) * 100;
          if (progressCallback) {
            progressCallback({
              progress: Math.round(progress),
              bytesRead: evt.bytesRead,
              bytesTotal: fileSize,
              status: progress < 100 ? 'Uploading...' : 'Processing...',
              timeRemaining: `About ${Math.floor((100 - progress) / 10)} minutes left`
            });
          }
        }
      });

      return res.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async setThumbnail(videoId, thumbnailPath) {
    try {
      if (!fs.existsSync(thumbnailPath)) {
        throw new Error(`Die Thumbnail-Datei existiert nicht: ${thumbnailPath}`);
      }
      
      const res = await this.youtube.thumbnails.set({
        videoId: videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });

      return res.data;
    } catch (error) {
      console.error('Thumbnail error:', error);
      throw error;
    }
  }

  async getVideoCategories(regionCode = 'DE') {
    try {
      const res = await this.youtube.videoCategories.list({
        part: 'snippet',
        regionCode: regionCode
      });

      return res.data.items;
    } catch (error) {
      console.error('Categories error:', error);
      throw error;
    }
  }

  async getMyPlaylists() {
    try {
      const res = await this.youtube.playlists.list({
        part: 'snippet',
        mine: true,
        maxResults: 50
      });

      return res.data.items;
    } catch (error) {
      console.error('Playlists error:', error);
      throw error;
    }
  }
  
  async getChannelInfo() {
    try {
      const res = await this.youtube.channels.list({
        part: 'snippet,statistics,brandingSettings',
        mine: true
      });

      if (res.data.items && res.data.items.length > 0) {
        const channel = res.data.items[0];
        
        // Speichere das Profilbild lokal
        let profileImagePath = null;
        if (channel.snippet && channel.snippet.thumbnails && channel.snippet.thumbnails.default) {
          try {
            profileImagePath = await this.downloadChannelImage(
              channel.snippet.thumbnails.default.url,
              channel.id
            );
          } catch (imgError) {
            console.error('Fehler beim Herunterladen des Profilbilds:', imgError);
          }
        }
        
        // Füge den Pfad zum lokalen Profilbild hinzu
        return {
          ...channel,
          localProfileImagePath: profileImagePath
        };
      }
      
      throw new Error('Keine Kanalinformationen gefunden');
    } catch (error) {
      console.error('Channel error:', error);
      throw error;
    }
  }
  
  async downloadChannelImage(imageUrl, channelId) {
    try {
      // Erstelle temporären Dateinamen
      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
      const fileName = `profile_${channelId}${ext}`;
      const filePath = path.join(this.tempDir, fileName);
      
      // Prüfe, ob das Bild bereits heruntergeladen wurde
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      
      // Lade das Bild herunter
      const axios = require('axios');
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream'
      });
      
      // Speichere das Bild
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Fehler beim Herunterladen des Profilbilds:', error);
      throw error;
    }
  }
  
  async getVideos(maxResults = 10) {
    try {
      const res = await this.youtube.search.list({
        part: 'snippet',
        forMine: true,
        maxResults: maxResults,
        type: 'video',
        order: 'date'
      });
      
      // Lade zusätzliche Details für die Videos
      if (res.data.items && res.data.items.length > 0) {
        const videoIds = res.data.items.map(item => item.id.videoId);
        
        const detailsRes = await this.youtube.videos.list({
          part: 'snippet,statistics,status',
          id: videoIds.join(',')
        });
        
        // Kombiniere die Informationen
        const combinedVideos = res.data.items.map(item => {
          const details = detailsRes.data.items.find(
            detailItem => detailItem.id === item.id.videoId
          );
          
          return {
            ...item,
            statistics: details ? details.statistics : null,
            status: details ? details.status : null
          };
        });
        
        return combinedVideos;
      }
      
      return res.data.items || [];
    } catch (error) {
      console.error('Videos error:', error);
      throw error;
    }
  }
}

module.exports = YouTubeUploader;