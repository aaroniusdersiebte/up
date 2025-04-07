// src/services/scheduler/scheduler.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { app } = require('electron');

class SchedulerService {
  constructor(configPath) {
    this.configPath = configPath;
    this.schedulerDbPath = path.join(app.getPath('userData'), 'scheduled-uploads.json');
    this.platformServices = null;
    this.activeTimers = {};
    
    // Stelle sicher, dass die Datenbank existiert
    this.ensureDatabase();
  }
  
  ensureDatabase() {
    if (!fs.existsSync(this.schedulerDbPath)) {
      fs.writeFileSync(this.schedulerDbPath, JSON.stringify({ uploads: [] }, null, 2), 'utf8');
    }
  }
  
  startScheduler(platformServices) {
    this.platformServices = platformServices;
    
    // Bestehende Timer abbrechen
    Object.values(this.activeTimers).forEach(timer => clearTimeout(timer));
    this.activeTimers = {};
    
    // Lade geplante Uploads und plane sie
    this.getScheduledUploads().then(uploads => {
      uploads.forEach(upload => {
        if (upload.status === 'scheduled') {
          this.scheduleUploadExecution(upload);
        }
      });
    });
  }
  
  async getScheduledUploads() {
    try {
      const data = fs.readFileSync(this.schedulerDbPath, 'utf8');
      const db = JSON.parse(data);
      return db.uploads || [];
    } catch (error) {
      console.error('Fehler beim Laden der geplanten Uploads:', error);
      return [];
    }
  }
  
  async scheduleUpload(uploadData) {
    try {
      const data = fs.readFileSync(this.schedulerDbPath, 'utf8');
      const db = JSON.parse(data);
      
      const id = uuidv4();
      const upload = {
        id,
        ...uploadData,
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      
      db.uploads.push(upload);
      fs.writeFileSync(this.schedulerDbPath, JSON.stringify(db, null, 2), 'utf8');
      
      // Plane die Ausführung des Uploads
      this.scheduleUploadExecution(upload);
      
      return upload;
    } catch (error) {
      console.error('Fehler beim Planen des Uploads:', error);
      throw error;
    }
  }
  
  async updateScheduledUpload(id, uploadData) {
    try {
      const data = fs.readFileSync(this.schedulerDbPath, 'utf8');
      const db = JSON.parse(data);
      
      const index = db.uploads.findIndex(upload => upload.id === id);
      if (index === -1) {
        throw new Error('Geplanter Upload nicht gefunden');
      }
      
      // Alte Timer abbrechen
      if (this.activeTimers[id]) {
        clearTimeout(this.activeTimers[id]);
        delete this.activeTimers[id];
      }
      
      // Upload aktualisieren
      const updatedUpload = {
        ...db.uploads[index],
        ...uploadData,
        updatedAt: new Date().toISOString()
      };
      
      db.uploads[index] = updatedUpload;
      fs.writeFileSync(this.schedulerDbPath, JSON.stringify(db, null, 2), 'utf8');
      
      // Plane die Ausführung des Uploads neu
      if (updatedUpload.status === 'scheduled') {
        this.scheduleUploadExecution(updatedUpload);
      }
      
      return updatedUpload;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des geplanten Uploads:', error);
      throw error;
    }
  }
  
  async deleteScheduledUpload(id) {
    try {
      const data = fs.readFileSync(this.schedulerDbPath, 'utf8');
      const db = JSON.parse(data);
      
      const index = db.uploads.findIndex(upload => upload.id === id);
      if (index === -1) {
        throw new Error('Geplanter Upload nicht gefunden');
      }
      
      // Timer abbrechen
      if (this.activeTimers[id]) {
        clearTimeout(this.activeTimers[id]);
        delete this.activeTimers[id];
      }
      
      // Upload entfernen
      db.uploads.splice(index, 1);
      fs.writeFileSync(this.schedulerDbPath, JSON.stringify(db, null, 2), 'utf8');
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des geplanten Uploads:', error);
      throw error;
    }
  }
  
  scheduleUploadExecution(upload) {
    if (!upload.scheduledDate) {
      console.error('Kein Datum für den geplanten Upload angegeben');
      return;
    }
    
    const now = new Date();
    const scheduledDate = new Date(upload.scheduledDate);
    
    // Berechne die Zeit bis zum geplanten Upload
    const timeUntilExecution = scheduledDate.getTime() - now.getTime();
    
    // Wenn der Zeitpunkt in der Vergangenheit liegt, ignoriere ihn
    if (timeUntilExecution <= 0) {
      console.warn(`Geplanter Upload ${upload.id} ist bereits überfällig`);
      return;
    }
    
    // Plane den Upload mit setTimeout
    this.activeTimers[upload.id] = setTimeout(() => {
      this.executeUpload(upload);
    }, timeUntilExecution);
    
    console.log(`Upload ${upload.id} geplant für ${scheduledDate.toLocaleString()} (in ${Math.round(timeUntilExecution / 1000 / 60)} Minuten)`);
  }
  
  async executeUpload(upload) {
    console.log(`Starte geplanten Upload ${upload.id}`);
    
    try {
      // Aktualisiere den Status auf "processing"
      await this.updateScheduledUpload(upload.id, { status: 'processing' });
      
      // Führe den Upload für jede Plattform aus
      const results = {};
      
      for (const platform of upload.platforms) {
        try {
          let result;
          
          switch (platform) {
            case 'youtube':
              if (this.platformServices.youtube) {
                result = await this.platformServices.youtube.uploadVideo(upload.videoPath, upload.metadata);
                
                // Thumbnail hochladen, falls vorhanden
                if (result.id && upload.thumbnailPath) {
                  await this.platformServices.youtube.setThumbnail(result.id, upload.thumbnailPath);
                }
              }
              break;
            
            case 'instagram':
              if (this.platformServices.instagram) {
                // Unterscheide zwischen Feed, Story und Reel
                if (upload.instagramType === 'feed') {
                  result = await this.platformServices.instagram.uploadPost(upload);
                } else if (upload.instagramType === 'story') {
                  result = await this.platformServices.instagram.uploadStory(upload);
                } else if (upload.instagramType === 'reel') {
                  result = await this.platformServices.instagram.uploadReel(upload);
                }
              }
              break;
            
            case 'tiktok':
              if (this.platformServices.tiktok) {
                result = await this.platformServices.tiktok.uploadVideo(upload);
              }
              break;
          }
          
          results[platform] = { success: true, result };
        } catch (error) {
          console.error(`Fehler beim Upload auf ${platform}:`, error);
          results[platform] = { success: false, error: error.message };
        }
      }
      
      // Aktualisiere den Upload mit den Ergebnissen
      await this.updateScheduledUpload(upload.id, { 
        status: 'completed', 
        results, 
        completedAt: new Date().toISOString() 
      });
      
      console.log(`Geplanter Upload ${upload.id} erfolgreich abgeschlossen`);
    } catch (error) {
      console.error(`Fehler beim Ausführen des geplanten Uploads ${upload.id}:`, error);
      
      // Aktualisiere den Status auf "failed"
      await this.updateScheduledUpload(upload.id, { 
        status: 'failed', 
        error: error.message,
        completedAt: new Date().toISOString()
      });
    }
  }
}

module.exports = SchedulerService;