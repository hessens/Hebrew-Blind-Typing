/* scripts/main.js */

// --- AUTHENTICATION CHECK ---
const currentUser = localStorage.getItem('blindTyping_currentUser');
if (!currentUser && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}

// --- GLOBAL VARIABLES ---
let currentLessonFile = "";
let currentIndex = 0;
let currentPattern = "";
let startTime = null;
let backspaceCount = 0;
let isLessonActive = false;

// --- TEST MODE VARIABLES ---
let testMode = 'words';
let timeLimit = 60;
let timerInterval = null;

// --- WORD BANK ---
const wordBank = [
    "שלום", "עולם", "בית", "ספר", "מחשב", "תוכנה", "קוד", "ים", "שמש",
    "חבר", "משפחה", "זמן", "מקום", "דרך", "אמת", "מים", "אש", "רוח",
    "אדמה", "שמיים", "לילה", "בוקר", "ערב", "שבוע", "שנה", "חודש",
    "רגע", "חיים", "אהבה", "שמחה", "עצב", "פחד", "תקווה", "חלום",
    "ילד", "ילדה", "איש", "אישה", "סוס", "כלב", "חתול", "ציפור",
    "עץ", "פרח", "דשא", "הר", "עמק", "נהר", "ים", "חוף",
    "מכונית", "רכבת", "מטוס", "אופניים", "ספינה", "דרך", "גשר",
    "עיר", "כפר", "מדינה", "עולם", "יקום", "כוכב", "שמש", "ירח",
    "לחם", "חלב", "גבינה", "ביצה", "תפוח", "בננה", "תפוז", "עגבניה",
    "מלפפון", "פלפל", "בצל", "שום", "שמן", "מלח", "סוכר", "קמח",
    "אורז", "בשר", "עוף", "דג", "מרק", "גלידה", "עוגה", "שוקולד",
    "קפה", "תה", "מיץ", "יין", "בירה", "פיצה", "פלאפל", "חומוס",
    "שולחן", "כיסא", "מיטה", "ארון", "מנורה", "דלת", "חלון", "קיר",
    "רצפה", "תקרה", "גג", "גינה", "מרפסת", "מדרגות", "מעלית",
    "עט", "עיפרון", "מחק", "סרגל", "מחברת", "ילקוט", "תיק", "ארנק",
    "מפתח", "משקפיים", "שעון", "טלפון", "מקלדת", "עכבר", "מסך",
    "רדיו", "מצלמה", "תמונה", "סוללה", "מטען",
    "חולצה", "מכנסיים", "שמלה", "חצאית", "מעיל", "כובע", "נעליים",
    "גרביים", "ראש", "יד", "רגל", "עין", "אוזן", "פה", "אף", "שיער",
    "לב", "בטן", "גב", "כתף", "אצבע",
    "אדום", "כחול", "ירוק", "צהוב", "לבן", "שחור", "סגול", "כתום",
    "ורוד", "חום", "אפור", "זהב", "כסף", "גשם", "שלג", "ברד",
    "ענן", "קשת", "שרב", "סערה", "מדבר", "יער", "חול", "אבן",
    "ללכת", "לרוץ", "לקפוץ", "לשבת", "לעמוד", "לישון", "לאכול",
    "לשתות", "לדבר", "לשמוע", "לראות", "לחשוב", "לדעת", "להבין",
    "לרצות", "לאהוב", "לצחוק", "לבכות", "לכתוב", "לקרוא", "ללמוד",
    "לעבוד", "לשחק", "לשיר", "לרקוד", "חופש", "צדק", "כוח",
    "שקט", "רעש", "מהר", "לאט", "גדול", "קטן", "חדש", "ישן"
];

// ======================================================
// 1. USER DATA & PROGRESS
// ======================================================

function getUserKey(type) {
    return `${type}_${currentUser}`;
}

restoreProgress();

function restoreProgress() {
    const visited = JSON.parse(localStorage.getItem(getUserKey('visited'))) || [];
    visited.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) button.classList.add('is-toggled');
    });
}

function toggleButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('is-toggled');
        let visited = JSON.parse(localStorage.getItem(getUserKey('visited'))) || [];
        if (!visited.includes(selector)) {
            visited.push(selector);
            localStorage.setItem(getUserKey('visited'), JSON.stringify(visited));
        }
    }
}

