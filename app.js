document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. Mobile Navigation Toggle
    // =========================================
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // =========================================
    // 2. Navbar scroll effect
    // =========================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // =========================================
    // 3. Intersection Observer for Fade-In
    // =========================================
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => appearOnScroll.observe(fader));

    // =========================================
    // 4. Countdown Timer (버그 수정: 11시 기준, 자동 재계산)
    // =========================================
    const WORSHIP_HOUR = 11; // 주일오전예배 11:00

    function getNextSunday() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday
        let daysUntilSunday = (7 - day) % 7;
        
        // 오늘이 일요일이고 아직 예배 시간 전이면 오늘
        if (day === 0 && now.getHours() < WORSHIP_HOUR) {
            daysUntilSunday = 0;
        }
        // 오늘이 일요일이고 예배 시간 지났으면 다음 주
        if (day === 0 && now.getHours() >= WORSHIP_HOUR) {
            daysUntilSunday = 7;
        }

        const target = new Date(now);
        target.setDate(now.getDate() + daysUntilSunday);
        target.setHours(WORSHIP_HOUR, 0, 0, 0);
        return target;
    }

    let targetDate = getNextSunday();

    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-minutes');
    const cdSecs = document.getElementById('cd-seconds');

    function updateCountdown() {
        const now = new Date();
        let distance = targetDate - now;

        // 목표 시간이 지나면 다음 주일로 재계산 (무한 리로드 방지)
        if (distance <= 0) {
            targetDate = getNextSunday();
            distance = targetDate - now;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        cdDays.innerText = String(days).padStart(2, '0');
        cdHours.innerText = String(hours).padStart(2, '0');
        cdMins.innerText = String(minutes).padStart(2, '0');
        cdSecs.innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // =========================================
    // 5. Announcements
    // =========================================
    const defaultAnnouncements = [
        { id: 1, title: '본교회 마당 포장공사 완료', content: '11월 25일(화) 본교회 마당 포장공사가 완료되었습니다.', date: '2025-11-25' },
        { id: 2, title: '고성레미콘 헌납', content: '고성레미콘에서 약 400만원 상당의 레미콘을 본교회에 헌납하셨습니다.', date: '2025-11-25' },
        { id: 3, title: '심방 예배 안내', content: '12월 3일(수) 오후 4시 30분, 강종우 집사 산방에서 심방 예배가 있습니다.', date: '2025-11-30' },
        { id: 4, title: '신영희 권사 성경 20회 완독', content: '신영희 권사님께서 성경 20회 완독을 하셨습니다. (점심으로 섬김)', date: '2025-11-30' },
        { id: 5, title: '총회함안기도원 준공감사예배', content: '12월 12일(금) 오후 2시 총회함안기도원 준공감사예배가 있습니다.', date: '2025-11-30' }
    ];

    let announcements;
    try {
        announcements = JSON.parse(localStorage.getItem('church_announcements')) || defaultAnnouncements;
    } catch(e) {
        announcements = defaultAnnouncements;
    }

    function saveAnnouncements() {
        localStorage.setItem('church_announcements', JSON.stringify(announcements));
    }

    const announcementsList = document.getElementById('announcementsList');

    function renderAnnouncements() {
        announcementsList.innerHTML = '';
        announcements.forEach(item => {
            const div = document.createElement('div');
            div.className = 'announcement-item';
            div.innerHTML = `
                <div class="announcement-content">
                    <h4>${escapeHtml(item.title)}</h4>
                    <p>${escapeHtml(item.content)}</p>
                </div>
                <div class="admin-action-wrap">
                    <span class="announcement-date">${escapeHtml(item.date)}</span>
                    <button class="admin-btn admin-only" onclick="deleteAnnouncement(${item.id})">삭제</button>
                </div>
            `;
            announcementsList.appendChild(div);
        });
    }

    renderAnnouncements();

    // =========================================
    // 6. Sermons (신규)
    // =========================================
    const defaultSermons = [
        { id: 1, title: '더욱 주를 찬송', scripture: '시편 71:14', preacher: '송영섭 목사', date: '2025-12-31', videoUrl: '' },
        { id: 2, title: '위대한 명령! 위대한 순종!', scripture: '마태복음 28:18~20', preacher: '송영섭 목사', date: '2025-12-28', videoUrl: '' },
        { id: 3, title: '사울과 다윗', scripture: '사무엘하 3:1', preacher: '정도연 목사', date: '2025-12-28', videoUrl: '' },
        { id: 4, title: '신앙 베이직(7) - 성경', scripture: '시편 19:7-10', preacher: '송영섭 목사', date: '2025-12-24', videoUrl: '' }
    ];

    let sermons;
    try {
        sermons = JSON.parse(localStorage.getItem('church_sermons')) || defaultSermons;
    } catch(e) {
        sermons = defaultSermons;
    }

    function saveSermons() {
        localStorage.setItem('church_sermons', JSON.stringify(sermons));
    }

    const sermonsList = document.getElementById('sermonsList');

    function getYoutubeEmbedUrl(url) {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1];
            const ampIndex = videoId.indexOf('&');
            if (ampIndex !== -1) videoId = videoId.substring(0, ampIndex);
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
            const qIndex = videoId.indexOf('?');
            if (qIndex !== -1) videoId = videoId.substring(0, qIndex);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    function renderSermons() {
        if (!sermonsList) return;
        sermonsList.innerHTML = '';
        sermons.forEach(item => {
            const div = document.createElement('div');
            div.className = 'sermon-card';

            let videoHtml = '';
            if (item.videoUrl && item.videoUrl.trim()) {
                const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
                videoHtml = `
                    <div class="sermon-video-wrap">
                        <iframe src="${escapeHtml(embedUrl)}" allowfullscreen loading="lazy"></iframe>
                    </div>`;
            } else {
                videoHtml = `
                    <div class="sermon-video-wrap">
                        <div class="sermon-video-placeholder">📖</div>
                    </div>`;
            }

            div.innerHTML = `
                ${videoHtml}
                <div class="sermon-info">
                    <span class="sermon-date-badge">${escapeHtml(item.date)}</span>
                    <h4>${escapeHtml(item.title)}</h4>
                    <div class="sermon-meta">
                        <span>📜 ${escapeHtml(item.scripture)}</span>
                        <span>🎤 ${escapeHtml(item.preacher)}</span>
                    </div>
                    <div class="admin-action-wrap admin-only" style="margin-top: 10px;">
                        <button class="admin-btn" onclick="deleteSermon(${item.id})">삭제</button>
                    </div>
                </div>
            `;
            sermonsList.appendChild(div);
        });
    }

    renderSermons();

    // =========================================
    // 7. Gallery
    // =========================================
    const defaultGalleryItems = [
        { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80', caption: '은혜로운 예배 시간' },
        { id: 2, type: 'image', url: 'https://picsum.photos/seed/fellowship/800/600', caption: '따뜻한 교제' },
        { id: 3, type: 'image', url: 'https://picsum.photos/seed/praise/800/600', caption: '하나님께 찬양' }
    ];

    let galleryItems;
    try {
        galleryItems = JSON.parse(localStorage.getItem('church_gallery')) || defaultGalleryItems;
    } catch(e) {
        galleryItems = defaultGalleryItems;
    }

    function saveGallery() {
        localStorage.setItem('church_gallery', JSON.stringify(galleryItems));
    }

    const galleryList = document.getElementById('galleryList');

    function renderGallery() {
        if (!galleryList) return;
        galleryList.innerHTML = '';
        galleryItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            
            let mediaHtml = '';
            if (item.type === 'video') {
                let finalUrl = item.url;
                if (finalUrl.includes('youtube.com/watch?v=')) {
                    finalUrl = finalUrl.replace('/watch?v=', '/embed/');
                } else if (finalUrl.includes('youtu.be/')) {
                    finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
                }
                if (finalUrl.startsWith('data:video') || finalUrl.endsWith('.mp4') || finalUrl.endsWith('.webm')) {
                    mediaHtml = `<video src="${finalUrl}" controls style="width:100%; height:100%; object-fit:cover;"></video>`;
                } else {
                    mediaHtml = `<iframe src="${finalUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%;"></iframe>`;
                }
            } else {
                mediaHtml = `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption)}" onclick="openLightbox('${escapeHtml(item.url)}', '${escapeHtml(item.caption)}')">`;
            }

            div.innerHTML = `
                ${mediaHtml}
                <div class="gallery-overlay"><span>${escapeHtml(item.caption)}</span></div>
                <div class="admin-action-wrap admin-only" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                    <button class="admin-btn" style="background-color: rgba(255,255,255,0.9); box-shadow: 0 2px 5px rgba(0,0,0,0.2);" onclick="event.stopPropagation(); deleteGalleryItem(${item.id})">삭제</button>
                </div>
            `;
            galleryList.appendChild(div);
        });
    }

    renderGallery();

    // =========================================
    // 8. Lightbox (신규)
    // =========================================
    window.openLightbox = function(url, caption) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        const cap = document.getElementById('lightboxCaption');
        img.src = url;
        cap.textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function(e) {
        if (e && e.target !== e.currentTarget && !e.target.classList.contains('lightbox-close')) return;
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    // ESC 키로 라이트박스 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lightbox = document.getElementById('lightbox');
            if (lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
            // 모달도 닫기
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // =========================================
    // 9. Admin Mode Toggle (비밀번호 해시 비교로 개선)
    // =========================================
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    let isAdmin = false;

    // 간단한 해시 함수 (실제 운영 시 서버 인증으로 교체 필요)
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash;
    }

    // "admin" 의 해시값 (초기 비밀번호, 반드시 변경하세요)
    const ADMIN_HASH = simpleHash("admin");

    adminToggleBtn.addEventListener('click', () => {
        if (!isAdmin) {
            const pwd = prompt("관리자 비밀번호를 입력하세요:");
            if (pwd !== null && simpleHash(pwd) === ADMIN_HASH) {
                isAdmin = true;
                document.body.classList.add('admin-mode');
                adminToggleBtn.innerText = '🔓';
                adminToggleBtn.title = '관리자 모드 종료';
                alert('관리자 모드로 전환되었습니다.');
            } else if (pwd !== null) {
                alert('비밀번호가 틀렸습니다.');
            }
        } else {
            isAdmin = false;
            document.body.classList.remove('admin-mode');
            adminToggleBtn.innerText = '🔒';
            adminToggleBtn.title = '관리자 모드 접속';
        }
    });

    // =========================================
    // 10. XSS 방지용 escape 함수
    // =========================================
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // =========================================
    // 11. Global functions (inline onclick)
    // =========================================

    // -- Announcements --
    window.addAnnouncement = function() {
        const title = prompt("새 공지 제목:");
        if (!title) return;
        const content = prompt("공지 내용:");
        if (!content) return;
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        announcements.unshift({ id: Date.now(), title, content, date: dateStr });
        saveAnnouncements();
        renderAnnouncements();
    };

    window.deleteAnnouncement = function(id) {
        if (confirm("이 공지를 삭제하시겠습니까?")) {
            announcements = announcements.filter(a => a.id !== id);
            saveAnnouncements();
            renderAnnouncements();
        }
    };

    // -- Sermons --
    window.addSermon = function() {
        document.getElementById('sermonModal').classList.add('active');
        // 날짜 기본값 오늘
        document.getElementById('sermonDate').valueAsDate = new Date();
    };

    window.closeSermonModal = function() {
        document.getElementById('sermonModal').classList.remove('active');
        document.getElementById('sermonTitle').value = '';
        document.getElementById('sermonScripture').value = '';
        document.getElementById('sermonPreacher').value = '';
        document.getElementById('sermonDate').value = '';
        document.getElementById('sermonVideoUrl').value = '';
    };

    window.saveSermon = function() {
        const title = document.getElementById('sermonTitle').value.trim();
        const scripture = document.getElementById('sermonScripture').value.trim();
        const preacher = document.getElementById('sermonPreacher').value.trim();
        const date = document.getElementById('sermonDate').value;
        const videoUrl = document.getElementById('sermonVideoUrl').value.trim();

        if (!title || !scripture || !preacher) {
            alert('제목, 성경 본문, 설교자는 필수 입력입니다.');
            return;
        }

        sermons.unshift({
            id: Date.now(),
            title, scripture, preacher,
            date: date || new Date().toISOString().split('T')[0],
            videoUrl
        });
        saveSermons();
        renderSermons();
        closeSermonModal();
    };

    window.deleteSermon = function(id) {
        if (confirm("이 설교를 삭제하시겠습니까?")) {
            sermons = sermons.filter(s => s.id !== id);
            saveSermons();
            renderSermons();
        }
    };

    // -- Gallery / Media --
    window.openMediaModal = function() {
        document.getElementById('mediaModal').classList.add('active');
    };

    window.closeMediaModal = function() {
        document.getElementById('mediaModal').classList.remove('active');
        document.getElementById('mediaFile').value = '';
        document.getElementById('mediaUrl').value = '';
        document.getElementById('mediaCaption').value = '';
    };

    window.saveMediaItem = function() {
        const fileInput = document.getElementById('mediaFile');
        const urlInput = document.getElementById('mediaUrl').value.trim();
        const caption = document.getElementById('mediaCaption').value.trim();
        
        if (!caption) {
            alert("설명(캡션)을 입력해주세요.");
            return;
        }

        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const isVideo = file.type.startsWith('video/');
            const reader = new FileReader();
            
            reader.onload = function(e) {
                galleryItems.unshift({
                    id: Date.now(),
                    type: isVideo ? 'video' : 'image',
                    url: e.target.result,
                    caption: caption
                });
                saveGallery();
                renderGallery();
                closeMediaModal();
            };
            reader.readAsDataURL(file);
        } else if (urlInput) {
            const isVideo = (urlInput.includes('youtube') || urlInput.includes('youtu.be') || urlInput.includes('vimeo') || urlInput.endsWith('.mp4'));
            galleryItems.unshift({
                id: Date.now(),
                type: isVideo ? 'video' : 'image',
                url: urlInput,
                caption: caption
            });
            saveGallery();
            renderGallery();
            closeMediaModal();
        } else {
            alert("파일을 선택하거나 URL을 입력해주세요.");
        }
    };

    window.deleteGalleryItem = function(id) {
        if (confirm("이 미디어를 삭제하시겠습니까?")) {
            galleryItems = galleryItems.filter(item => item.id !== id);
            saveGallery();
            renderGallery();
        }
    };

    // -- Schedule Edit --
    window.editSection = function(section) {
        if (section === 'schedule') {
            const scheduleEl = document.getElementById('schedule');
            const isEditing = scheduleEl.classList.toggle('editing');
            const editBtn = document.querySelector('.edit-btn');
            const timeSpans = document.querySelectorAll('.schedule-list li span:nth-child(2)');
            
            if (isEditing) {
                editBtn.innerText = '💾 저장';
                timeSpans.forEach(span => {
                    span.contentEditable = true;
                    span.style.borderBottom = '1px solid var(--color-primary-dark)';
                    span.style.padding = '0 5px';
                    span.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                });
            } else {
                editBtn.innerText = '✏️ 편집';
                const scheduleData = [];
                timeSpans.forEach(span => {
                    span.contentEditable = false;
                    span.style.borderBottom = 'none';
                    span.style.padding = '0';
                    span.style.backgroundColor = 'transparent';
                    scheduleData.push(span.innerText);
                });
                localStorage.setItem('church_schedule', JSON.stringify(scheduleData));
                alert('예배 시간이 저장되었습니다.');
            }
        }
    };

    // Load saved schedule
    const savedSchedule = localStorage.getItem('church_schedule');
    if (savedSchedule) {
        try {
            const scheduleData = JSON.parse(savedSchedule);
            const timeSpans = document.querySelectorAll('.schedule-list li span:nth-child(2)');
            timeSpans.forEach((span, index) => {
                if (scheduleData[index]) {
                    span.innerText = scheduleData[index];
                }
            });
        } catch(e) { /* ignore */ }
    }

    // =========================================
    // 12. Scroll to Top Button
    // =========================================
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.innerHTML = '↑';
    scrollBtn.title = '맨 위로';
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

});
