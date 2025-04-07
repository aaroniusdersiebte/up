// src/renderer/components/Calendar.js
class UploadCalendar {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.currentDate = new Date();
      this.selectedDate = null;
      this.scheduledUploads = [];
      this.currentView = 'month'; // 'month', 'week', or 'day'
      this.init();
    }
  
    init() {
      this.loadScheduledUploads();
      this.render();
      this.attachEventListeners();
    }
  
    async loadScheduledUploads() {
      // In einer echten Anwendung würden wir hier Daten vom Backend laden
      // Für Demo-Zwecke verwenden wir Dummy-Daten
      
      // Dummy-Daten für geplante Uploads
      const today = new Date();
      
      this.scheduledUploads = [
        {
          id: 1,
          title: 'Wöchentliches Update Video',
          platforms: ['youtube', 'instagram'],
          scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
          status: 'scheduled',
          thumbnail: null
        },
        {
          id: 2,
          title: 'Produkt Review',
          platforms: ['youtube', 'tiktok'],
          scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 30),
          status: 'published',
          thumbnail: null
        },
        {
          id: 3,
          title: 'Tutorial: Videobearbeitung',
          platforms: ['youtube'],
          scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 10, 0),
          status: 'scheduled',
          thumbnail: null
        },
        {
          id: 4,
          title: 'Behind the Scenes',
          platforms: ['instagram'],
          scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 18, 0),
          status: 'scheduled',
          thumbnail: null
        }
      ];
    }
  
    render() {
      if (!this.container) return;
  
      this.container.innerHTML = `
        <div class="calendar-container">
          <div class="calendar-header">
            <div class="calendar-title">
              <h2>${this.getMonthYearTitle()}</h2>
            </div>
            <div class="calendar-nav">
              <button id="prev-btn" class="nav-btn">&lt;</button>
              <div class="view-selector">
                <button id="month-view-btn" class="view-btn ${this.currentView === 'month' ? 'active' : ''}">Monat</button>
                <button id="week-view-btn" class="view-btn ${this.currentView === 'week' ? 'active' : ''}">Woche</button>
                <button id="day-view-btn" class="view-btn ${this.currentView === 'day' ? 'active' : ''}">Tag</button>
              </div>
              <button id="next-btn" class="nav-btn">&gt;</button>
              <button id="today-btn" class="today-btn">Heute</button>
            </div>
          </div>
          
          <div class="calendar-views">
            <div id="month-view" class="calendar-view ${this.currentView === 'month' ? 'active' : ''}">
              ${this.renderMonthView()}
            </div>
            <div id="week-view" class="calendar-view ${this.currentView === 'week' ? 'active' : ''}">
              ${this.renderWeekView()}
            </div>
            <div id="day-view" class="calendar-view ${this.currentView === 'day' ? 'active' : ''}">
              ${this.renderDayView()}
            </div>
          </div>
          
          <div class="calendar-legend">
            <div class="legend-item">
              <div class="legend-color youtube-color"></div>
              <span>YouTube</span>
            </div>
            <div class="legend-item">
              <div class="legend-color instagram-color"></div>
              <span>Instagram</span>
            </div>
            <div class="legend-item">
              <div class="legend-color tiktok-color"></div>
              <span>TikTok</span>
            </div>
          </div>
        </div>
      `;
    }
  
    getMonthYearTitle() {
      const months = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
      ];
      
      if (this.currentView === 'month') {
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      } else if (this.currentView === 'week') {
        const weekDates = this.getWeekDates(this.currentDate);
        const startMonth = months[weekDates[0].getMonth()];
        const endMonth = months[weekDates[6].getMonth()];
        
        if (startMonth === endMonth) {
          return `${startMonth} ${this.currentDate.getFullYear()}`;
        } else {
          return `${startMonth} - ${endMonth} ${this.currentDate.getFullYear()}`;
        }
      } else { // day view
        const day = this.currentDate.getDate();
        const month = months[this.currentDate.getMonth()];
        return `${day}. ${month} ${this.currentDate.getFullYear()}`;
      }
    }
  
    renderMonthView() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      // Erster Tag des Monats
      const firstDay = new Date(year, month, 1);
      // Letzter Tag des Monats
      const lastDay = new Date(year, month + 1, 0);
      
      // Anzahl der Tage im Monat
      const daysInMonth = lastDay.getDate();
      
      // Wochentag des ersten Tages (0 = Sonntag, 1 = Montag, ...)
      let firstDayOfWeek = firstDay.getDay();
      // Anpassen an europäische Woche (Montag = 0, Sonntag = 6)
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      
      // Wochentag-Header
      const weekdayHeader = `
        <div class="weekday-header">
          <div class="weekday">Mo</div>
          <div class="weekday">Di</div>
          <div class="weekday">Mi</div>
          <div class="weekday">Do</div>
          <div class="weekday">Fr</div>
          <div class="weekday">Sa</div>
          <div class="weekday">So</div>
        </div>
      `;
      
      // Kalender-Tage erstellen
      let calendarDays = '';
      let dayCount = 1;
      
      // Bis zu 6 Wochen im Monat
      for (let week = 0; week < 6; week++) {
        let weekRow = '<div class="week-row">';
        
        // 7 Tage pro Woche
        for (let day = 0; day < 7; day++) {
          if ((week === 0 && day < firstDayOfWeek) || (dayCount > daysInMonth)) {
            // Leere Zellen vor dem ersten Tag und nach dem letzten Tag
            weekRow += '<div class="day empty"></div>';
          } else {
            const currentDate = new Date(year, month, dayCount);
            const isToday = this.isToday(currentDate);
            const isSelected = this.isSelectedDate(currentDate);
            
            // Geplante Uploads für diesen Tag finden
            const dayUploads = this.scheduledUploads.filter(upload => 
              this.isSameDay(upload.scheduledDate, currentDate)
            );
            
            const uploadsHtml = dayUploads.map(upload => {
              const platformClasses = upload.platforms.map(p => `${p}-color`).join(' ');
              const timeString = this.formatTime(upload.scheduledDate);
              
              return `
                <div class="calendar-event ${platformClasses}" data-upload-id="${upload.id}">
                  <span class="event-time">${timeString}</span>
                  <span class="event-title">${upload.title}</span>
                </div>
              `;
            }).join('');
            
            weekRow += `
              <div class="day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${currentDate.toISOString()}">
                <div class="day-header">
                  <span class="day-number">${dayCount}</span>
                </div>
                <div class="day-content">
                  ${uploadsHtml}
                </div>
              </div>
            `;
            
            dayCount++;
          }
        }
        
        weekRow += '</div>';
        calendarDays += weekRow;
        
        if (dayCount > daysInMonth) break;
      }
      
      return `
        <div class="month-calendar">
          ${weekdayHeader}
          <div class="days-container">
            ${calendarDays}
          </div>
        </div>
      `;
    }
  
    renderWeekView() {
      const weekDates = this.getWeekDates(this.currentDate);
      
      const weekdayHeader = weekDates.map(date => {
        const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        const isToday = this.isToday(date);
        
        return `
          <div class="week-day-header ${isToday ? 'today' : ''}" data-date="${date.toISOString()}">
            <div class="week-day-name">${dayName}</div>
            <div class="week-day-number">${dayNumber}</div>
          </div>
        `;
      }).join('');
      
      const timeSlots = [];
      for (let hour = 0; hour < 24; hour++) {
        timeSlots.push(`
          <div class="time-slot">
            <div class="time-label">${hour}:00</div>
            <div class="week-slot-container">
              ${weekDates.map(date => {
                const slotDate = new Date(date);
                slotDate.setHours(hour, 0, 0, 0);
                
                const uploads = this.scheduledUploads.filter(upload => 
                  upload.scheduledDate.getDate() === slotDate.getDate() &&
                  upload.scheduledDate.getMonth() === slotDate.getMonth() &&
                  upload.scheduledDate.getFullYear() === slotDate.getFullYear() &&
                  upload.scheduledDate.getHours() === hour
                );
                
                const uploadsHtml = uploads.map(upload => {
                  const platformClasses = upload.platforms.map(p => `${p}-color`).join(' ');
                  const minutes = upload.scheduledDate.getMinutes();
                  const minutesStyle = `top: ${minutes / 60 * 100}%`;
                  
                  return `
                    <div class="week-event ${platformClasses}" data-upload-id="${upload.id}" style="${minutesStyle}">
                      <span class="event-time">${this.formatTime(upload.scheduledDate)}</span>
                      <span class="event-title">${upload.title}</span>
                    </div>
                  `;
                }).join('');
                
                return `<div class="week-slot" data-date="${slotDate.toISOString()}">${uploadsHtml}</div>`;
              }).join('')}
            </div>
          </div>
        `);
      }
      
      return `
        <div class="week-calendar">
          <div class="week-header">
            <div class="week-time-label"></div>
            <div class="week-days">
              ${weekdayHeader}
            </div>
          </div>
          <div class="week-body">
            <div class="time-slots">
              ${timeSlots.join('')}
            </div>
          </div>
        </div>
      `;
    }
  
    renderDayView() {
      const date = this.currentDate;
      const dayName = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][date.getDay()];
      
      const timeSlots = [];
      for (let hour = 0; hour < 24; hour++) {
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);
        
        const uploads = this.scheduledUploads.filter(upload => 
          upload.scheduledDate.getDate() === slotDate.getDate() &&
          upload.scheduledDate.getMonth() === slotDate.getMonth() &&
          upload.scheduledDate.getFullYear() === slotDate.getFullYear() &&
          upload.scheduledDate.getHours() === hour
        );
        
        const uploadsHtml = uploads.map(upload => {
          const platformClasses = upload.platforms.map(p => `${p}-color`).join(' ');
          const minutes = upload.scheduledDate.getMinutes();
          const minutesStyle = `top: ${minutes / 60 * 100}%`;
          
          return `
            <div class="day-event ${platformClasses}" data-upload-id="${upload.id}" style="${minutesStyle}">
              <span class="event-time">${this.formatTime(upload.scheduledDate)}</span>
              <span class="event-title">${upload.title}</span>
              <div class="event-platforms">
                ${upload.platforms.map(platform => 
                  `<div class="platform-icon platform-${platform}"></div>`
                ).join('')}
              </div>
            </div>
          `;
        }).join('');
        
        timeSlots.push(`
          <div class="time-slot">
            <div class="time-label">${hour}:00</div>
            <div class="day-slot" data-date="${slotDate.toISOString()}">
              ${uploadsHtml}
            </div>
          </div>
        `);
      }
      
      return `
        <div class="day-calendar">
          <div class="day-header">
            <h3>${dayName}, ${date.getDate()}. ${['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][date.getMonth()]}</h3>
          </div>
          <div class="day-body">
            <div class="time-slots">
              ${timeSlots.join('')}
            </div>
          </div>
        </div>
      `;
    }
  
    attachEventListeners() {
      // Navigation buttons
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const todayBtn = document.getElementById('today-btn');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.navigatePrev());
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.navigateNext());
      }
      
      if (todayBtn) {
        todayBtn.addEventListener('click', () => this.navigateToday());
      }
      
      // View buttons
      const monthViewBtn = document.getElementById('month-view-btn');
      const weekViewBtn = document.getElementById('week-view-btn');
      const dayViewBtn = document.getElementById('day-view-btn');
      
      if (monthViewBtn) {
        monthViewBtn.addEventListener('click', () => this.switchView('month'));
      }
      
      if (weekViewBtn) {
        weekViewBtn.addEventListener('click', () => this.switchView('week'));
      }
      
      if (dayViewBtn) {
        dayViewBtn.addEventListener('click', () => this.switchView('day'));
      }
      
      // Tage klickbar machen (für Datumsauswahl)
      const days = document.querySelectorAll('.day:not(.empty)');
      days.forEach(day => {
        day.addEventListener('click', () => {
          const dateStr = day.getAttribute('data-date');
          if (dateStr) {
            this.selectDate(new Date(dateStr));
          }
        });
      });
      
      // Events klickbar machen
      const events = document.querySelectorAll('.calendar-event, .week-event, .day-event');
      events.forEach(event => {
        event.addEventListener('click', (e) => {
          e.stopPropagation(); // Verhindert, dass das Day-Click-Event ausgelöst wird
          const uploadId = event.getAttribute('data-upload-id');
          if (uploadId) {
            this.openUploadDetails(uploadId);
          }
        });
      });
    }
  
    navigatePrev() {
      if (this.currentView === 'month') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      } else if (this.currentView === 'week') {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - 7);
        this.currentDate = newDate;
      } else { // day view
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - 1);
        this.currentDate = newDate;
      }
      
      this.render();
      this.attachEventListeners();
    }
  
    navigateNext() {
      if (this.currentView === 'month') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      } else if (this.currentView === 'week') {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + 7);
        this.currentDate = newDate;
      } else { // day view
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + 1);
        this.currentDate = newDate;
      }
      
      this.render();
      this.attachEventListeners();
    }
  
    navigateToday() {
      this.currentDate = new Date();
      this.render();
      this.attachEventListeners();
    }
  
    switchView(view) {
      this.currentView = view;
      this.render();
      this.attachEventListeners();
    }
  
    selectDate(date) {
      this.selectedDate = date;
      
      // Entferne bisherige Auswahl
      const selectedDays = document.querySelectorAll('.day.selected');
      selectedDays.forEach(day => day.classList.remove('selected'));
      
      // Füge Auswahl-Klasse zum geklickten Tag hinzu
      const clickedDay = document.querySelector(`.day[data-date="${date.toISOString()}"]`);
      if (clickedDay) {
        clickedDay.classList.add('selected');
      }
      
      // Optional: Wechsle zur Tagesansicht beim Klicken auf einen Tag
      this.currentDate = date;
      this.switchView('day');
    }
  
    openUploadDetails(uploadId) {
      const upload = this.scheduledUploads.find(u => u.id.toString() === uploadId);
      
      if (!upload) return;
      
      // Hier würde normalerweise ein Modal mit Uploaddetails geöffnet werden
      // Für die Demo zeigen wir ein Alert
      alert(`
        Upload-Details:
        
        Titel: ${upload.title}
        Plattformen: ${upload.platforms.join(', ')}
        Geplant für: ${upload.scheduledDate.toLocaleString()}
        Status: ${upload.status}
      `);
    }
  
    getWeekDates(date) {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Passt für europäische Wochen an (Montag = Erster Tag)
      
      const monday = new Date(date);
      monday.setDate(diff);
      
      const weekDates = [new Date(monday)];
      
      for (let i = 1; i < 7; i++) {
        const nextDay = new Date(monday);
        nextDay.setDate(monday.getDate() + i);
        weekDates.push(nextDay);
      }
      
      return weekDates;
    }
  
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    }
  
    isSelectedDate(date) {
      if (!this.selectedDate) return false;
      
      return date.getDate() === this.selectedDate.getDate() &&
             date.getMonth() === this.selectedDate.getMonth() &&
             date.getFullYear() === this.selectedDate.getFullYear();
    }
  
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    }
  
    formatTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  
  // Exportieren für die Verwendung in anderen Dateien
  if (typeof module !== 'undefined') {
    module.exports = UploadCalendar;
  }