function resetLevel(selectors) {
    let visited = JSON.parse(localStorage.getItem(getUserKey('visited'))) || [];
    selectors.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) button.classList.remove('is-toggled');
        visited = visited.filter(item => item !== selector);
    });
    localStorage.setItem(getUserKey('visited'), JSON.stringify(visited));
}

function saveUserStat(wpm) {
    let stats = JSON.parse(localStorage.getItem(getUserKey('stats'))) || [];
    stats.push(wpm);
    localStorage.setItem(getUserKey('stats'), JSON.stringify(stats));
}

function renderProfile() {
    const header = document.querySelector('h2');
    if(header) header.innerText = `פרופיל: ${currentUser}`;

    const countEl = document.getElementById('stat-count');
    const avgEl = document.getElementById('stat-avg');
    const bestEl = document.getElementById('stat-best');
    const lastEl = document.getElementById('stat-last');

    if (countEl) {
        const stats = JSON.parse(localStorage.getItem(getUserKey('stats'))) || [];

        if (stats.length === 0) {
            countEl.innerText = '0'; avgEl.innerText = '0';
            bestEl.innerText = '0'; lastEl.innerText = '0';
        } else {
            countEl.innerText = stats.length;
            lastEl.innerText = stats[stats.length - 1];
            bestEl.innerText = Math.max(...stats);
            const sum = stats.reduce((a, b) => a + b, 0);
            avgEl.innerText = Math.round(sum / stats.length);
        }
    }
}

function logout() {
    localStorage.removeItem('blindTyping_currentUser');
    window.location.href = 'login.html';
}

// ======================================================
// 2. HELPER: NEXT LEVEL LOGIC
// ======================================================
function getNextLevelPath() {
    if (!currentLessonFile) return null;
    const match = currentLessonFile.match(/lesson(\d+)\/lesson\d+-level(\d+)\.html/);
    if (match) {
        let lessonNum = parseInt(match[1]);
        let levelNum = parseInt(match[2]);
        if (levelNum < 4) {
            return `levels/lesson${lessonNum}/lesson${lessonNum}-level${levelNum + 1}.html`;
        } else if (levelNum === 4 && lessonNum < 8) {
            return `levels/lesson${lessonNum + 1}/lesson${lessonNum + 1}-level1.html`;
        }
    }
    return null;
}

// ======================================================
// 3. KEYBOARD EVENT LISTENER
// ======================================================
document.addEventListener('keydown', function(event) {
    if (event.key.length > 1 && event.key !== 'Backspace') return;
    if (!isLessonActive) return;

    const pressedKey = event.key;
    const textContainer = document.getElementById('target-text');

    if (startTime === null) {
        startTime = new Date();
        startTestTimer();
    }

    if (pressedKey === 'Backspace') {
        backspaceCount++;
        if (textContainer && currentPattern.length > 0) {
            const letterSpans = textContainer.querySelectorAll('span');
            if (currentIndex > 0) {
                currentIndex--;
                const prevSpan = letterSpans[currentIndex];
                prevSpan.style.color = "#666";
                prevSpan.style.backgroundColor = "transparent";
            } else if (currentIndex < letterSpans.length) {
                letterSpans[currentIndex].style.color = "#666";
                letterSpans[currentIndex].style.backgroundColor = "transparent";
            }
        }
        autoScroll();
        return;
    }

    const allVirtualKeys = document.querySelectorAll('.keyboard-letter');
    allVirtualKeys.forEach(virtualKey => {
        if (virtualKey.innerText.trim() === pressedKey) {
            virtualKey.classList.add('active-key');
            setTimeout(() => virtualKey.classList.remove('active-key'), 200);
        }
    });

    if (textContainer && currentPattern.length > 0) {
        const letterSpans = textContainer.querySelectorAll('span');
        const currentSpan = letterSpans[currentIndex];

        if (currentSpan) {
            if (pressedKey === currentPattern[currentIndex]) {
                currentSpan.style.color = "white";
                currentSpan.style.backgroundColor = "transparent";
            } else {
                currentSpan.style.color = "#ff4444";
                if (pressedKey === " " || currentPattern[currentIndex] === " ") {
                     currentSpan.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
                }
            }
            currentIndex++;
            autoScroll();

            if (currentIndex === currentPattern.length) {
                finishLesson();
            }
        }
    }
});

