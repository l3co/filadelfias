/**
 * Tests for API service configuration and interceptors.
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock config
jest.mock('@/constants/config', () => ({
  config: {
    apiUrl: 'http://localhost:8000',
  },
}));

// We need to test the interceptors, so we'll create a mock axios instance
const mockRequestInterceptor = jest.fn();
const mockResponseInterceptor = jest.fn();
const mockResponseErrorInterceptor = jest.fn();

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn(() => ({
      interceptors: {
        request: {
          use: mockRequestInterceptor,
        },
        response: {
          use: mockResponseInterceptor,
        },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('axios instance creation', () => {
    it('should create axios instance with correct baseURL', () => {
      // Re-import to trigger module initialization
      jest.isolateModules(() => {
        require('../api');
      });

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should register request interceptor', () => {
      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockRequestInterceptor).toHaveBeenCalled();
    });

    it('should register response interceptor', () => {
      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockResponseInterceptor).toHaveBeenCalled();
    });
  });

  describe('request interceptor', () => {
    let requestInterceptorSuccess: (config: any) => Promise<any>;
    let requestInterceptorError: (error: any) => Promise<any>;

    beforeEach(() => {
      jest.isolateModules(() => {
        require('../api');
      });

      // Get the interceptor functions that were registered
      const [successFn, errorFn] = mockRequestInterceptor.mock.calls[0];
      requestInterceptorSuccess = successFn;
      requestInterceptorError = errorFn;
    });

    it('should add Authorization header when token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-token-123');

      const config = { headers: {} };
      const result = await requestInterceptorSuccess(config);

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('access_token');
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should not add Authorization header when no token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const config = { headers: {} };
      const result = await requestInterceptorSuccess(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should reject on error', async () => {
      const error = new Error('Request error');

      await expect(requestInterceptorError(error)).rejects.toThrow('Request error');
    });
  });

  describe('response interceptor', () => {
    let responseInterceptorSuccess: (response: any) => any;
    let responseInterceptorError: (error: any) => Promise<any>;

    beforeEach(() => {
      jest.isolateModules(() => {
        require('../api');
      });

      // Get the interceptor functions that were registered
      const [successFn, errorFn] = mockResponseInterceptor.mock.calls[0];
      responseInterceptorSuccess = successFn;
      responseInterceptorError = errorFn;
    });

    it('should pass through successful response', () => {
      const response = { data: { message: 'success' }, status: 200 };

      const result = responseInterceptorSuccess(response);

      expect(result).toEqual(response);
    });

    it('should delete token on 401 error', async () => {
      const error = {
        response: { status: 401 },
      };

      await expect(responseInterceptorError(error)).rejects.toEqual(error);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
    });

    it('should not delete token on other errors', async () => {
      const error = {
        response: { status: 500 },
      };

      await expect(responseInterceptorError(error)).rejects.toEqual(error);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('should handle error without response', async () => {
      const error = new Error('Network error');

      await expect(responseInterceptorError(error)).rejects.toThrow('Network error');
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });
});
