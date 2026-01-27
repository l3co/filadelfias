import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../authStore';
import { api } from '@/services/api';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock api
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockUser = {
  id: '123',
  email: 'admin@test.com',
  name: 'Admin User',
  memberships: [
    {
      id: 'mem-1',
      tenant: {
        id: 'tenant-1',
        name: 'Igreja Central',
        slug: 'igreja-central',
      },
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  ],
};

const mockMemberUser = {
  id: '456',
  email: 'member@test.com',
  name: 'Member User',
  memberships: [
    {
      id: 'mem-2',
      tenant: {
        id: 'tenant-1',
        name: 'Igreja Central',
        slug: 'igreja-central',
      },
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  ],
};

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockToken = { access_token: 'test-token-123' };
      (api.post as jest.Mock).mockResolvedValueOnce({ data: mockToken });
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-token-123');

      await useAuthStore.getState().login('admin@test.com', 'password123');

      expect(api.post).toHaveBeenCalledWith(
        '/auth/login',
        'username=admin%40test.com&password=password123',
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'test-token-123');
    });

    it('should throw error on login failure', async () => {
      const error = new Error('Invalid credentials');
      (api.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        useAuthStore.getState().login('wrong@email.com', 'wrongpass')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear token and reset state', async () => {
      // Set authenticated state first
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      await useAuthStore.getState().logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should authenticate when valid token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('valid-token');
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should not authenticate when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it('should clear token and reset state on API error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('invalid-token');
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().checkAuth();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('getCurrentTenant', () => {
    it('should return tenant when user has memberships', () => {
      useAuthStore.setState({ user: mockUser });

      const tenant = useAuthStore.getState().getCurrentTenant();

      expect(tenant).toEqual({
        id: 'tenant-1',
        name: 'Igreja Central',
        slug: 'igreja-central',
      });
    });

    it('should return null when user is null', () => {
      useAuthStore.setState({ user: null });

      const tenant = useAuthStore.getState().getCurrentTenant();

      expect(tenant).toBeNull();
    });

    it('should return null when user has no memberships', () => {
      useAuthStore.setState({
        user: { ...mockUser, memberships: [] },
      });

      const tenant = useAuthStore.getState().getCurrentTenant();

      expect(tenant).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      useAuthStore.setState({ user: mockUser });

      const result = useAuthStore.getState().isAdmin();

      expect(result).toBe(true);
    });

    it('should return true for OWNER role', () => {
      const ownerUser = {
        ...mockUser,
        memberships: [{ ...mockUser.memberships[0], role: 'OWNER' }],
      };
      useAuthStore.setState({ user: ownerUser });

      const result = useAuthStore.getState().isAdmin();

      expect(result).toBe(true);
    });

    it('should return false for MEMBER role', () => {
      useAuthStore.setState({ user: mockMemberUser });

      const result = useAuthStore.getState().isAdmin();

      expect(result).toBe(false);
    });

    it('should return false when user is null', () => {
      useAuthStore.setState({ user: null });

      const result = useAuthStore.getState().isAdmin();

      expect(result).toBe(false);
    });

    it('should return false when user has no memberships', () => {
      useAuthStore.setState({
        user: { ...mockUser, memberships: [] },
      });

      const result = useAuthStore.getState().isAdmin();

      expect(result).toBe(false);
    });
  });
});