// ======================================================
// 4. AUTO SCROLL
// ======================================================
function autoScroll() {
    const textContainer = document.getElementById('target-text');
    if (!textContainer) return;
    const letterSpans = textContainer.querySelectorAll('span');
    let activeSpan = letterSpans[currentIndex];
    if (!activeSpan && currentIndex > 0) activeSpan = letterSpans[currentIndex - 1];

    if (activeSpan) {
        const spanTop = activeSpan.offsetTop;
        const lineHeight = 70;
        textContainer.scrollTop = spanTop - lineHeight;
    }
}

// ======================================================
// 5. FINISH LESSON (UPDATED LOGIC)
// ======================================================
function finishLesson() {
    isLessonActive = false;
    if (timerInterval) clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timer-display');
    if(timerDisplay) timerDisplay.style.display = 'none';

    const endTime = new Date();
    let durationSeconds = (endTime - startTime) / 1000;
    if (testMode === 'time') durationSeconds = timeLimit;
    if (durationSeconds < 1) durationSeconds = 1;
    const timeInMinutes = durationSeconds / 60;

    const textContainer = document.getElementById('target-text');

    // Expand container
    textContainer.style.height = 'auto';
    textContainer.style.overflow = 'visible';

    const spans = textContainer.querySelectorAll('span');
    let successfulWordsCount = 0;
    let isCurrentWordPerfect = true;
    let hasStartedWord = false;

    spans.forEach((span, index) => {
        const char = span.innerText;
        const color = span.style.color;
        if (char === ' ') {
            if (hasStartedWord && isCurrentWordPerfect) successfulWordsCount++;
            isCurrentWordPerfect = true; hasStartedWord = false;
        } else {
            hasStartedWord = true;
            if (color !== 'white') isCurrentWordPerfect = false;
        }
        if (index === spans.length - 1 && hasStartedWord && isCurrentWordPerfect) successfulWordsCount++;
    });

    const wpm = Math.round(successfulWordsCount / timeInMinutes);

    // --- SAVE STATS LOGIC (UPDATED) ---
    // Check if we are in Test Mode (using the existence of the word-count input)
    // If we are in a regular lesson, 'word-count' won't exist, so we skip saving.
    const isTest = document.getElementById('word-count');
    if (isTest) {
        saveUserStat(wpm);
    }

    // Determine Buttons
    let nextBtnHTML = '';
    if (!isTest) {
        const nextPath = getNextLevelPath();
        if (nextPath) {
            nextBtnHTML = `<button onclick="loadContent('${nextPath}', 'level-content-container')" class="return-button">לשלב הבא</button>`;
        }
    }
    const restartFunc = isTest ? "restartTest()" : "restartLesson()";

    textContainer.innerHTML = `
        <div class="lesson-complete-message">
            <h3>${isTest ? 'המבחן הסתיים!' : 'סיימת בהצלחה!'}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: right; max-width: 400px; margin: 0 auto;">
                <p>מילים נכונות:</p> <p style="color: white; font-weight: bold;">${successfulWordsCount}</p>
                <p>מהירות (WPM):</p> <p style="color: white; font-weight: bold;">${wpm}</p>
                <p>זמן:</p> <p>${durationSeconds.toFixed(1)} שניות</p>
                <p>מחיקות:</p> <p>${backspaceCount}</p>
            </div>
            <div style="margin-top: 30px; text-align: center; display: flex; justify-content: center; gap: 10px;">
                <button onclick="${restartFunc}" class="return-button">נסה שוב</button>
                ${nextBtnHTML}
                <button onclick="showLessonsGrid()" class="return-button">לתפריט</button>
            </div>
        </div>
    `;
}

// ======================================================
// 6. TEST MODE
// ======================================================
function setTestMode(mode) {
    testMode = mode;
    const tabWords = document.getElementById('tab-words');
    const tabTime = document.getElementById('tab-time');
    if(tabWords) tabWords.className = mode === 'words' ? 'mode-btn active' : 'mode-btn';
    if(tabTime) tabTime.className = mode === 'time' ? 'mode-btn active' : 'mode-btn';
    const divWords = document.getElementById('words-options');
    const divTime = document.getElementById('time-options');
    if(divWords) divWords.style.display = mode === 'words' ? 'block' : 'none';
    if(divTime) divTime.style.display = mode === 'time' ? 'block' : 'none';
}

