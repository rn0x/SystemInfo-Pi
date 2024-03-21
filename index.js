import { launch } from 'puppeteer-core';
import express from 'express';
import SystemInfo from './SystemInfo.js'; // استبدل بالمسار الصحيح لملف SystemInfo.js
import path from 'path';


const __dirname = path.resolve();
const app = express();
const sysInfo = new SystemInfo();

// استخدام middleware لتقديم الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// عرف مسارًا لعرض ملف HTML
app.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ غير متوقع' });
    }
});


app.get('/system-info', async (req, res) => {
    try {
        const systemInfo = await sysInfo?.getSystemInfo();
        if (sysInfo?.error) {
            res.status(500).json({ error: 'حدث خطأ في جلب معلومات النظام' });
        } else {
            res.json(systemInfo);
        }
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ غير متوقع' });
    }
});

// بدء الخادم
const port = 5000;
app.listen(port, () => {
    console.log(`الخادم يعمل على المنفذ http://localhost:${port}`);
});

async function getSystemInfoWithPuppeteer() {
    const browser = await launch({
        headless: false, // تشغيل المتصفح في وضع كوش
        args: [
            '--start-maximized',
            '--kiosk',
            '--auto-hide-toolbar',
            '--disable-infobars',
            '--no-sandbox',
            '--disable-dev-shm-usage'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: "/usr/bin/chromium",
        defaultViewport: null, // استخدام عرض الشاشة الافتراضي دون قيود
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:5000/');
    await page.evaluate(() => {
        // قم بتعطيل التمرير في الصفحة
        document.body.style.overflow = 'hidden';
        // إخفاء المؤشر
        document.body.style.cursor = 'none';
    });

    const systemInfo = await page.evaluate(() => {
        return {
            osType: document.getElementById('osType').innerText,
            cpuModel: document.getElementById('cpuModel').innerText,
            totalMemory: document.getElementById('totalMemory').innerText,
            freeMemory: document.getElementById('freeMemory').innerText,
            internalIP: document.getElementById('internalIP').innerText,
            externalIP: document.getElementById('externalIP').innerText
        };
    });

    return systemInfo;
}


await getSystemInfoWithPuppeteer();