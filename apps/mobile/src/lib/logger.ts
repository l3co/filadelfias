/**
 * Centralized logging utility for the mobile app
 * Only logs in development mode (__DEV__)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
    module: string;
    method?: string;
}

const COLORS = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
};

const formatTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};

const formatPrefix = (level: LogLevel, module: string, method?: string) => {
    const timestamp = formatTimestamp();
    const methodStr = method ? `.${method}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${module}${methodStr}]`;
};

const shouldLog = () => __DEV__;

export const logger = {
    debug: (options: LogOptions, message: string, ...args: any[]) => {
        if (!shouldLog()) return;
        const prefix = formatPrefix('debug', options.module, options.method);
        console.log(`${COLORS.debug}${prefix}${COLORS.reset}`, message, ...args);
    },

    info: (options: LogOptions, message: string, ...args: any[]) => {
        if (!shouldLog()) return;
        const prefix = formatPrefix('info', options.module, options.method);
        console.log(`${COLORS.info}${prefix}${COLORS.reset}`, message, ...args);
    },

    warn: (options: LogOptions, message: string, ...args: any[]) => {
        if (!shouldLog()) return;
        const prefix = formatPrefix('warn', options.module, options.method);
        console.warn(`${COLORS.warn}${prefix}${COLORS.reset}`, message, ...args);
    },

    error: (options: LogOptions, message: string, ...args: any[]) => {
        if (!shouldLog()) return;
        const prefix = formatPrefix('error', options.module, options.method);
        console.error(`${COLORS.error}${prefix}${COLORS.reset}`, message, ...args);
    },

    /**
     * Log API request details
     */
    apiRequest: (module: string, method: string, url: string, params?: any) => {
        if (!shouldLog()) return;
        logger.debug({ module, method }, `→ Request: ${url}`, params ? { params } : '');
    },

    /**
     * Log API response details
     */
    apiResponse: (module: string, method: string, status: number, data?: any) => {
        if (!shouldLog()) return;
        const summary = Array.isArray(data) ? `[${data.length} items]` : data?.id ? `{id: ${data.id}}` : '';
        logger.info({ module, method }, `← Response: ${status}`, summary);
    },

    /**
     * Log API error details
     */
    apiError: (module: string, method: string, error: any) => {
        if (!shouldLog()) return;
        logger.error({ module, method }, 'API Error:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            url: error?.config?.url,
            method: error?.config?.method,
        });
    },

    /**
     * Log state changes
     */
    state: (module: string, stateName: string, oldValue: any, newValue: any) => {
        if (!shouldLog()) return;
        logger.debug({ module }, `State [${stateName}]:`, { from: oldValue, to: newValue });
    },

    /**
     * Log navigation events
     */
    navigation: (from: string, to: string, params?: any) => {
        if (!shouldLog()) return;
        logger.info({ module: 'Navigation' }, `${from} → ${to}`, params || '');
    },

    /**
     * Create a scoped logger for a specific module
     */
    createModuleLogger: (moduleName: string) => ({
        debug: (method: string, message: string, ...args: any[]) => 
            logger.debug({ module: moduleName, method }, message, ...args),
        info: (method: string, message: string, ...args: any[]) => 
            logger.info({ module: moduleName, method }, message, ...args),
        warn: (method: string, message: string, ...args: any[]) => 
            logger.warn({ module: moduleName, method }, message, ...args),
        error: (method: string, message: string, ...args: any[]) => 
            logger.error({ module: moduleName, method }, message, ...args),
        apiRequest: (method: string, url: string, params?: any) => 
            logger.apiRequest(moduleName, method, url, params),
        apiResponse: (method: string, status: number, data?: any) => 
            logger.apiResponse(moduleName, method, status, data),
        apiError: (method: string, error: any) => 
            logger.apiError(moduleName, method, error),
    }),
};

export default logger;