function selectTime(seconds, btnElement) {
    timeLimit = seconds;
    const buttons = document.querySelectorAll('.time-btn');
    buttons.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function generateTest() {
    const textContainer = document.getElementById('target-text');
    const controls = document.querySelector('.test-container');
    const timerDisplay = document.getElementById('timer-display');
    if (textContainer) {
        let count;
        if (testMode === 'words') {
            const input = document.getElementById('word-count');
            count = parseInt(input.value) || 20;
            if (count < 5) count = 5; if (count > 200) count = 200;
        } else {
            count = 300;
            if (timerDisplay) {
                timerDisplay.style.display = 'block';
                timerDisplay.innerText = formatTime(timeLimit);
            }
        }
        let testString = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * wordBank.length);
            testString.push(wordBank[randomIndex]);
        }
        textContainer.innerText = testString.join(' ');
        if (controls) controls.style.display = 'none';
        initLesson();
    }
}

function startTestTimer() {
    if (timerInterval) clearInterval(timerInterval);
    if (testMode === 'time') {
        let remaining = timeLimit;
        const timerDisplay = document.getElementById('timer-display');
        timerInterval = setInterval(() => {
            remaining--;
            if (timerDisplay) timerDisplay.innerText = formatTime(remaining);
            if (remaining <= 0) {
                clearInterval(timerInterval);
                finishLesson();
            }
        }, 1000);
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ======================================================
// 7. NAVIGATION
// ======================================================

function restartTest() {
    loadContent('levels/test-setup.html', 'level-content-container');
    currentPattern = ""; isLessonActive = false; if (timerInterval) clearInterval(timerInterval);
}

function restartLesson() {
    const textContainer = document.getElementById('target-text');
    if (textContainer && currentPattern) {
        textContainer.style.height = '';
        textContainer.style.overflow = '';

        currentIndex = 0; startTime = null; backspaceCount = 0; isLessonActive = true;
        textContainer.scrollTop = 0; textContainer.innerHTML = '';
        for (let char of currentPattern) {
            const span = document.createElement('span');
            span.innerText = char; span.style.color = "#666"; textContainer.appendChild(span);
        }
    }
}

function initLesson() {
    const textContainer = document.getElementById('target-text');
    if (textContainer) {
        currentPattern = textContainer.innerText;
        restartLesson();
        const kbPlaceholder = document.getElementById('keyboard-show-placeholder');
        if (kbPlaceholder && kbPlaceholder.innerHTML === "") {
             fetch('levels/keyboard-show.html').then(r => r.ok ? r.text() : '').then(kbData => kbPlaceholder.innerHTML = kbData);
        }
    }
}

function loadContent(fileName, targetId) {
    currentLessonFile = fileName;

    fetch(fileName).then(r => r.ok ? r.text() : '').then(data => {
        if (data) {
            const lessonsGrid = document.querySelector('.lessons-grid');
            if (lessonsGrid) lessonsGrid.style.display = 'none';
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.innerHTML = data;

                if (fileName.includes('profile')) {
                    if (typeof renderProfile === "function") renderProfile();
                } else if (fileName.includes('test-setup')) {
                    const kbPlaceholder = document.getElementById('keyboard-show-placeholder');
                    if (kbPlaceholder) fetch('levels/keyboard-show.html').then(r => r.ok ? r.text() : '').then(kbData => kbPlaceholder.innerHTML = kbData);
                } else {
                    testMode = 'words'; initLesson();
                }
            }
        }
    });
}

function showLessonsGrid() {
    const lessonsGrid = document.querySelector('.lessons-grid');

    if (lessonsGrid) lessonsGrid.style.display = 'grid';

    const contentContainer = document.getElementById('level-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = '';
        currentPattern = "";
        isLessonActive = false;
        if (timerInterval) clearInterval(timerInterval);
    }
}

fetch('sidebar.html').then(r => r.ok ? r.text() : '').then(data => document.getElementById('sidebar-placeholder').innerHTML = data);