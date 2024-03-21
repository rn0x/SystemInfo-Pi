import os from 'os';
import fetch from 'node-fetch';

/**
 * كلاس SystemInfo لجمع واسترداد معلومات النظام
 */
export default class SystemInfo {
    constructor() {
        /**
         * يتم استخدامه لتخزين الأخطاء في حال حدوث أي استثناء
         * @type {Error | null}
         */
        this.error = null;
    }

    /**
     * دالة getSystemInfo لجمع معلومات النظام
     * @returns {Object} معلومات النظام
     */
    async getSystemInfo() {
        try {
            const systemInfo = {
                osType: os.type(),
                cpuModel: os.cpus()[0].model,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                storageInfo: {
                    totalStorage: os.totalmem(),
                    freeStorage: os.freemem(),
                },
                internalIP: this.getInternalIP(),
                externalIP: await this.getExternalIP(),
            };
            return systemInfo;
        } catch (error) {
            this.error = error;
            return null;
        }
    }

    /**
     * دالة للحصول على عنوان IP الداخلي
     * @returns {string | null} عنوان IP الداخلي، إذا لم يتم العثور عليه يعيد قيمة null
     */
    getInternalIP() {
        const interfaces = os.networkInterfaces();
        for (const iface in interfaces) {
            for (const addressInfo of interfaces[iface]) {
                if (!addressInfo.internal && addressInfo.family === 'IPv4') {
                    return addressInfo.address;
                }
            }
        }
        return null;
    }

    /**
     * دالة للحصول على عنوان IP الخارجي باستخدام خدمة "ipify"
     * @returns {Promise<string>} عنوان IP الخارجي
     * @throws {Error} في حالة فشل الحصول على عنوان IP الخارجي
     */
    async getExternalIP() {
        try {
            const response = await fetch('https://api.ipify.org/?format=json');
            if (!response.ok) {
                return 'فشل في استرداد عنوان IP الخارجي';
            }
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'فشل في استرداد عنوان IP الخارجي';
        }
    }
}

// // مثال على استخدام الكلاس
// const sysInfo = new SystemInfo();
// sysInfo.getSystemInfo()
//     .then(systemInfo => {
//         if (sysInfo.error) {
//             console.error('حدث خطأ:', sysInfo.error);
//         } else {
//             console.log('معلومات النظام:', systemInfo);
//         }
//     });
